const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const requireAuth = require('../middleware/requireAuth');

router.get('/vapid-public-key', notificationController.getVapidKey);

router.post('/subscribe', requireAuth, notificationController.subscribe);

router.delete('/unsubscribe', requireAuth, notificationController.unsubscribe);

router.get('/', requireAuth, notificationController.listNotifications);

router.get('/unread-count', requireAuth, notificationController.getUnreadCount);

router.put('/read-all', requireAuth, notificationController.markAllAsRead);

router.put('/:id/read', requireAuth, notificationController.markAsRead);

module.exports = router;
