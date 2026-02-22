const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
        quantity: { type: Number, required: true },
        dosagePerDay: { type: String, required: true }, // e.g., '2 tablets' or '10ml per day'
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['CONFIRMED', 'REJECTED', 'IN_WAREHOUSE', 'SHIPPED', 'FULFILLED'], default: 'CONFIRMED' },
    orderDate: { type: Date, default: Date.now },
    estimatedEndDate: { type: Date }, // Automatically calculated based on dosage & quantity
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
