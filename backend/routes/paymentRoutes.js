const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { verifyToken } = require('../middleware/auth');

router.post('/process', verifyToken, paymentController.processPayment);

module.exports = router;
