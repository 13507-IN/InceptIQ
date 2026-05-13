const User = require('../models/user');
const { getVapidPublicKey } = require('../services/pushNotificationService');
const notificationService = require('../services/notificationService');

const notificationController = {
  async getVapidKey(req, res) {
    const key = getVapidPublicKey();
    if (!key) {
      return res.status(503).json({ success: false, error: 'Push notifications not configured on this server.' });
    }
    return res.status(200).json({ success: true, publicKey: key });
  },

  async subscribe(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const { endpoint, expirationTime, keys } = req.body || {};

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ success: false, error: 'Invalid subscription object. Missing endpoint or keys.' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (!Array.isArray(user.pushSubscriptions)) user.pushSubscriptions = [];

      const existing = user.pushSubscriptions.findIndex(s => s.endpoint === endpoint);
      const newSub = { endpoint, expirationTime: expirationTime || null, keys: { p256dh: keys.p256dh, auth: keys.auth } };

      if (existing >= 0) {
        user.pushSubscriptions[existing] = newSub;
      } else {
        user.pushSubscriptions.push(newSub);
      }

      await user.save();

      return res.status(200).json({ success: true, message: 'Push subscription saved.' });
    } catch (error) {
      console.error('[Notifications] Subscribe failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to save push subscription.', message: error.message });
    }
  },

  async unsubscribe(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const { endpoint } = req.body || {};
      if (!endpoint) {
        return res.status(400).json({ success: false, error: 'Endpoint is required.' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.pushSubscriptions = (user.pushSubscriptions || []).filter(s => s.endpoint !== endpoint);
      await user.save();

      return res.status(200).json({ success: true, message: 'Push subscription removed.' });
    } catch (error) {
      console.error('[Notifications] Unsubscribe failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to remove push subscription.', message: error.message });
    }
  },

  async listNotifications(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const limit = parseInt(req.query.limit) || 50;
      const notifications = await notificationService.list(req.user.id, limit);
      return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      console.error('[Notifications] List failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to list notifications.', message: error.message });
    }
  },

  async getUnreadCount(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const count = await notificationService.getUnreadCount(req.user.id);
      return res.status(200).json({ success: true, count });
    } catch (error) {
      console.error('[Notifications] Unread count failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to get unread count.', message: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const { id } = req.params;
      const result = await notificationService.markAsRead(id, req.user.id);
      return res.status(200).json({ success: true, updated: result });
    } catch (error) {
      console.error('[Notifications] Mark as read failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to mark notification as read.', message: error.message });
    }
  },

  async markAllAsRead(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const count = await notificationService.markAllAsRead(req.user.id);
      return res.status(200).json({ success: true, updated: count });
    } catch (error) {
      console.error('[Notifications] Mark all as read failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to mark all as read.', message: error.message });
    }
  }
};

module.exports = notificationController;
