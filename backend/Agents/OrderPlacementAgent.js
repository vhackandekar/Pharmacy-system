const Order = require('../schema/Order');
const Medicine = require('../schema/Medicine');
const InventoryLog = require('../schema/InventoryLog');
const User = require('../schema/User');
const Notification = require('../schema/Notification');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

class OrderPlacementAgent {
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        }
        if (process.env.GROQ_API_KEY) {
            this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
    }

    async processOrder(userId, items, providedTotalAmount) {
        try {
            let totalAmount = 0;
            const itemsWithPrices = [];

            for (const item of items) {
                const medicine = await Medicine.findById(item.medicineId);
                const price = medicine.price || 0;
                const cost = price * (item.quantity || 1);
                totalAmount += cost;

                itemsWithPrices.push({
                    medicineId: item.medicineId,
                    quantity: item.quantity || 1,
                    dosagePerDay: item.dosage || "As prescribed",
                    price: price
                });
            }

            const finalTotal = providedTotalAmount || totalAmount;

            // --- CALCULATE ESTIMATED END DATE VIA AI ---
            let estimatedEndDate = null;
            const prompt = `Based on the following items and current date (${new Date().toISOString()}), predict the single date when the USER will completely finish ALL these medications. Return ONLY the ISO date string.
            Items: ${JSON.stringify(itemsWithPrices)}`;

            // Choice 1: Groq
            if (this.groq) {
                try {
                    const chatCompletion = await this.groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                    });
                    estimatedEndDate = new Date(chatCompletion.choices[0].message.content.trim());
                } catch (e) {
                    console.error("Groq End Date Prediction Failed:", e.message);
                }
            }

            // Choice 2: Gemini (Fallback)
            if (!estimatedEndDate && this.geminiModel) {
                try {
                    const result = await this.geminiModel.generateContent(prompt);
                    estimatedEndDate = new Date(result.response.text().trim());
                } catch (e) {
                    console.error("Gemini End Date Prediction Failed:", e.message);
                }
            }

            // Fallback: Default 30 days
            if (!estimatedEndDate || isNaN(estimatedEndDate.getTime())) {
                estimatedEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            }

            const newOrder = new Order({
                userId,
                items: itemsWithPrices,
                totalAmount: finalTotal,
                status: 'CONFIRMED',
                estimatedEndDate: estimatedEndDate
            });

            const savedOrder = await newOrder.save();

            for (const item of items) {
                const medicine = await Medicine.findByIdAndUpdate(item.medicineId, {
                    $inc: { stock: -(item.quantity || 1) }
                }, { new: true });

                await new InventoryLog({
                    medicineId: item.medicineId,
                    change: -(item.quantity || 1),
                    reason: 'ORDER_PLACED'
                }).save();

                if (medicine.stock < 10 && !medicine.lowStockNotified && process.env.N8N_REFILL_WEBHOOK_URL) {
                    axios.post(process.env.N8N_REFILL_WEBHOOK_URL, {
                        type: 'STOCK_ALERT',
                        medicineName: medicine.name,
                        stockLeft: medicine.stock
                    }).then(async () => {
                        await Medicine.findByIdAndUpdate(item.medicineId, { lowStockNotified: true });
                    }).catch(err => console.error("Low Stock Trigger Failed:", err.message));
                }
            }

            const user = await User.findById(userId);
            if (process.env.N8N_ORDER_WEBHOOK_URL) {
                axios.post(process.env.N8N_ORDER_WEBHOOK_URL, {
                    orderId: savedOrder._id,
                    userId,
                    phone: user.phone,
                    status: 'FULFILLMENT_REQUESTED'
                }).catch(err => console.error("n8n Trigger Failed:", err.message));
            }

            // Create notification in DB
            await new Notification({
                userId,
                type: 'order',
                message: `Your order for ${itemsWithPrices.map(i => i.medicineId.name).join(', ')} has been confirmed! Order ID: ${savedOrder._id}`
            }).save();

            return { success: true, orderId: savedOrder._id, message: "Order placed successfully." };
        } catch (error) {
            console.error("OrderPlacementAgent Error:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new OrderPlacementAgent();
