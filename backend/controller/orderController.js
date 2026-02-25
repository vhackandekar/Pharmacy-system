const Order = require('../schema/Order');
const Cart = require('../schema/Cart');
const Notification = require('../schema/Notification');

exports.placeOrder = async (req, res) => {
    try {
        const { cartId, userId, items } = req.body;

        let orderItems = [];
        if (cartId) {
            const cart = await Cart.findById(cartId).populate('items.medicineId');
            if (!cart) return res.status(404).json({ error: "Cart not found" });
            orderItems = cart.items.map(item => ({
                medicineId: item.medicineId._id,
                quantity: item.quantity,
                dosagePerDay: item.dosagePerDay || "1 tablet"
            }));
        } else if (items && Array.isArray(items) && items.length > 0) {
            orderItems = items.map(i => ({
                medicineId: i.medicineId,
                quantity: i.quantity || 1,
                dosagePerDay: i.dosagePerDay || "1 tablet"
            }));
        } else {
            return res.status(400).json({ error: 'No cartId or items provided' });
        }

        const order = new Order({
            userId,
            items: orderItems,
            totalAmount: req.body.totalAmount || 0,
            status: 'CONFIRMED'
        });

        await order.save();
        if (cartId) {
            const cart = await Cart.findById(cartId);
            if (cart) {
                cart.status = 'COMPLETED';
                await cart.save();
            }
        }

        // Save an admin notification and emit real-time event
        try {
            const adminNotif = new Notification({ recipientRole: 'ADMIN', type: 'order', message: `New order placed: ${order._id}` });
            await adminNotif.save();
        } catch (e) { console.error('notif save error', e); }

        try {
            if (global.io) global.io.to('admin').emit('order_created', order);
        } catch (e) { console.error('socket emit error', e); }

        // Run predictive refill analysis for this user so refill alerts (if any)
        // are generated immediately and emitted in real-time.
        try {
            const PredictiveRefillAgent = require('../Agents/PredictiveRefillAgent');
            PredictiveRefillAgent.analyzeAndAlert(userId).catch(err => console.error('predictive analyze error', err));
        } catch (e) { console.error('predictive agent call error', e); }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('items.medicineId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('items.medicineId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
