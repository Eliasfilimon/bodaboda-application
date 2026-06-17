import { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-flame-500 text-twende-text px-4 py-3 flex items-center justify-center gap-2 shadow-lg">
      <FiWifiOff className="w-5 h-5" />
      <span className="font-semibold text-sm">
        You are offline. Please check your internet connection.
      </span>
    </div>
  );
};
