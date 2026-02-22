# n8n Workflow Integration Guide

This directory contains the JSON templates for the n8n workflows required by the Autonomous Pharmacy System.

## 1. Setup Instructions
1. Open your n8n instance.
2. Click on **Import from File** and select one of the JSON files in this directory.
3. Once imported, copy the **Webhook URL** from the "Webhook" node.
4. Paste the URL into your `backend/.env` file:
   ```env
   N8N_ORDER_WEBHOOK_URL=http://your-n8n-url/webhook/order-uuid
   N8N_REFILL_WEBHOOK_URL=http://your-n8n-url/webhook/refill-uuid
   ```

## 2. Included Workflows

### A. Order Fulfillment Workflow (`order_fulfillment.json`)
*   **Trigger:** Triggered by `OrderPlacementAgent.js` after a successful DB transaction.
*   **Nodes:**
    *   **Webhook**: Receives `orderId` and `userId`.
    *   **HTTP Request (Backend API)**: Fetches full order details from `/api/order/admin`.
    *   **Gmail/SendGrid**: Sends a confirmation email to the customer.
    *   **WhatsApp/SMS (Twilio)**: Sends a tracking link.
    *   **Slack/Discord**: Alerts the Warehouse Admin to pack the box.

### B. Predictive Refill Notification (`refill_notification.json`)
*   **Trigger:** Can be triggered by the Backend or run on an n8n schedule.
*   **Nodes:**
    *   **Webhook**: Receives `userId` and `medicineName`.
    *   **Gmail**: Sends a friendly reminder: "You're running low on Metformin! Click here to auto-refill."
    *   **Wait Node**: Waits 24 hours if the user hasn't replied.
    *   **Follow-up SMS**: Final reminder before stock runs out.

## 3. Webhook Payloads
The backend sends the following JSON payload to n8n:
```json
{
  "orderId": "65b2f...",
  "userId": "65b2e...",
  "status": "FULFILLMENT_REQUESTED",
  "items": [...]
}
```
