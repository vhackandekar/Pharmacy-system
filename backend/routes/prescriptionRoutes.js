const express = require('express');
const router = express.Router();
const prescriptionController = require('../controller/prescriptionController');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/validate', prescriptionController.validatePrescription);
router.post('/upload', upload.single('prescription'), prescriptionController.uploadPrescription);

module.exports = router;
