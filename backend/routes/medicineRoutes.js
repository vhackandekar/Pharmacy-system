const express = require('express');
const router = express.Router();
const medicineController = require('../controller/medicineController');

router.get('/', medicineController.getAllMedicines);
router.post('/add', medicineController.addMedicine);
router.put('/update/:id', medicineController.updateMedicine);

module.exports = router;
