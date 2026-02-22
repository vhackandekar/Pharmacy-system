const Medicine = require('../schema/Medicine');
const Prescription = require('../schema/Prescription');

class SafetyAgent {
    async validateOrder(userId, items) {
        const results = [];
        let isApproved = true;
        const reasons = [];

        for (const item of items) {
            const medicine = await Medicine.findOne({ name: new RegExp(item.medicine_name, 'i') });

            if (!medicine) {
                isApproved = false;
                reasons.push(`Medicine ${item.medicine_name} not found in database.`);
                results.push({ medicine_name: item.medicine_name, status: 'REJECTED', reason: 'NOT_FOUND' });
                continue;
            }

            // 1. Check Stock
            if (medicine.stock < (item.quantity || 1)) {
                isApproved = false;
                reasons.push(`Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`);
                results.push({ medicine_name: medicine.name, status: 'REJECTED', reason: 'LOW_STOCK' });
                continue;
            }

            // 2. Check Prescription
            if (medicine.prescriptionRequired) {
                const validPrescription = await Prescription.findOne({
                    userId,
                    medicineId: medicine._id,
                    validTill: { $gt: new Date() }
                });

                if (!validPrescription) {
                    isApproved = false;
                    reasons.push(`Prescription required for ${medicine.name}. No valid record found.`);
                    results.push({ medicine_name: medicine.name, status: 'REJECTED', reason: 'PRESCRIPTION_MISSING' });
                    continue;
                }
            }

            results.push({ medicine_name: medicine.name, status: 'APPROVED', medicineId: medicine._id });
        }

        return {
            isApproved,
            reasons,
            details: results
        };
    }
}

module.exports = new SafetyAgent();
