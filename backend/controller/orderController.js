const Order = require('../schema/Order');
const Cart = require('../schema/Cart');
const Medicine = require('../schema/Medicine');
const Notification = require('../schema/Notification');
const OrderPlacementAgent = require('../Agents/OrderPlacementAgent');
const PredictiveRefillAgent = require('../Agents/PredictiveRefillAgent');

exports.placeOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, cartId, paymentMethod } = req.body;

        let orderItems = items;
        let finalAmount = totalAmount;

        // 1. Resolve Items if cartId is provided
        if (cartId) {
            const cart = await Cart.findById(cartId).populate('items.medicineId');
            if (cart) {
                orderItems = cart.items.map(item => ({
                    medicineId: item.medicineId._id,
                    quantity: item.quantity,
                    dosagePerDay: "As directed"
                }));
                finalAmount = cart.items.reduce((sum, item) => sum + (item.medicineId.price * item.quantity), 0);
            }
        }

        // 2. Create Order 
        const order = new Order({
            userId,
            items: orderItems,
            totalAmount: finalAmount || totalAmount || 0,
            status: 'CONFIRMED',
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod || 'Manual Checkout'
        });

        await order.save();

        // 3. Mark cart as completed
        if (cartId) {
            await Cart.findByIdAndUpdate(cartId, { status: 'COMPLETED' });
        } else {
            await Cart.findOneAndUpdate(
                { userId, status: 'PENDING' },
                { $set: { status: 'COMPLETED' } }
            );
        }

        // 4. Save an admin notification and emit real-time event
        try {
            const adminNotif = new Notification({ recipientRole: 'ADMIN', type: 'order', message: `New order placed: ${order._id}` });
            await adminNotif.save();
            if (global.io) global.io.to('admin').emit('order_created', order);
        } catch (e) { console.error('notif/socket error', e); }

        // 5. Trigger Agent Fulfillment (Handles stock, prediction, and notifications)
        try {
            await OrderPlacementAgent.finalizeOrder(order._id);
        } catch (e) { console.error('Agent finalization error', e); }

        // 6. Run predictive refill analysis immediately
        PredictiveRefillAgent.analyzeAndAlert(userId).catch(err => console.error('predictive analyze error', err));

        res.status(201).json(order);
    } catch (error) {
        console.error("Manual Order Placement Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        res.json(order);
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
        const orders = await Order.find().populate('userId', 'name email').populate('items.medicineId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
