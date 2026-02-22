const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const Order = require('../schema/Order');
const RefillAlert = require('../schema/RefillAlert');
const User = require('../schema/User');
const Notification = require('../schema/Notification');
const axios = require('axios');

class PredictiveRefillAgent {
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        }
        if (process.env.GROQ_API_KEY) {
            this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
    }

    async analyzeAndAlert(userId) {
        try {
            const history = await Order.find({ userId }).populate('items.medicineId');
            if (!history || history.length === 0) return { message: "No history to analyze." };

            const prompt = `
        Analyze this user's medication history and predict when they will run out of EACH medicine.
        History: ${JSON.stringify(history)}
        Current Date: ${new Date().toISOString()}
        Return ONLY a JSON array: [{"medicineId": "string", "medicineName": "string", "daysLeft": number, "predictionReason": "string"}]
      `;

            let predictions = null;

            // Choice 1: Groq
            if (this.groq) {
                try {
                    const chatCompletion = await this.groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                        response_format: { type: "json_object" }
                    });
                    const content = JSON.parse(chatCompletion.choices[0].message.content);
                    predictions = content.predictions || content; // Handle varying JSON structures
                } catch (e) {
                    console.error("Groq Refill Prediction Failed:", e.message);
                }
            }

            // Choice 2: Gemini
            if (!predictions && this.geminiModel) {
                try {
                    const result = await this.geminiModel.generateContent(prompt);
                    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    predictions = JSON.parse(text);
                } catch (e) {
                    console.error("Gemini Refill Prediction Failed:", e.message);
                }
            }

            if (!predictions || !Array.isArray(predictions)) return [];

            const user = await User.findById(userId);
            for (const pred of predictions) {
                if (pred.daysLeft <= 5) {
                    const existingAlert = await RefillAlert.findOne({ userId, medicineId: pred.medicineId });

                    if (existingAlert && existingAlert.notified) {
                        continue; // Skip if already notified
                    }

                    await RefillAlert.findOneAndUpdate(
                        { userId, medicineId: pred.medicineId },
                        { daysLeft: pred.daysLeft, notified: true },
                        { upsert: true, new: true }
                    );

                    if (process.env.N8N_REFILL_WEBHOOK_URL) {
                        axios.post(process.env.N8N_REFILL_WEBHOOK_URL, {
                            userId: userId,
                            phone: user.phone,
                            medicineName: pred.medicineName,
                            daysLeft: pred.daysLeft
                        }, { timeout: 15000 }).catch(err => console.error("n8n Refill Trigger Failed:", err.message));
                    }

                    // Create notification in DB
                    await new Notification({
                        userId,
                        type: 'refill',
                        message: `Reminder: You will run out of ${pred.medicineName} in about ${pred.daysLeft} days. Don't forget to refill!`
                    }).save();
                } else {
                    // Reset notification flag if user has refilled
                    await RefillAlert.findOneAndUpdate(
                        { userId, medicineId: pred.medicineId },
                        { notified: false },
                        { upsert: false }
                    );
                }
            }

            return predictions;
        } catch (error) {
            console.error("PredictiveRefillAgent Error:", error);
            return [];
        }
    }
}

module.exports = new PredictiveRefillAgent();
