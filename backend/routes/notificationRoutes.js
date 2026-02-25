const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/admin', notificationController.getAdminNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/refill', notificationController.sendRefillNotification);

module.exports = router;
