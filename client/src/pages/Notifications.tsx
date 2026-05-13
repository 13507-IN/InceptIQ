import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Loader2, AlertCircle, CheckCheck, Eye, Handshake, Sparkles, Target, Info } from 'lucide-react';
import { apiService } from '../services/api';
import { AppNotification } from '../types';

const typeIcons: Record<string, React.ReactNode> = {
  investor_interest: <Handshake className="h-4 w-4 text-emerald-400" />,
  founder_match: <Sparkles className="h-4 w-4 text-indigo-400" />,
  competitor_alert: <Target className="h-4 w-4 text-rose-400" />,
  system: <Info className="h-4 w-4 text-blue-400" />,
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.listNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const updated = await apiService.markNotificationAsRead(id);
    if (updated) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    const count = await apiService.markAllNotificationsAsRead();
    if (count > 0) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 text-sm mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-200 text-sm font-medium hover:bg-indigo-500/25 transition disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading notifications...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="text-gray-400 bg-gray-800/40 border border-gray-700/60 rounded-lg p-8 text-center">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">When investors show interest in your ideas or you get founder matches, they'll appear here.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`rounded-lg border p-4 transition-colors ${
                n.read
                  ? 'bg-gray-800/30 border-gray-700/40'
                  : 'bg-gray-800/60 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-gray-700/50 mt-0.5">
                  {typeIcons[n.type] || <Info className="h-4 w-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`text-sm font-semibold ${n.read ? 'text-gray-300' : 'text-white'}`}>
                        {n.title}
                      </h3>
                      <p className={`text-sm mt-1 ${n.read ? 'text-gray-500' : 'text-gray-400'}`}>
                        {n.body}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-1.5 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition flex-shrink-0"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Notifications;
