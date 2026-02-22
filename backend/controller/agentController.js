const ConversationalAgent = require("../Agents/ConversationalAgent");
const SafetyAgent = require("../Agents/SafetyAgent");
const OrderPlacementAgent = require("../Agents/OrderPlacementAgent");
const PredictiveRefillAgent = require("../Agents/PredictiveRefillAgent");
const AgentLog = require('../schema/AgentLog');
const Medicine = require('../schema/Medicine');
const Cart = require('../schema/Cart');
const Prescription = require('../schema/Prescription');
const Order = require('../schema/Order');
const { Langfuse } = require("langfuse-node");

const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL,
});

const OrderConfirmation = require('../schema/OrderConfirmation');

exports.chat = async (req, res) => {
    const { userMessage } = req.body;
    const userId = req.user.id;
    let { userHistory } = req.body;

    // Fetch history from DB if not provided
    if (!userHistory || userHistory.length === 0) {
        userHistory = await Order.find({ userId })
            .sort({ orderDate: -1 })
            .limit(3)
            .populate('items.medicineId', 'name');
    }

    // --- LANGFUSE TRACE START ---
    const trace = langfuse.trace({
        name: "pharmacy-agent-flow",
        userId: userId,
        metadata: {
            userMessage: userMessage
        }
    });

    try {
        // --- STEP 1: Conversational Agent ---
        const generation = trace.generation({
            name: "ConversationalAgent",
            model: "gemini-2.0-flash",
            input: userMessage
        });

        const availableMedicines = await Medicine.find({ stock: { $gt: 0 } }).select('name stock price prescriptionRequired');
        const userPrescriptions = await Prescription.find({
            userId,
            validTill: { $gt: new Date() }
        }).populate('medicineId', 'name');

        const agentResult = await ConversationalAgent.processMessage(userMessage, userHistory || [], availableMedicines, userPrescriptions);

        generation.end({
            output: JSON.stringify(agentResult)
        });

        // Initial Logging
        await new AgentLog({
            agentName: "ConversationalAgent",
            action: "interpret_intent",
            decision: JSON.stringify(agentResult)
        }).save();

        // --- SPECIAL HANDLING: CONFIRM_ORDER Intent ---
        if (agentResult.intent === 'CONFIRM_ORDER') {
            const pendingConf = await OrderConfirmation.findOne({ userId, status: 'WAITING' }).sort({ createdAt: -1 });

            if (!pendingConf) {
                const rawAnswer = "I don't see any pending orders to confirm. What would you like to buy?";
                const translatedAnswer = await ConversationalAgent.translateMessage(rawAnswer, agentResult.language);
                return res.json({
                    agentResponse: {
                        ...agentResult,
                        answer: translatedAnswer
                    },
                    workflowStatus: 'NO_PENDING_ORDER'
                });
            }

            // Execute the saved order data
            const orderResult = await OrderPlacementAgent.processOrder(
                userId,
                pendingConf.pendingOrderData.items,
                null
            );

            // Mark confirmation as used
            pendingConf.status = 'CONFIRMED';
            await pendingConf.save();

            // Run Predictive Refill
            const refillPredictions = await PredictiveRefillAgent.analyzeAndAlert(userId);

            await langfuse.flushAsync();

            const rawSuccessMsg = `Confirmed! I've placed your order for ${pendingConf.pendingOrderData.medicineName}. Your delivery is being scheduled.`;
            const translatedSuccessMsg = await ConversationalAgent.translateMessage(rawSuccessMsg, agentResult.language);

            return res.json({
                agentResponse: {
                    ...agentResult,
                    answer: translatedSuccessMsg
                },
                orderId: orderResult.orderId,
                refillAlerts: refillPredictions,
                workflowStatus: 'ORDER_SUCCESS'
            });
        }

        // If intent is not related to ordering, just return the agent's answer
        if (agentResult.intent !== 'ORDER_MEDICINE' && agentResult.intent !== 'REFILL') {
            await langfuse.flushAsync();
            return res.json({
                agentResponse: agentResult,
                workflowStatus: 'COMPLETED_CONVERSATION'
            });
        }

        // --- STEP 2: Safety Agent ---
        const safetySpan = trace.span({
            name: "SafetyAgent",
            input: { medicine: agentResult.medicine_name, quantity: agentResult.quantity }
        });

        const itemsToValidate = [{
            medicine_name: agentResult.medicine_name,
            quantity: agentResult.quantity || 1,
            dosage: agentResult.dosage
        }];

        const safetyResult = await SafetyAgent.validateOrder(userId, itemsToValidate);

        safetySpan.end({
            output: JSON.stringify(safetyResult)
        });

        await new AgentLog({
            agentName: "SafetyAgent",
            action: "safety_check",
            decision: JSON.stringify(safetyResult)
        }).save();

        if (!safetyResult.isApproved) {
            await langfuse.flushAsync();
            const rawSafetyMsg = `I cannot complete your order. Reasons: ${safetyResult.reasons.join(', ')}`;
            const translatedSafetyMsg = await ConversationalAgent.translateMessage(rawSafetyMsg, agentResult.language);
            return res.json({
                agentResponse: {
                    ...agentResult,
                    answer: translatedSafetyMsg
                },
                workflowStatus: 'REJECTED_BY_SAFETY'
            });
        }

        // --- STEP 3: Instead of executing order, ask for CONFIRMATION ---

        // Calculate estimated price for the confirmation message
        const medicine = await Medicine.findOne({ name: new RegExp(agentResult.medicine_name, 'i') });
        const estimatedPrice = (medicine ? medicine.price : 0) * (agentResult.quantity || 1);

        const orderData = {
            items: safetyResult.details.map(d => ({
                medicineId: d.medicineId,
                quantity: agentResult.quantity || 1,
                dosage: agentResult.dosage
            })),
            medicineName: agentResult.medicine_name,
            totalAmount: estimatedPrice
        };

        // Clear any old waiting confirmations first
        await OrderConfirmation.deleteMany({ userId, status: 'WAITING' });

        // Save for later
        await new OrderConfirmation({
            userId,
            pendingOrderData: orderData
        }).save();

        await langfuse.flushAsync();

        const rawConfirmationMsg = `I've prepared an order for ${agentResult.quantity || 1}x ${agentResult.medicine_name}. The estimated total is ₹${estimatedPrice}. Should I go ahead and place this order for you?`;
        const translatedConfirmationMsg = await ConversationalAgent.translateMessage(rawConfirmationMsg, agentResult.language);

        return res.json({
            agentResponse: {
                ...agentResult,
                answer: translatedConfirmationMsg
            },
            workflowStatus: 'AWAITING_CONFIRMATION'
        });

    } catch (error) {
        trace.update({
            statusMessage: error.message,
            metadata: { error: true }
        });
        await langfuse.flushAsync();
        console.error("Multi-Agent Flow Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await AgentLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
