const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyToken, isAdmin, adminController.getStats);
router.get('/orders', verifyToken, isAdmin, adminController.getAllOrders);
router.put('/orders/:id', verifyToken, isAdmin, adminController.updateOrderStatus);

module.exports = router;
