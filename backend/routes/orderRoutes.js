const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.post('/place', orderController.placeOrder);
router.get('/history/:userId', orderController.getHistory);
router.get('/admin', orderController.getAdminOrders);

module.exports = router;
