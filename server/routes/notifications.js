const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const requireAuth = require('../middleware/requireAuth');

// GET /api/notifications/vapid-public-key – get VAPID public key (no auth required)
router.get('/vapid-public-key', notificationController.getVapidKey);

// POST /api/notifications/subscribe – save push subscription (requires auth)
router.post('/subscribe', requireAuth, notificationController.subscribe);

// DELETE /api/notifications/unsubscribe – remove push subscription (requires auth)
router.delete('/unsubscribe', requireAuth, notificationController.unsubscribe);

module.exports = router;
