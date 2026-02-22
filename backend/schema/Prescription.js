const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    issuedBy: { type: String, required: true }, // Doctor name or authority
    validTill: { type: Date, required: true },
    imageUrl: { type: String }, // Path or URL to the prescription image
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
