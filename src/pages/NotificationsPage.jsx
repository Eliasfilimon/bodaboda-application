import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiInfo, FiDollarSign } from 'react-icons/fi';
import { HiOutlineXMark, HiOutlineCheck, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Trip Completed', body: 'Your trip to UDOM Campus was completed successfully.', time: '2 min ago', read: false },
  { id: 2, type: 'info',    title: 'Rider Assigned', body: 'Juma Hassan is on his way to pick you up.',           time: '10 min ago', read: false },
  { id: 3, type: 'payment', title: 'Payment Received', body: 'TZS 2,500 received via M-Pesa for trip #42.',        time: '1 hr ago',   read: true },
  { id: 4, type: 'info',    title: 'Welcome!', body: 'Welcome to BodaBoda Digital. Safe riding!',                   time: '2 days ago', read: true },
];

const TYPE = {
  success: { Icon: HiOutlineCheck,         bg: 'bg-twende-primary/10 border-twende-primary/30',  text: 'text-twende-primary' },
  info:    { Icon: FiInfo,           bg: 'bg-blue-500/10 border-blue-500/30',               text: 'text-blue-400' },
  payment: { Icon: FiDollarSign,     bg: 'bg-twende-accent/10 border-twende-accent/30',     text: 'text-twende-accent' },
  alert:   { Icon: HiOutlineExclamationTriangle,  bg: 'bg-orange-500/10 border-orange-500/30',           text: 'text-orange-400' },
};

export const NotificationsPage = () => {
  const { user, rider } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const name = user?.name || rider?.name || 'User';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifications(MOCK_NOTIFICATIONS);
  }, []);

  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const remove = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const markRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-twende-navy font-jakarta text-twende-text relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-twende-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel border-t-0 rounded-b-[2rem] px-4 pt-10 pb-8 shadow-lg relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-twende-text">
              <FiBell className="text-twende-primary" /> Notifications
              {unread > 0 && (
                <span className="bg-twende-primary text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full shadow-glow animate-pulse">{unread}</span>
              )}
            </h1>
            <p className="text-twende-text-secondary text-sm mt-1">Hey {name}!</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-xs text-twende-primary border border-twende-primary/50 bg-twende-primary/10 px-3 py-2 rounded-xl font-bold hover:bg-twende-primary hover:text-white transition-colors flex items-center gap-1">
              <HiOutlineCheck /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-8 max-w-lg mx-auto pb-28 space-y-4 relative z-10">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border-twende-border shadow-lg">
            <FiBell className="text-6xl mb-4 text-twende-text-secondary" />
            <p className="font-bold text-twende-text text-xl">All caught up!</p>
            <p className="text-sm text-twende-text-secondary mt-1">No notifications yet, {name}.</p>
          </div>
        ) : notifications.map(n => {
          const cfg = TYPE[n.type] || TYPE.info;
          const { Icon: NIcon } = cfg;
          return (
            <div key={n.id}
              onClick={() => markRead(n.id)}
              className={`rounded-2xl p-5 flex gap-4 border cursor-pointer transition-all ${
                n.read
                  ? 'bg-gray-100 border-white/5 hover:bg-gray-100'
                  : 'bg-twende-primary/5 border-twende-primary/30 hover:bg-twende-primary/10 shadow-[0_0_15px_rgba(0,168,107,0.05)]'
              }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${cfg.bg} ${cfg.text}`}>
                <NIcon className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-bold text-sm ${n.read ? 'text-twende-text-secondary' : 'text-twende-text'}`}>{n.title}</p>
                  <button onClick={e => { e.stopPropagation(); remove(n.id); }}
                    className="text-twende-text-secondary hover:text-red-400 transition-colors flex-shrink-0">
                    <HiOutlineXMark />
                  </button>
                </div>
                <p className={`text-xs mt-1 ${n.read ? 'text-twende-text-secondary' : 'text-twende-text-secondary'}`}>{n.body}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-twende-text-secondary mt-2">{n.time}</p>
              </div>
              {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-twende-primary flex-shrink-0 mt-1 shadow-glow" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
