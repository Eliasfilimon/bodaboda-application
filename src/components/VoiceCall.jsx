import { useState, useCallback } from 'react';
import { FiPhoneOff, FiMic, FiMicOff, FiVolume2 } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlinePhone } from 'react-icons/hi2';

export const VoiceCallButton = ({ phoneNumber, name, size = 'md' }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const { t, language } = useLanguage();

  const startCall = useCallback(() => {
    if (!phoneNumber) return;
    
    // For mobile devices, use tel: protocol
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tel:${phoneNumber}`;
      return;
    }

    // For desktop, show call interface (simulated)
    setIsCalling(true);
    setCallDuration(0);
    
    // Simulate call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Store timer ID to clear later
    window.callTimer = timer;
  }, [phoneNumber]);

  const endCall = useCallback(() => {
    setIsCalling(false);
    if (window.callTimer) {
      clearInterval(window.callTimer);
    }
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(false);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <>
      {/* Call Button */}
      <button
        onClick={startCall}
        disabled={!phoneNumber}
        className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-sand-300 disabled:cursor-not-allowed text-twende-text rounded-xl transition ${sizeClasses[size]}`}
        title={phoneNumber || t('noPhone')}
      >
        <HiOutlinePhone className={iconSizes[size]} />
        <span className="font-semibold hidden sm:inline">{t('call')}</span>
      </button>

      {/* Call Modal (for desktop simulation) */}
      {isCalling && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Caller Info */}
            <div className="bg-navy-900 text-twende-text p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">
                  {name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{name || 'Unknown'}</h2>
              <p className="text-sand-300">{phoneNumber}</p>
              <p className="text-2xl font-mono mt-4">{formatDuration(callDuration)}</p>
            </div>

            {/* Call Controls */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Mute */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition ${
                    isMuted ? 'bg-red-100 text-red-600' : 'bg-sand-100 text-navy-700'
                  }`}
                >
                  {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
                  <span className="text-xs font-medium">
                    {isMuted 
                      ? (language === 'sw' ? 'Zima' : 'Unmute') 
                      : (language === 'sw' ? 'Zima Sauti' : 'Mute')
                    }
                  </span>
                </button>

                {/* End Call */}
                <button
                  onClick={endCall}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-500 hover:bg-red-600 text-twende-text transition"
                >
                  <FiPhoneOff className="w-6 h-6" />
                  <span className="text-xs font-medium">
                    {language === 'sw' ? 'Kata' : 'End'}
                  </span>
                </button>

                {/* Speaker */}
                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition ${
                    isSpeaker ? 'bg-amber-100 text-amber-600' : 'bg-sand-100 text-navy-700'
                  }`}
                >
                  <FiVolume2 className="w-6 h-6" />
                  <span className="text-xs font-medium">
                    {isSpeaker 
                      ? (language === 'sw' ? 'Spika' : 'Speaker') 
                      : (language === 'sw' ? 'Spika' : 'Speaker')
                    }
                  </span>
                </button>
              </div>

              <p className="text-center text-xs text-sand-400">
                {language === 'sw' 
                  ? 'Kwa simu ya mkononi, piga moja kwa moja.' 
                  : 'On mobile devices, this will dial directly.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ContactButtons = ({ phoneNumber, name, onMessage }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <VoiceCallButton phoneNumber={phoneNumber} name={name} />
      
      {onMessage && (
        <button
          onClick={onMessage}
          className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-3 rounded-xl transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="font-semibold hidden sm:inline">{t('message')}</span>
        </button>
      )}
    </div>
  );
};

export default VoiceCallButton;
