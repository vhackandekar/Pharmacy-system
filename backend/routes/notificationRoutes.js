const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.post('/refill', notificationController.sendRefillNotification);
router.get('/:userId', notificationController.getUserNotifications);

module.exports = router;
