const Notification = require('../schema/Notification');

exports.sendRefillNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const notification = new Notification({ userId, type: 'refill', message });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.params.userId,
            recipientRole: 'USER'
        }).sort({ sentAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipientRole: 'ADMIN'
        }).sort({ sentAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const query = role === 'ADMIN' ? { recipientRole: 'ADMIN' } : { userId, recipientRole: 'USER' };
        await Notification.updateMany(query, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
