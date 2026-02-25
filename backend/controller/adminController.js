const Medicine = require('../schema/Medicine');
const Order = require('../schema/Order');
const RefillAlert = require('../schema/RefillAlert');

exports.getStats = async (req, res) => {
    try {
        const totalMedicines = await Medicine.countDocuments();
        const lowStock = await Medicine.find({ stock: { $lt: 10 } });
        const pendingRefills = await RefillAlert.countDocuments({ notified: false });
        const ordersToday = await Order.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        res.json({
            totalMedicines,
            lowStockCount: lowStock.length,
            pendingRefills,
            ordersToday
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').populate('items.medicineId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.triggerRefillAnalysis = async (req, res) => {
    const User = require('../schema/User');
    const PredictiveRefillAgent = require('../Agents/PredictiveRefillAgent');

    try {
        console.log('Manually triggering predictive refill analysis...');
        const users = await User.find({ role: 'USER' });
        const results = [];

        for (const user of users) {
            const analysis = await PredictiveRefillAgent.analyzeAndAlert(user._id);
            results.push({
                userId: user._id,
                name: user.name,
                predictionsCount: Array.isArray(analysis) ? analysis.length : 0
            });
        }

        res.json({
            success: true,
            message: 'Manual refill analysis completed.',
            results
        });
    } catch (error) {
        console.error('Manual Refill Analysis Error:', error);
        res.status(500).json({ error: error.message });
    }
};
