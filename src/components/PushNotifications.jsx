import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { FiBell, FiX, FiCheck, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const showNotification = useCallback((options) => {
    const { title, body, icon, tag, data, onClick } = options;
    
    // In-app notification
    const id = Date.now();
    setNotifications(prev => [...prev, { 
      id, 
      title, 
      body, 
      icon, 
      tag,
      data,
      timestamp: new Date(),
      read: false
    }]);

    // System notification (if permitted)
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: icon || '/icon-192x192.png',
        tag,
        requireInteraction: true,
        data
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick(data);
          notification.close();
        };
      }
    }

    // Auto-remove after 5 seconds for non-persistent notifications
    if (tag !== 'persistent') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  }, [permission]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Trip-specific notifications
  const notifyTripUpdate = useCallback((trip, update) => {
    const messages = {
      rider_assigned: {
        title: 'Rider Assigned! 🏍️',
        body: `${trip.riderName} is on the way to pick you up.`,
        icon: 'rider'
      },
      rider_arrived: {
        title: 'Rider Arrived! 📍',
        body: `Your rider has arrived at ${trip.pickup}.`,
        icon: 'arrived'
      },
      trip_started: {
        title: 'Trip Started! 🚀',
        body: `You're now heading to ${trip.dropoff}.`,
        icon: 'trip'
      },
      trip_completed: {
        title: 'Trip Completed! ✅',
        body: `You arrived at ${trip.dropoff}. Rate your ride!`,
        icon: 'completed'
      },
      trip_cancelled: {
        title: 'Trip Cancelled',
        body: 'Your trip has been cancelled.',
        icon: 'cancelled'
      }
    };

    const message = messages[update];
    if (message) {
      showNotification({
        ...message,
        tag: 'trip-update',
        data: { tripId: trip.id, update },
        onClick: (data) => {
          window.location.href = `/track?id=${data.tripId}`;
        }
      });
    }
  }, [showNotification]);

  const value = {
    notifications,
    permission,
    requestPermission,
    showNotification,
    removeNotification,
    markAsRead,
    clearAll,
    notifyTripUpdate
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
        onMarkRead={markAsRead}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification Container Component
const NotificationContainer = ({ notifications, onRemove, onMarkRead }) => {
  const getIcon = (icon) => {
    switch (icon) {
      case 'rider': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'arrived': return <FiInfo className="w-5 h-5 text-blue-500" />;
      case 'trip': return <FiCheckCircle className="w-5 h-5 text-amber-500" />;
      case 'completed': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <FiBell className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-100 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto bg-white rounded-xl shadow-lg border border-sand-200 p-4 min-w-75 max-w-100 animate-in slide-in-from-right fade-in duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {getIcon(notification.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-navy-900 text-sm">
                {notification.title}
              </h4>
              <p className="text-sand-500 text-xs mt-1">
                {notification.body}
              </p>
              <p className="text-sand-400 text-xs mt-2">
                {notification.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="shrink-0 p-1 hover:bg-sand-100 rounded-full transition"
            >
              <FiX className="w-4 h-4 text-sand-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Permission Request Banner
export const NotificationPermissionBanner = () => {
  const { permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-90 bg-amber-500 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiBell className="w-5 h-5" />
          <p className="text-sm font-medium">
            Enable notifications to get real-time updates about your rides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const granted = await requestPermission();
              if (granted) {
                new Notification('Notifications Enabled!', {
                  body: 'You will now receive ride updates',
                  icon: '/icon-192x192.png'
                });
              }
            }}
            className="bg-white text-amber-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-sand-50 transition"
          >
            Enable
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-white/20 rounded-full transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider;
