const express = require('express');
const router = express.Router();
const webhookController = require('../controller/webhookController');

router.post('/order', webhookController.orderFulfillment);
router.post('/refill-alert', webhookController.refillAlert);

module.exports = router;
