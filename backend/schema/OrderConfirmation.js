const mongoose = require('mongoose');

const orderConfirmationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pendingOrderData: { type: Object, required: true },
    status: { type: String, enum: ['WAITING', 'CONFIRMED', 'EXPIRED', 'CANCELLED'], default: 'WAITING' },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) } // 10 minutes expiry
}, { timestamps: true });

// Create TTL index to automatically remove expired confirmations
orderConfirmationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OrderConfirmation', orderConfirmationSchema);
