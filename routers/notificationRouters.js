const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');

router.get('/user/:userId', notificationController.getNotificationsByUserId);
router.patch('/:id/read', notificationController.markAsRead || notificationController.markNotificationAsRead);

module.exports = router;
