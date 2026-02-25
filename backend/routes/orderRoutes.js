const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { verifyToken } = require('../middleware/auth');

router.post('/place', verifyToken, orderController.placeOrder);
router.get('/history/:userId', verifyToken, orderController.getHistory);
router.get('/admin/all', verifyToken, orderController.getAdminOrders);
router.put('/:orderId/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;
