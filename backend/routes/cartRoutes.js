const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, cartController.getCart);
router.post('/create', verifyToken, cartController.createCart);
router.post('/add', verifyToken, cartController.addToCart);
router.put('/update', verifyToken, cartController.updateCart);
router.delete('/remove', verifyToken, cartController.removeFromCart);
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;
