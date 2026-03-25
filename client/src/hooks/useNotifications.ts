import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

/**
 * Base64 url-to-uint8 format helper for VAPID keys.
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('iv_notif_count') || '0', 10);
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Checks and updates our subscription status silently on mount or when user changes
  const initPushSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setIsSubscribed(true);
        // Resync backend state silently
        await apiService.subscribePushNotifications(existing).catch(console.warn);
      }
    } catch (err) {
      console.error('Failed to initialize push subscription:', err);
    }
  }, []);

  const requestSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
       console.warn('Push API is not supported in this browser.');
       return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push Notifications denied by user.');
        return false;
      }
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        if (!VAPID_PUBLIC_KEY) {
           console.error('VAPID public key not found in environment.');
           return false;
        }
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }
      await apiService.subscribePushNotifications(subscription);
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Error during push subscription request:', err);
      return false;
    }
  };

  const removeSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await apiService.unsubscribePushNotifications(subscription.endpoint).catch(console.warn);
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications:', err);
    }
  };

  const clearUnread = useCallback(() => {
    localStorage.removeItem('iv_notif_count');
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    initPushSubscription();
  }, [initPushSubscription]);

  useEffect(() => {
    // Listen to our Service Worker's broadcast channel for inbound push alerts
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('inceptiq-notifications');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'MATCH_RECEIVED') {
          // Increase badge count
          setUnreadCount((prev) => {
            const current = parseInt(localStorage.getItem('iv_notif_count') || '0', 10);
            const active = prev > current ? prev : current;
            const updated = active + 1;
            localStorage.setItem('iv_notif_count', updated.toString());
            return updated;
          });

          // Track the specific post ID that matched so we can highlight it
          const postId = event.data.payload?.data?.postId;
          if (postId) {
            try {
              const matchedPosts = JSON.parse(localStorage.getItem('iv_matched_posts') || '[]');
              if (!matchedPosts.includes(postId)) {
                matchedPosts.push(postId);
                localStorage.setItem('iv_matched_posts', JSON.stringify(matchedPosts));
              }
            } catch (e) {
              console.error('Failed to parse matched posts', e);
            }
          }
        }
      };
      // Polling fallback to keep cross-tab in sync without event
      const interval = setInterval(() => {
        const local = parseInt(localStorage.getItem('iv_notif_count') || '0', 10);
        setUnreadCount((prev) => (local !== prev ? local : prev));
      }, 5000);

      return () => {
        channel.close();
        clearInterval(interval);
      };
    }
  }, []);

  return {
    unreadCount,
    isSubscribed,
    requestSubscription,
    removeSubscription,
    clearUnread
  };
}
