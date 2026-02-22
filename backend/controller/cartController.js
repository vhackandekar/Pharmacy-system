const Cart = require('../schema/Cart');

exports.createCart = async (req, res) => {
    try {
        const cart = new Cart({ userId: req.body.userId, items: [] });
        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId, medicineId, quantity } = req.body;
        let cart = await Cart.findOne({ userId, status: 'PENDING' });
        if (!cart) cart = new Cart({ userId, items: [] });

        cart.items.push({ medicineId, quantity });
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCart = async (req, res) => {
    try {
        const { cartId, medicineId, quantity } = req.body;
        const cart = await Cart.findById(cartId);
        const item = cart.items.find(i => i.medicineId.toString() === medicineId);
        if (item) item.quantity = quantity;
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { cartId, medicineId } = req.body;
        const cart = await Cart.findById(cartId);
        cart.items = cart.items.filter(i => i.medicineId.toString() !== medicineId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
