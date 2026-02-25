const ConversationalAgent = require("../Agents/ConversationalAgent");
const SafetyAgent = require("../Agents/SafetyAgent");
const OrderPlacementAgent = require("../Agents/OrderPlacementAgent");
const PredictiveRefillAgent = require("../Agents/PredictiveRefillAgent");
const AgentLog = require('../schema/AgentLog');
const Medicine = require('../schema/Medicine');
const Cart = require('../schema/Cart');
const Prescription = require('../schema/Prescription');
const Order = require('../schema/Order');
const OrderConfirmation = require('../schema/OrderConfirmation');
const User = require('../schema/User');
const Notification = require('../schema/Notification');
const langfuse = require('../utils/langfuseClient');

exports.chat = async (req, res) => {
    const { userMessage, userHistory: chatHistory } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const orderHistory = await Order.find({ userId })
        .sort({ orderDate: -1 })
        .limit(5)
        .populate('items.medicineId', 'name');

    const userCart = await Cart.findOne({ userId, status: 'PENDING' })
        .populate('items.medicineId', 'name');

    try {
        // --- LANGFUSE TRACE START ---
        const trace = langfuse ? langfuse.trace({
            name: "Agent-Decision-Flow",
            userId: userId.toString(),
            metadata: { userMessage, userName: user?.name }
        }) : null;

        const availableMedicines = await Medicine.find({ stock: { $gt: 0 } }).select('name stock price prescriptionRequired dosage');
        const userPrescriptions = await Prescription.find({
            userId,
            validTill: { $gt: new Date() }
        }).populate('medicineId', 'name');

        // --- STEP 1: Conversational Agent AI (Decision Generation) ---
        const generation = trace ? trace.generation({
            name: "AI-Conversational-Decision",
            model: "Hybrid (Groq/Gemini/Llama3)",
            input: userMessage
        }) : null;

        const agentResult = await ConversationalAgent.processMessage(
            userMessage,
            chatHistory || [],
            orderHistory || [],
            availableMedicines,
            userPrescriptions,
            userCart || { items: [] },
            user?.name || "User"
        );

        if (generation) {
            generation.end({
                output: JSON.stringify(agentResult),
                metadata: { intent: agentResult.intent, confidence: agentResult.confidence }
            });
        }

        // --- STEP 2: Logic Handler based on Intent Decision ---
        const logicSpan = trace ? trace.span({
            name: "Intent-Execution-Decision",
            input: { intent: agentResult.intent, result: agentResult }
        }) : null;

        // A. INFORMATIONAL (No DB side-effects)
        const informationalIntents = ['VIEW_CART', 'GENERAL_QUERY', 'SYMPTOM_QUERY', 'HISTORY_QUERY', 'FALLBACK'];
        if (informationalIntents.includes(agentResult.intent)) {
            if (logicSpan) logicSpan.end({ output: "INFORMATIONAL_QUERY_COMPLETED" });
            if (langfuse) await langfuse.flushAsync();
            return res.json({ agentResponse: agentResult, workflowStatus: 'COMPLETED_CONVERSATION' });
        }

        // B. FINALIZING ORDER (CONFIRM_ORDER or ORDER_PAYMENT)
        if (agentResult.intent === 'CONFIRM_ORDER' || agentResult.intent === 'ORDER_PAYMENT') {
            const pendingConf = await OrderConfirmation.findOne({ userId, status: 'WAITING' }).sort({ createdAt: -1 });

            if (!pendingConf) {
                if (logicSpan) logicSpan.end({ output: "NO_PENDING_ORDER_FOUND" });
                if (langfuse) await langfuse.flushAsync();
                return res.json({ agentResponse: agentResult, workflowStatus: 'NO_PENDING_ORDER' });
            }

            const order = new Order({
                userId,
                items: pendingConf.pendingOrderData.items.map(item => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    dosagePerDay: item.dosage || "As directed"
                })),
                totalAmount: pendingConf.pendingOrderData.totalAmount,
                status: 'Placed',
                paymentStatus: 'Paid',
                paymentMethod: 'Agent Confirmed'
            });

            await order.save();
            pendingConf.status = 'CONFIRMED';
            await pendingConf.save();
            await Cart.findOneAndUpdate({ userId, status: 'PENDING' }, { $set: { items: [] } });

            // IMMEDIATELY FINALIZE (Since payment is skipped)
            const finalizeSpan = trace ? trace.span({ name: "Order-Finalization-Decision", input: { orderId: order._id } }) : null;
            await OrderPlacementAgent.finalizeOrder(order._id, trace);

            // Log post-order prediction call
            if (finalizeSpan) {
                finalizeSpan.update({ metadata: { refillAnalysisTriggered: true } });
                finalizeSpan.end({ output: "Order Finalized and Refill Analysis Triggered" });
            }

            if (logicSpan) logicSpan.end({ output: "ORDER_SUCCESSFULLY_PLACED" });
            if (langfuse) await langfuse.flushAsync();
            return res.json({ agentResponse: agentResult, order, workflowStatus: 'ORDER_PLACED' });
        }

        // C. CART REMOVAL
        if (agentResult.intent === 'REMOVE_FROM_CART') {
            const itemsToRemove = agentResult.items || [];
            let cart = await Cart.findOne({ userId, status: 'PENDING' });

            if (cart) {
                if (itemsToRemove.length > 0) {
                    for (const item of itemsToRemove) {
                        const medicine = await Medicine.findOne({ name: new RegExp(item.medicine_name, 'i') });
                        if (medicine) cart.items.pull({ medicineId: medicine._id });
                    }
                } else if (cart.items.length > 0) {
                    cart.items.pop(); // Remove last if none specified
                }
                await cart.save();
            }

            if (logicSpan) logicSpan.end({ output: "REMOVE_FROM_CART_COMPLETED" });
            if (langfuse) await langfuse.flushAsync();
            return res.json({ agentResponse: agentResult, workflowStatus: 'REMOVED_FROM_CART' });
        }

        // D. CANCEL ORDER
        if (agentResult.intent === 'CANCEL_ORDER') {
            const recentOrder = await Order.findOne({
                userId,
                status: { $nin: ['Cancelled', 'Delivered', 'FULFILLED'] }
            }).sort({ orderDate: -1 });

            if (recentOrder) {
                recentOrder.status = 'Cancelled';
                await recentOrder.save();
                agentResult.answer += ` (Your order #${recentOrder._id.toString().slice(-6)} has been cancelled successfully.)`;

                // Notify admin about cancellation
                await new Notification({
                    recipientRole: 'ADMIN',
                    type: 'order',
                    message: `Order #${recentOrder._id.toString().slice(-6)} has been CANCELLED by ${user?.name || 'a user'}.`
                }).save();
            }

            if (logicSpan) logicSpan.end({ output: "ORDER_CANCELLED" });
            if (langfuse) await langfuse.flushAsync();
            return res.json({ agentResponse: agentResult, workflowStatus: 'ORDER_CANCELLED' });
        }

        // E. REFILL (Suggestion of previous order)
        if (agentResult.intent === 'REFILL') {
            const lastOrder = orderHistory[0];
            if (!lastOrder) {
                agentResult.answer = "I couldn't find any previous orders to refill. What would you like to order today?";
                if (langfuse) await langfuse.flushAsync();
                return res.json({ agentResponse: agentResult, workflowStatus: 'NO_HISTORY' });
            }

            // Map last order to confirmation
            const refillItems = lastOrder.items.map(item => ({
                medicineId: item.medicineId._id,
                quantity: item.quantity,
                dosage: item.dosagePerDay
            }));

            await OrderConfirmation.deleteMany({ userId, status: 'WAITING' });
            await new OrderConfirmation({
                userId,
                pendingOrderData: { items: refillItems, totalAmount: lastOrder.totalAmount }
            }).save();

            agentResult.answer = `I've found your last order with ${lastOrder.items.length} items. Total is ₹${lastOrder.totalAmount}. Should I place this refill for you?`;

            // Create persistent log of the conversation
            await new AgentLog({
                userId,
                userMessage,
                agentResponse: agentResult.answer,
                intent: agentResult.intent,
                confidence: agentResult.confidence || 0,
                workflowStatus: 'AWAITING_CONFIRMATION'
            }).save();

            if (logicSpan) logicSpan.end({ output: "REFILL_AWAITING_CONFIRMATION" });
            if (langfuse) await langfuse.flushAsync();
            return res.json({ agentResponse: agentResult, workflowStatus: 'AWAITING_CONFIRMATION' });
        }

        // F. ACTIONABLE NEW REQUESTS (ORDER_MEDICINE or ADD_TO_CART)
        const actionableIntents = ['ORDER_MEDICINE', 'ADD_TO_CART'];
        if (actionableIntents.includes(agentResult.intent)) {

            const itemsToValidate = (agentResult.items && agentResult.items.length > 0)
                ? agentResult.items.map(item => ({
                    medicine_name: item.medicine_name,
                    quantity: item.quantity || 1,
                    dosage: item.dosage || (availableMedicines.find(m => m.name.toLowerCase() === item.medicine_name.toLowerCase())?.dosage)
                }))
                : [{
                    medicine_name: agentResult.medicine_name,
                    quantity: agentResult.quantity || 1,
                    dosage: agentResult.dosage || (availableMedicines.find(m => m.name.toLowerCase() === agentResult.medicine_name?.toLowerCase())?.dosage)
                }];

            const safetySpan = trace ? trace.span({ name: "Safety-Validation-Decision", input: { items: itemsToValidate } }) : null;
            const safetyResult = await SafetyAgent.validateOrder(userId, itemsToValidate);

            if (safetySpan) {
                safetySpan.end({
                    output: safetyResult.isApproved ? "Approved" : "Rejected",
                    metadata: { reasons: safetyResult.reasons }
                });
            }

            if (!safetyResult.isApproved) {
                const safetyNotice = ` (Safety Alert: ${safetyResult.reasons.join(', ')})`;

                if (trace) {
                    trace.score({ name: "Safety-Check", value: 0, comment: safetyResult.reasons.join(', ') });
                    if (langfuse) await langfuse.flushAsync();
                }

                return res.json({
                    agentResponse: {
                        ...agentResult,
                        answer: agentResult.answer.includes(safetyResult.reasons[0]) ? agentResult.answer : agentResult.answer + safetyNotice
                    },
                    workflowStatus: 'REJECTED_BY_SAFETY'
                });
            }

            // Execute ADD_TO_CART
            if (agentResult.intent === 'ADD_TO_CART') {
                let cart = await Cart.findOne({ userId, status: 'PENDING' });
                if (!cart) cart = new Cart({ userId, items: [], status: 'PENDING' });

                for (const item of itemsToValidate) {
                    const medicine = await Medicine.findOne({ name: new RegExp(item.medicine_name, 'i') });
                    if (medicine) {
                        const existingItemIdx = cart.items.findIndex(i => i.medicineId.toString() === medicine._id.toString());
                        if (existingItemIdx > -1) cart.items[existingItemIdx].quantity += (item.quantity || 1);
                        else cart.items.push({ medicineId: medicine._id, quantity: item.quantity || 1 });
                    }
                }
                await cart.save();
                if (logicSpan) logicSpan.end({ output: "ADDED_TO_CART" });
                if (langfuse) await langfuse.flushAsync();
                return res.json({ agentResponse: agentResult, workflowStatus: 'ADDED_TO_CART' });
            }

            // ORDER_MEDICINE Confirmation
            let calcTotal = 0;
            const confirmedItems = [];
            for (const details of safetyResult.details) {
                const medicine = await Medicine.findById(details.medicineId);
                if (medicine) {
                    const reqItem = itemsToValidate.find(i => i.medicine_name.toLowerCase() === medicine.name.toLowerCase());
                    const qty = reqItem?.quantity || 1;
                    const dosage = reqItem?.dosage || medicine.dosage || "As directed";
                    calcTotal += (medicine.price * qty);
                    confirmedItems.push({ medicineId: medicine._id, quantity: qty, dosage });
                }
            }

            await OrderConfirmation.deleteMany({ userId, status: 'WAITING' });
            await new OrderConfirmation({
                userId,
                pendingOrderData: { items: confirmedItems, totalAmount: calcTotal }
            }).save();

            if (logicSpan) logicSpan.end({ output: "AWAITING_CONFIRMATION" });
            if (langfuse) await langfuse.flushAsync();
            return res.json({ agentResponse: agentResult, workflowStatus: 'AWAITING_CONFIRMATION' });
        }

        // Create persistent log of the conversation
        await new AgentLog({
            userId,
            userMessage,
            agentResponse: agentResult.answer,
            intent: agentResult.intent,
            confidence: agentResult.confidence || 0,
            workflowStatus: 'PROCESSED'
        }).save();

        if (langfuse) await langfuse.flushAsync();
        return res.json({ agentResponse: agentResult, workflowStatus: 'PROCESSED' });

    } catch (error) {
        if (trace) trace.update({ statusMessage: error.message, metadata: { error: true } });
        if (langfuse) await langfuse.flushAsync();
        console.error("Agentic Flow Error:", error);
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
