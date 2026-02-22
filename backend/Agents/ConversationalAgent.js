const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

class ConversationalAgent {
    constructor() {
        // Initialize Gemini
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        }

        // Initialize Groq
        if (process.env.GROQ_API_KEY) {
            this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
    }

    async processMessage(userMessage, userHistory, availableMedicines, userPrescriptions) {
        const prompt = `
      You are the Conversational Agent for an Autonomous Agentic AI Pharmacy System.
      Your primary role is to understand user intent, extract structured data, and answer informational questions using user history.
      You MUST NOT perform safety checks, inventory updates, or order placement.
      
      LANGUAGE INSTRUCTION:
      - Detect the language of the 'User Message'.
      - You MUST provide the 'answer' in the SAME LANGUAGE as the 'User Message'.
      - For example, if the user asks in Marathi, your 'answer' must be in Marathi. If in Hindi, respond in Hindi.
      - Keep the technical fields (intent, medicine_name, etc.) in English.

      INPUTS:
      1. User Message: "${userMessage}"
      2. User Context (Recent Orders): ${JSON.stringify(userHistory)}
      3. Available Medicines (Inventory): ${JSON.stringify(availableMedicines)}
      4. User's Valid Prescriptions on File: ${JSON.stringify(userPrescriptions)}

      2. CORE RESPONSIBILITIES:
      1. Intent Detection: Classify the user message into exactly one of: 
         - ORDER_MEDICINE: User wants to buy a specific medicine.
         - REFILL: User wants to refill a previous order (implies looking at history).
         - CONFIRM_ORDER: User says "yes", "confirm", "ok", "go ahead", "हो", "हाँ" or similar to a pending order confirmation prompt.
         - SYMPTOM_QUERY: User mentions symptoms (e.g., "headache"). Provide suitable tablets or medicines according to your knowledge which is in stock and available in database.
         - HISTORY_QUERY: User asks about their past orders/medicines.
         - GENERAL_QUERY: General questions about the pharmacy/policies/etc.
         - FALLBACK: Ambiguous, unclear, or missing critical info.

      2. Prescription Awareness:
         - If a medicine requires a prescription (check 'Available Medicines'), check if the user already has a valid one in 'User's Valid Prescriptions on File'.
         - If yes, acknowledge that you see it on file in your 'answer'.
         - If no, and the medicine requires it, politely inform the user that a prescription upload is required.

      3. Entity Extraction:
         - Extract 'medicine_name', 'dosage', 'quantity', 'symptom' where applicable.

      4. Symptom Handling:
         - Search through the 'Available Medicines' list.
         - Suggest a suitable medicine in 'answer' ONLY if found in the list.

      STRICT OUTPUT FORMAT:
      Return ONLY a valid JSON object. No markdown.
      {
        "intent": "string",
        "answer": "string (IN THE USER'S LANGUAGE)",
        "language": "string (e.g., 'English', 'Marathi', 'Hindi')",
        "medicine_name": "string | null",
        "dosage": "string | null",
        "quantity": "number | null",
        "symptom": "string | null",
        "confidence": "number",
        "missing_fields": []
      }
    `;

        // --- STEP 1: TRY GROQ (High Quota Free Tier) ---
        if (this.groq) {
            try {
                console.log("Using Groq for processing...");
                const chatCompletion = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" }
                });

                let result = JSON.parse(chatCompletion.choices[0].message.content);
                console.log("Groq Agent Output:", result.intent);
                return result;
            } catch (groqError) {
                console.error("Groq Failed, switching to Gemini/Fallback:", groqError.message);
            }
        }

        // --- STEP 2: TRY GEMINI (Fallback) ---
        if (this.geminiModel) {
            try {
                console.log("Using Gemini for processing...");
                const result = await this.geminiModel.generateContent(prompt);
                const response = await result.response;
                let text = response.text();
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(text);
            } catch (geminiError) {
                console.error("Gemini Failed:", geminiError.message);
            }
        }

        // --- STEP 3: HARD DETERMINISTIC FALLBACK (Last Resort) ---
        console.log("Using Hard Fallback logic...");
        const lowerMsg = userMessage.toLowerCase();
        if (lowerMsg.includes('refill')) {
            return {
                intent: "REFILL",
                answer: "I see you want a refill. Looking at your history...",
                language: "English",
                medicine_name: userHistory.length > 0 ? (userHistory[0].items[0].medicineId.name || "Medicine") : null,
                confidence: 0.8,
                missing_fields: []
            };
        }

        return {
            intent: "FALLBACK",
            answer: "I'm having trouble connecting to my AI engines. Please try again or type 'help'.",
            language: "English",
            medicine_name: null,
            dosage: null,
            quantity: null,
            symptom: null,
            confidence: 0,
            missing_fields: []
        };
    }

    async translateMessage(message, targetLanguage) {
        if (!targetLanguage || targetLanguage.toLowerCase() === 'english') return message;

        const prompt = `Translate the following pharmacy-related message into ${targetLanguage}. 
        Keep medicine names and technical numbers as they are. 
        Return ONLY the translated text, no explanation.
        Message: "${message}"`;

        if (this.groq) {
            try {
                const completion = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                });
                return completion.choices[0].message.content.trim();
            } catch (e) {
                console.error("Groq Translation Failed:", e.message);
            }
        }

        if (this.geminiModel) {
            try {
                const result = await this.geminiModel.generateContent(prompt);
                return result.response.text().trim();
            } catch (e) {
                console.error("Gemini Translation Failed:", e.message);
            }
        }

        return message; // Fallback to original
    }
}

module.exports = new ConversationalAgent();
