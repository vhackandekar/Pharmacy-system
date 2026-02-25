const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config()

class ConversationalAgent {
    constructor() {
        // Initialize Gemini
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Using a more stable model identifier
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }

        // Initialize Groq
        if (process.env.GROQ_API_KEY) {
            this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
    }

    async processMessage(userMessage, chatHistory, orderHistory, availableMedicines, userPrescriptions, userCart, userName) {
        let lastError = "";
        const prompt = `
      SYSTEM ROLE:
You are an **Expert AI Pharmacist** named Dr. Saahil (or simply "The Pharmacist").
You are not a robotic assistant; you are a licensed, ethical, and deeply empathetic professional.
Your goal is to provide clinical precision with a warm, human touch.

────────────────────────────────
PERSONALITY & TONE:
- **Be Human**: Walk into the conversation like a real person. Use natural transitions.
- **Empathy First**: If a user is in pain or anxious, acknowledge it. (e.g., "I'm sorry you're feeling this way.")
- **Avoid "Bot-speak"**: Never say "As an AI model" or "I am programmed to".
- **Conversational Continuity**: Use the provided History to remember what was just discussed. If they ask a follow-up, don't repeat your introductory greeting.
- **Language**: Respond EXCLUSIVELY in the language used by the user in their current message. If they speak English, reply ONLY in English. If they speak Hindi, reply ONLY in Hindi. Do NOT mix languages unless the user does.

────────────────────────────────
INPUT DATA (TRUSTED SOURCES):
1. **User Name**: ${userName}
2. **User Message**: "${userMessage}"
3. **Conversation History**:
${JSON.stringify(chatHistory)}

4. **Medical Context**:
   - Inventory: ${JSON.stringify(availableMedicines)}
   - User's Past Orders: ${JSON.stringify(orderHistory)}
   - Current Cart: ${JSON.stringify(userCart)}
   - Prescriptions on File: ${JSON.stringify(userPrescriptions)}
────────────────────────────────

CORE OPERATIONAL RULES:
1. **Clinical Safety**: NEVER suggest a medicine not in Inventory. NEVER ignore a prescription requirement.
2. **Intent Precision**: Classify the user action into ONE of these: 
   - ORDER_MEDICINE (Step 1 of ordering)
   - ORDER_PAYMENT (Step 2/Confirmation of ordering)
   - ADD_TO_CART, REMOVE_FROM_CART, VIEW_CART
   - SYMPTOM_QUERY, HISTORY_QUERY, GENERAL_QUERY, CANCEL_ORDER, REFILL
   - FALLBACK (If unsure)
3. **Order Placement Workflow (STRICT 2-STEP PROCESS)**:
   - **Step 1 (Inquiry/Review)**: When a user mentions a medicine or asks to buy/order something for the FIRST time, use the **ORDER_MEDICINE** intent. 
     - **Action**: Summarize the item, quantity, and total price.
     - **Question**: Ask: "Would you like me to go ahead and place this order for you?"
   - **Step 2 (Final Confirmation)**: When the user says "Yes", "Confirm", "Proceed", or "Place it" in response to your summary from Step 1, you MUST use the **ORDER_PAYMENT** intent.
     - **Action**: Conclude the interaction with a warm confirmation that the order has been placed.
   - **Critical Rule**: If you have already provided a price summary in the history, and the user's latest response is an affirmative (Yes/Confirm), you MUST switch to **ORDER_PAYMENT**. Do NOT use ORDER_MEDICINE again for an affirmative response.
4. **General Queries**: For health advice, provide general guidance + a disclaimer for severe cases.

📦 OUTPUT FORMAT (STRICT JSON ONLY):
{
  "intent": "Intent_Value",
  "answer": "Your natural, empathetic, and human-like response in the CORRECT language.",
  "total_price": number,
  "items": [{ "medicine_name": "string", "quantity": number, "dosage": "string" }],
  "confidence": number
}
    `;

        // --- MODEL CHAIN: GROQ (Primary) -> GEMINI (Strong Fallback) -> GROQ 8B (Last Resort) ---

        // 1. Primary: Groq Llama 3.3 70b
        if (this.groq) {
            try {
                console.log("Attempting Primary Model (Groq 70b)...");
                const chatCompletion = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" }
                });
                return JSON.parse(chatCompletion.choices[0].message.content);
            } catch (groqError) {
                lastError = `Groq 70b: ${groqError.message}`;
                console.warn(`Groq 70b Error: ${groqError.status} - ${groqError.message}`);
            }
        }

        // 2. Strong Fallback: Gemini (Multi-model support)
        if (this.geminiModel) {
            try {
                console.log("Attempting Fallback Model (Gemini)...");
                const result = await this.geminiModel.generateContent(prompt);
                const response = await result.response;
                let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(text);
            } catch (geminiError) {
                console.warn(`Gemini primary failed. Attempting secondary (gemini-pro-latest)...`);
                try {
                    const secondaryModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await secondaryModel.generateContent(prompt);
                    const response = await result.response;
                    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    return JSON.parse(text);
                } catch (e) {
                    lastError = `Gemini: ${e.message}`;
                    console.error(`All Gemini models failed: ${e.message}`);
                }
            }
        }

        // 3. Last Resort: Groq Llama 3.1 8b
        if (this.groq) {
            try {
                console.log("Attempting Last Resort Model (Groq 8b)...");
                const fallbackComp = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.1-8b-instant",
                    response_format: { type: "json_object" }
                });
                return JSON.parse(fallbackComp.choices[0].message.content);
            } catch (e) {
                console.error(`All Models Failed. Last error from Groq 8b: ${e.message}`);
            }
        }

        // --- STEP 3: LAST RESORT FALLBACK ---
        let errorHint = "";
        if (!this.groq && !this.geminiModel) errorHint = " (No API keys configured)";
        else if (lastError) errorHint = ` (Diagnostic: ${lastError})`;

        return {
            intent: "FALLBACK",
            answer: `I'm so sorry, but I'm having a technical moment. Could you please try again?${errorHint}`,
            items: [],
            confidence: 0
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
