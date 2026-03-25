const User = require('../models/user');
const { getVapidPublicKey } = require('../services/pushNotificationService');

const notificationController = {
  /**
   * GET /api/notifications/vapid-public-key
   * Returns the VAPID public key so the client can subscribe to push.
   */
  async getVapidKey(req, res) {
    const key = getVapidPublicKey();
    if (!key) {
      return res.status(503).json({ success: false, error: 'Push notifications not configured on this server.' });
    }
    return res.status(200).json({ success: true, publicKey: key });
  },

  /**
   * POST /api/notifications/subscribe
   * Body: { endpoint, expirationTime, keys: { p256dh, auth } }
   * Saves or updates the push subscription for the authenticated user.
   */
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

      // Replace an existing subscription with the same endpoint, or add new
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

  /**
   * DELETE /api/notifications/unsubscribe
   * Body: { endpoint }
   * Removes the push subscription for the given endpoint.
   */
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
  }
};

module.exports = notificationController;
