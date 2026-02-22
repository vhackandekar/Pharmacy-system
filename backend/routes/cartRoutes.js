const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');

router.post('/create', cartController.createCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCart);
router.delete('/remove', cartController.removeFromCart);

module.exports = router;
