const Order = require('../schema/Order');
const Notification = require('../schema/Notification');

exports.orderFulfillment = async (req, res) => {
    try {
        const { orderId, status, userId } = req.body;
        console.log(`n8n Webhook: Updating Order ${orderId} and notifying Admin`);

        await Order.findByIdAndUpdate(orderId, { status: status });

        // CREATE ADMIN DASHBOARD ALERT
        await Notification.create({
            userId: userId || req.body.userId,
            recipientRole: 'ADMIN',
            type: 'order',
            message: `New Order Received! Order #${orderId} needs fulfillment.`
        });

        res.json({ success: true, message: `Status updated and Admin Alert created.` });
    } catch (error) {
        console.error("n8n Webhook Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.refillAlert = async (req, res) => {
    try {
        const { type, medicineName, userId, daysLeft, stockLeft } = req.body;
        console.log(`n8n Webhook: ${type || 'REFILL'} Alert received for ${medicineName}`);

        if (type === 'STOCK_ALERT') {
            await Notification.create({
                userId: null, // Global alert
                recipientRole: 'ADMIN',
                type: 'stock_alert',
                message: `URGENT: ${medicineName} is low on stock (${stockLeft} left).`
            });
        } else {
            await Notification.create({
                userId: userId,
                recipientRole: 'ADMIN',
                type: 'refill',
                message: `Refill Recommendation: User running low on ${medicineName} (${daysLeft} days left).`
            });
        }

        res.json({ status: "success", message: "Admin Dashboard alerted." });
    } catch (error) {
        console.error("Refill Webhook Error:", error);
        res.status(500).json({ error: error.message });
    }
};
