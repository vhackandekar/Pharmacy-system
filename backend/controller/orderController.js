const Order = require('../schema/Order');
const Cart = require('../schema/Cart');
const Medicine = require('../schema/Medicine');
const OrderPlacementAgent = require('../Agents/OrderPlacementAgent');

exports.placeOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, cartId } = req.body;

        let orderItems = items;
        let finalAmount = totalAmount;

        // 1. Resolve Items and calculate amount
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

        // 2. Create Order (Status defaults to 'Placed'/'Paid' in the new flow)
        const order = new Order({
            userId,
            items: orderItems,
            totalAmount: finalAmount,
            status: 'Placed',
            paymentStatus: 'Paid',
            paymentMethod: req.body.paymentMethod || 'Manual Checkout'
        });

        await order.save();

        // 3. Trigger Agent Fulfillment (Handles stock, prediction, and notifications)
        await OrderPlacementAgent.finalizeOrder(order._id);

        // 4. Cleanup Cart
        if (cartId) {
            await Cart.findByIdAndUpdate(cartId, { status: 'COMPLETED' });
        } else {
            await Cart.findOneAndUpdate(
                { userId, status: 'PENDING' },
                { $set: { items: [], status: 'COMPLETED' } }
            );
        }

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
        const orders = await Order.find().populate('userId').populate('items.medicineId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
