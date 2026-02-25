const Notification = require('../schema/Notification');

exports.sendRefillNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const notification = new Notification({ userId, type: 'refill', message });
        await notification.save();
        try {
            const NotificationModel = require('../schema/Notification');
            const populated = await NotificationModel.findById(notification._id).populate('userId', 'name email phone');
            if (global.io) {
                // Admin-facing alert listing customers
                global.io.to('admin').emit('refill_alert_admin', populated);
                // Send a direct message event to the user with the refill message
                if (userId) global.io.to(String(userId)).emit('refill_message', { message: populated.message, notification: populated });
            }
        } catch (e) { console.error('socket emit error', e); }
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ sentAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
