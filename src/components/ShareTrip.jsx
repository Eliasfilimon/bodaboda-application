import { useState, useCallback } from 'react';
import { FiShare2, FiX, FiCopy, FiCheck, FiSend, FiMessageCircle, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export const ShareTrip = ({ trip, user, rider }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);
  const { t } = useLanguage();

  const generateShareText = useCallback(() => {
    if (!trip) return '';
    
    const baseUrl = window.location.origin;
    const trackingUrl = `${baseUrl}/track?id=${trip.id}`;
    
    return `🛵 BodaBoda Digital - Trip Shared\n\n` +
      `👤 Passenger: ${user?.name || 'Unknown'}\n` +
      `📱 Phone: ${user?.phone || 'N/A'}\n` +
      `🚀 From: ${trip.pickup}\n` +
      `📍 To: ${trip.dropoff}\n` +
      `💰 Fare: TZS ${trip.fare?.toLocaleString()}\n` +
      `🏍️ Rider: ${rider?.name || 'Assigning...'}\n` +
      `📞 Rider Phone: ${rider?.phone || 'N/A'}\n` +
      `⏰ Time: ${new Date().toLocaleString()}\n\n` +
      `Track live: ${trackingUrl}\n\n` +
      `Sent via BodaBoda Digital 🏍️`;
  }, [trip, user, rider]);

  const generateShareUrl = useCallback(() => {
    if (!trip) return '';
    return `${window.location.origin}/track?id=${trip.id}`;
  }, [trip]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generateShareText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BodaBoda Digital - Trip Tracking',
          text: generateShareText(),
          url: generateShareUrl()
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`sms:?body=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('BodaBoda Digital - Trip Tracking');
    const body = encodeURIComponent(generateShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  if (!trip) return null;

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-xl transition"
      >
        <FiShare2 className="w-5 h-5" />
        <span className="font-semibold">{t('shareTrip')}</span>
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-amber-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FiShare2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t('shareTrip')}</h2>
                    <p className="text-sm opacity-90">Keep your loved ones informed</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Trip Preview */}
              <div className="bg-sand-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-navy-800">
                  <FiMapPin className="text-amber-600" />
                  <span className="font-semibold">{trip.pickup}</span>
                </div>
                <div className="w-0.5 h-4 bg-amber-300 ml-2" />
                <div className="flex items-center gap-2 text-navy-800">
                  <FiMapPin className="text-flame-500" />
                  <span className="font-semibold">{trip.dropoff}</span>
                </div>
                {rider && (
                  <div className="mt-3 pt-3 border-t border-sand-200">
                    <p className="text-sm text-sand-500">Rider</p>
                    <p className="font-semibold text-navy-800">{rider.name}</p>
                    <p className="text-sm text-sand-500">{rider.phone}</p>
                  </div>
                )}
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-3">
                {/* Native Share */}
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white p-4 rounded-xl transition"
                >
                  <FiSend className="w-5 h-5" />
                  <span className="font-semibold">Share</span>
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 p-4 rounded-xl transition ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-sand-100 hover:bg-sand-200 text-navy-800'
                  }`}
                >
                  {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                  <span className="font-semibold">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="font-semibold">WhatsApp</span>
                </button>

                {/* SMS */}
                <button
                  onClick={handleSMSShare}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl transition"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  <span className="font-semibold">SMS</span>
                </button>
              </div>

              {/* Email Option */}
              <button
                onClick={handleEmailShare}
                className="w-full flex items-center justify-center gap-2 bg-sand-100 hover:bg-sand-200 text-navy-800 p-3 rounded-xl transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 4l10 8L22 4" />
                </svg>
                <span className="font-semibold">Share via Email</span>
              </button>

              {/* Safety Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Safety Tip:</strong> Sharing your trip details with family or friends helps keep you safe during your ride.
                </p>
              </div>

              {/* QR Code Option (simplified) */}
              <div className="text-center">
                <p className="text-sm text-sand-500 mb-2">Or scan to track</p>
                <div className="inline-block bg-white p-4 rounded-xl border-2 border-sand-200">
                  <div className="w-32 h-32 bg-sand-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-sand-500 text-center px-2">
                        QR Code\n(Track ID: {String(trip.id).slice(-6)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareTrip;
