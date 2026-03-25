const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@inceptiq.com';

let vapidConfigured = false;

const configureVapid = () => {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[PushNotifications] VAPID keys not set – push notifications disabled.');
    return false;
  }
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
    console.log('[PushNotifications] VAPID configured.');
    return true;
  } catch (err) {
    console.error('[PushNotifications] Failed to configure VAPID:', err.message);
    return false;
  }
};

// Attempt configuration on module load
configureVapid();

/**
 * Send a push notification to a single PushSubscription object.
 * Returns true on success, false on failure (expired subscriptions etc.)
 */
const sendNotification = async (subscription, payload) => {
  if (!configureVapid()) return false;
  if (!subscription || !subscription.endpoint) return false;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription has expired or is invalid – caller should remove it
      return 'expired';
    }
    console.error('[PushNotifications] Send failed:', err.statusCode, err.message);
    return false;
  }
};

/**
 * Send a "founder match" push notification to a user identified by their
 * pushSubscriptions array (fetched from the User model).
 *
 * @param {Array}  subscriptions  - user.pushSubscriptions array
 * @param {Object} matchData      - { matcherName, matcherTitle, matchScore }
 * @returns {Array} expired subscription endpoints to clean up
 */
const sendMatchNotification = async (subscriptions, matchData) => {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) return [];

  const { matcherName, matcherTitle, matchScore, postId } = matchData;
  const payload = {
    title: '🎉 New Founder Match on InceptIQ!',
    body: `Your idea matches ${matcherName ? `"${matcherName}"` : 'another founder'}'s post${matcherTitle ? ` — "${matcherTitle}"` : ''} with a ${matchScore}% score!`,
    icon: '/logo-main.png',
    badge: '/logo-main.png',
    data: {
      url: '/community',
      matchScore,
      postId
    }
  };

  const expiredEndpoints = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendNotification(sub, payload);
      if (result === 'expired') expiredEndpoints.push(sub.endpoint);
    })
  );

  return expiredEndpoints;
};

/**
 * Send a match notification to a user by their Mongoose User document.
 * Automatically cleans up expired subscriptions from the document.
 *
 * @param {Object} userDoc   - Mongoose User document (must have pushSubscriptions)
 * @param {Object} matchData - { matcherName, matcherTitle, matchScore }
 */
const notifyUser = async (userDoc, matchData) => {
  if (!userDoc || !Array.isArray(userDoc.pushSubscriptions) || userDoc.pushSubscriptions.length === 0) return;

  const expiredEndpoints = await sendMatchNotification(userDoc.pushSubscriptions, matchData);

  // Remove expired subscriptions to keep the array clean
  if (expiredEndpoints.length > 0) {
    userDoc.pushSubscriptions = userDoc.pushSubscriptions.filter(
      (sub) => !expiredEndpoints.includes(sub.endpoint)
    );
    try {
      await userDoc.save();
    } catch (err) {
      console.warn('[PushNotifications] Could not clean up expired subscriptions:', err.message);
    }
  }
};

module.exports = {
  sendMatchNotification,
  notifyUser,
  getVapidPublicKey: () => VAPID_PUBLIC_KEY || ''
};
