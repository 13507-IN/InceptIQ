import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

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

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await apiService.getUnreadNotificationCount();
      setUnreadCount(count);
      localStorage.setItem('iv_notif_count', count.toString());
    } catch {
      // fall back to local count
    }
  }, []);

  const initPushSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setIsSubscribed(true);
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

  const clearUnread = useCallback(async () => {
    await apiService.markAllNotificationsAsRead().catch(() => {});
    setUnreadCount(0);
    localStorage.setItem('iv_notif_count', '0');
  }, []);

  useEffect(() => {
    initPushSubscription();
    fetchUnreadCount();
  }, [initPushSubscription, fetchUnreadCount]);

  useEffect(() => {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('inceptiq-notifications');
      channel.onmessage = (event) => {
        if (event.data && (event.data.type === 'MATCH_RECEIVED' || event.data.type === 'INTEREST_RECEIVED')) {
          fetchUnreadCount();

          const postId = event.data.payload?.data?.postId;
          if (postId && event.data.type === 'MATCH_RECEIVED') {
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
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 15000);

      return () => {
        channel.close();
        clearInterval(interval);
      };
    }
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    isSubscribed,
    requestSubscription,
    removeSubscription,
    clearUnread,
    fetchUnreadCount
  };
}
