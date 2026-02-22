const Prescription = require('../schema/Prescription');

exports.validatePrescription = async (req, res) => {
    try {
        const { userId, medicineId } = req.query;
        const prescription = await Prescription.findOne({ userId, medicineId });
        if (!prescription) return res.json({ valid: false });

        const now = new Date();
        if (prescription.validTill < now) return res.json({ valid: false, message: "Expired" });

        res.json({ valid: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadPrescription = async (req, res) => {
    try {
        const { userId, medicineId, issuedBy, validTill } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const prescription = new Prescription({
            userId,
            medicineId,
            issuedBy,
            validTill,
            imageUrl
        });

        await prescription.save();
        res.status(201).json({ success: true, prescription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
