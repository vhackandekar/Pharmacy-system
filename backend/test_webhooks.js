const axios = require('axios');
require('dotenv').config();

const orderWebhook = process.env.N8N_ORDER_WEBHOOK_URL;
const refillWebhook = process.env.N8N_REFILL_WEBHOOK_URL;

async function testWebhooks() {
    console.log("🚀 Starting n8n Webhook Test...");

    const TEST_PHONE = "+919284505942";
    const TEST_ORDER_ID = "6996d406cbbdd35ad87b022d";
    const TEST_USER_ID = "6995949ee117593136236eed";

    // 1. Test Order Fulfillment Webhook
    if (orderWebhook) {
        try {
            console.log(`📡 Sending test payload to Order Webhook: ${orderWebhook}`);
            const orderPayload = {
                orderId: TEST_ORDER_ID,
                userId: TEST_USER_ID,
                phone: TEST_PHONE,
                status: 'FULFILLMENT_REQUESTED'
            };
            await axios.post(orderWebhook, orderPayload);
            console.log("✅ Order Webhook triggered successfully!");
        } catch (error) {
            console.error("❌ Order Webhook failed:", error.response?.data?.message || error.message);
        }
    } else {
        console.warn("⚠️ N8N_ORDER_WEBHOOK_URL is not defined in .env");
    }

    console.log("\n-------------------\n");

    // 2. Test Refill Alert Webhook
    if (refillWebhook) {
        try {
            console.log(`📡 Sending test payload to Refill Webhook: ${refillWebhook}`);
            const refillPayload = {
                userId: TEST_USER_ID,
                phone: TEST_PHONE,
                medicineName: "Metformin 500mg",
                daysLeft: 3
            };
            await axios.post(refillWebhook, refillPayload);
            console.log("✅ Refill Webhook triggered successfully!");
        } catch (error) {
            console.error("❌ Refill Webhook failed:", error.response?.data?.message || error.message);
        }
    } else {
        console.warn("⚠️ N8N_REFILL_WEBHOOK_URL is not defined in .env");
    }

    console.log("\n🏁 Test Complete. Check your n8n dashboard for execution logs.");
}

testWebhooks();
