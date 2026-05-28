import { useEffect, useState } from 'react';
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Trip Completed', body: 'Your trip to UDOM Campus was completed successfully.', time: '2 min ago', read: false },
  { id: 2, type: 'info', title: 'Rider Assigned', body: 'Juma Hassan is on his way to pick you up.', time: '10 min ago', read: false },
  { id: 3, type: 'alert', title: 'Payment Received', body: 'TZS 2,500 received via M-Pesa for trip #42.', time: '1 hr ago', read: true },
  { id: 4, type: 'info', title: 'Welcome!', body: 'Welcome to Boda Boda Digital. Safe riding!', time: '2 days ago', read: true },
];

const typeConfig = {
  success: { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  info: { icon: FiInfo, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  alert: { icon: FiAlertCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
};

export const NotificationsPage = () => {
  const { user, rider } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // In production this would fetch from API; using mock for now
    setNotifications(MOCK_NOTIFICATIONS);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const remove = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const name = user?.name || rider?.name || 'User';

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-gray-950 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FiBell size={22} className="text-green-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-green-600 hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiBell size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">You&apos;re all caught up, {name}!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={`rounded-xl p-4 flex gap-3 border transition ${
                    n.read
                      ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      : 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${
                        n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                      }`}>{n.title}</p>
                      <button
                        onClick={() => remove(n.id)}
                        className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                        title="Remove"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
