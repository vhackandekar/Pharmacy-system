const Order = require('../schema/Order');

exports.processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod, cardDetails } = req.body;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ error: "Order not found" });

        // MOCK PAYMENT LOGIC
        console.log(`Processing ${paymentMethod} for Order ${orderId}...`);

        // Simulating 2 second delay for payment gateway
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update Order to PAID (if we had a paid status) or mark as FULFILLED
        order.status = 'FULFILLED';
        await order.save();

        res.json({
            success: true,
            message: "Payment successful. Order is now being fulfilled.",
            transactionId: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
