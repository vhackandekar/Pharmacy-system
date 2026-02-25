const Cart = require('../schema/Cart');
const Medicine = require('../schema/Medicine');

exports.getCart = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : req.query.userId;
        let cart = await Cart.findOne({ userId, status: 'PENDING' }).populate('items.medicineId');
        if (!cart) {
            return res.json({ items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

        // Stock check
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) return res.status(404).json({ error: "Medicine not found" });
        if (medicine.stock < quantity) {
            return res.status(400).json({ error: `Insufficient stock. Only ${medicine.stock} available.` });
        }

        let cart = await Cart.findOne({ userId, status: 'PENDING' });
        if (!cart) cart = new Cart({ userId, items: [] });

        const existingItem = cart.items.find(i => i.medicineId.toString() === medicineId);
        if (existingItem) {
            const totalQty = existingItem.quantity + quantity;
            if (medicine.stock < totalQty) {
                return res.status(400).json({ error: `Insufficient stock in total. Only ${medicine.stock} available.` });
            }
            existingItem.quantity = totalQty;
        } else {
            cart.items.push({ medicineId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCart = async (req, res) => {
    try {
        const { cartId, medicineId, quantity } = req.body;
        const userId = req.user ? req.user.id : req.body.userId;

        // Stock check
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) return res.status(404).json({ error: "Medicine not found" });
        if (medicine.stock < quantity) {
            return res.status(400).json({ error: `Insufficient stock. Only ${medicine.stock} available.` });
        }

        let cart;
        if (cartId) {
            cart = await Cart.findById(cartId);
        } else {
            cart = await Cart.findOne({ userId, status: 'PENDING' });
        }

        if (!cart) return res.status(404).json({ error: "Cart not found" });

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
        const userId = req.user ? req.user.id : req.body.userId;

        let cart;
        if (cartId) {
            cart = await Cart.findById(cartId);
        } else {
            cart = await Cart.findOne({ userId, status: 'PENDING' });
        }

        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.items = cart.items.filter(i => i.medicineId.toString() !== medicineId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { cartId } = req.body;
        const userId = req.user ? req.user.id : req.body.userId;
        let cart;
        if (cartId) cart = await Cart.findById(cartId);
        else cart = await Cart.findOne({ userId, status: 'PENDING' });

        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
