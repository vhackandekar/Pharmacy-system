const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    unitType: { type: String, required: true }, // e.g., 'tablets', 'ml'
    stock: { type: Number, required: true, default: 0 },
    lowStockNotified: { type: Boolean, default: false },
    price: { type: Number, required: true, default: 0 },
    prescriptionRequired: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
