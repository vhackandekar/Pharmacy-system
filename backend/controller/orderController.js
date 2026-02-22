const Order = require('../schema/Order');
const Cart = require('../schema/Cart');

exports.placeOrder = async (req, res) => {
    try {
        const { cartId, userId } = req.body;
        const cart = await Cart.findById(cartId).populate('items.medicineId');
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const order = new Order({
            userId,
            items: cart.items.map(item => ({
                medicineId: item.medicineId._id,
                quantity: item.quantity,
                dosagePerDay: "1 tablet" // Placeholder
            })),
            totalAmount: 100, // Placeholder
            status: 'CONFIRMED'
        });

        await order.save();
        cart.status = 'COMPLETED';
        await cart.save();

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
