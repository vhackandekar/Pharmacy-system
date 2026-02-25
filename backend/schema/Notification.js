const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    recipientRole: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    type: { type: String, enum: ['refill', 'order', 'stock_alert'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
