import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiSend, FiImage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineXMark } from 'react-icons/hi2';

const QUICK_MESSAGES = {
  en: [
    "I'm here",
    "On my way",
    "Traffic jam, running late",
    "Can't find you, call me",
    "Arrived at pickup",
    "Be there in 5 mins",
    "Where exactly are you?",
    "I'm waiting",
  ],
  sw: [
    "Nipo hapa",
    "Nakuja",
    "Traffic, nitachelewa",
    "Sikuoni, nipigie",
    "Nimefika kwenye kuchukuliwa",
    "Nitakuwa hapo dakika 5",
    "Wapi hasa ulipo?",
    "Ninasubiri",
  ]
};

export const TripChat = ({ trip, user, rider, isOpen, onClose, userType }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const { t, language } = useLanguage();
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load messages from localStorage or API
  useEffect(() => {
    if (trip?.id) {
      const saved = localStorage.getItem(`chat_${trip.id}`);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(JSON.parse(saved));
      } else {
        // Initial system message
        const initialMsg = {
          id: Date.now(),
          type: 'system',
          text: userType === 'customer' 
            ? `You can now chat with ${rider?.name || 'your rider'}`
            : `You can now chat with ${user?.name || 'your customer'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages([initialMsg]);
      }
    }
  }, [trip?.id, rider, user, userType]);

  // Save messages to localStorage
  useEffect(() => {
    if (trip?.id && messages.length > 0) {
      localStorage.setItem(`chat_${trip.id}`, JSON.stringify(messages));
    }
  }, [messages, trip?.id]);

  // Listen for new messages via socket (simulated with storage events)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === `chat_${trip?.id}`) {
        const newMessages = JSON.parse(e.newValue || '[]');
        setMessages(newMessages);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [trip?.id]);

  const sendMessage = useCallback((text = newMessage) => {
    if (!text.trim()) return;

    const message = {
      id: Date.now(),
      type: 'user',
      sender: userType,
      senderName: userType === 'customer' ? user?.name : rider?.name,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowQuickMessages(false);

    // Simulate rider response (for demo)
    if (userType === 'customer') {
      setTimeout(() => {
        const responses = language === 'sw' 
          ? ['Nimepata ujumbe wako', 'Nakuja sasa', 'Nipo njiani', 'Sawa']
          : ['Got it', 'On my way', 'Coming now', 'Okay'];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const reply = {
          id: Date.now() + 1,
          type: 'user',
          sender: 'rider',
          senderName: rider?.name,
          text: randomResponse,
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  }, [newMessage, user, rider, userType, language]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          sendMessage(`📍 I'm here: ${mapsUrl}`);
        },
        (error) => {
          console.error('Location error:', error);
          sendMessage("📍 I'm sharing my location (GPS unavailable)");
        }
      );
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const otherParty = userType === 'customer' ? rider : user;
  const otherPartyName = otherParty?.name || (userType === 'customer' ? 'Rider' : 'Customer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-amber-500 text-twende-text p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {otherParty?.name ? (
                <span className="font-bold text-sm">
                  {otherParty.name.split(' ').map(n => n[0]).join('')}
                </span>
              ) : (
                <FiMessageCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold">{otherPartyName}</h3>
              <p className="text-xs opacity-90">
                {otherParty?.phone || t('contactRider')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {otherParty?.phone && (
              <a
                href={`tel:${otherParty.phone}`}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title={t('call')}
              >
                <HiOutlinePhone className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-sand-50"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === 'system' 
                  ? 'justify-center' 
                  : msg.sender === userType 
                    ? 'justify-end' 
                    : 'justify-start'
              }`}
            >
              {msg.type === 'system' ? (
                <div className="bg-sand-200 text-sand-600 text-xs px-3 py-1 rounded-full">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.sender === userType
                      ? 'bg-amber-500 text-twende-text rounded-br-sm'
                      : 'bg-white text-navy-800 border border-sand-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === userType ? 'text-amber-100' : 'text-sand-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        {showQuickMessages && (
          <div className="bg-white border-t border-sand-200 p-2">
            <div className="flex flex-wrap gap-2">
              {QUICK_MESSAGES[language].map((msg) => (
                <button
                  key={msg}
                  onClick={() => sendMessage(msg)}
                  className="text-xs bg-sand-100 hover:bg-sand-200 text-navy-700 px-3 py-1 rounded-full transition"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-sand-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowQuickMessages(!showQuickMessages)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              {showQuickMessages ? 'Hide quick replies' : 'Quick replies'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={shareLocation}
              className="p-2 text-sand-400 hover:text-amber-600 transition"
              title="Share location"
            >
              <HiOutlineMapPin className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-sand-400 hover:text-amber-600 transition"
              title="Send image"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-sand-50 border border-sand-200 rounded-full focus:outline-none focus:border-amber-500 text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!newMessage.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-twende-text rounded-full transition"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripChat;
