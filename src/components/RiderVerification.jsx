import { FiShield, FiAward } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineCheckCircle, HiOutlineStar, HiOutlinePhone } from 'react-icons/hi2';

const VERIFICATION_BADGES = {
  identity: {
    icon: FiShield,
    color: 'blue',
    label: { en: 'ID Verified', sw: 'Kitambulisho Kimethibitishwa' },
  },
  license: {
    icon: HiOutlineCheckCircle,
    color: 'green',
    label: { en: 'License Valid', sw: 'Leseni Halali' },
  },
  insurance: {
    icon: FiAward,
    color: 'amber',
    label: { en: 'Insured', sw: 'Bima Imelipiwa' },
  },
  topRated: {
    icon: HiOutlineStar,
    color: 'purple',
    label: { en: 'Top Rated', sw: 'Kiwango cha Juu' },
  },
  phone: {
    icon: HiOutlinePhone,
    color: 'teal',
    label: { en: 'Phone Verified', sw: 'Simu Imethibitishwa' },
  },
};

export const RiderVerificationBadges = ({ rider, showDetails = false }) => {
  const { language } = useLanguage();
  
  if (!rider) return null;

  const badges = [];
  
  // Check which badges rider has earned
  if (rider.isIdentityVerified) badges.push('identity');
  if (rider.isLicenseValid) badges.push('license');
  if (rider.hasInsurance) badges.push('insurance');
  if (rider.rating >= 4.5 && rider.trips >= 50) badges.push('topRated');
  if (rider.isPhoneVerified) badges.push('phone');

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    teal: 'bg-teal-100 text-teal-700 border-teal-200',
  };

  return (
    <div className="space-y-2">
      {/* Badge Row */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badgeKey) => {
          const badge = VERIFICATION_BADGES[badgeKey];
          const Icon = badge.icon;
          return (
            <div
              key={badgeKey}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorClasses[badge.color]}`}
              title={badge.label[language]}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{badge.label[language]}</span>
            </div>
          );
        })}
      </div>

      {/* Detailed Verification Info */}
      {showDetails && badges.length > 0 && (
        <div className="bg-sand-50 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide">
            {language === 'sw' ? 'Uhalalishaji' : 'Verification Status'}
          </p>
          {badges.map((badgeKey) => {
            const badge = VERIFICATION_BADGES[badgeKey];
            const Icon = badge.icon;
            return (
              <div key={badgeKey} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClasses[badge.color].split(' ')[0]}`}>
                  <Icon className={`w-3.5 h-3.5 ${colorClasses[badge.color].split(' ')[1]}`} />
                </div>
                <span className="text-sm text-navy-800">{badge.label[language]}</span>
                <HiOutlineCheckCircle className="w-4 h-4 text-green-500 ml-auto" />
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
        <p className="text-xs text-amber-800">
          <strong>{language === 'sw' ? 'Kidokezo cha Usalama:' : 'Safety Tip:'}</strong>{' '}
          {language === 'sw' 
            ? 'Thibitisha utambulisho wa mpanda pikipiki kabla ya kuanza safari.' 
            : 'Always verify rider identity before starting your trip.'}
        </p>
      </div>
    </div>
  );
};

export const RiderCard = ({ rider, onSelect, isSelected }) => {
  const { language } = useLanguage();
  
  if (!rider) return null;

  const initials = rider.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  return (
    <div
      onClick={() => onSelect?.(rider)}
      className={`relative bg-white rounded-2xl p-4 border-2 transition cursor-pointer ${
        isSelected 
          ? 'border-amber-500 shadow-lg' 
          : 'border-sand-200 hover:border-amber-300'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <HiOutlineCheckCircle className="w-4 h-4 text-twende-text" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-twende-text font-bold text-lg">
            {initials}
          </div>
          {rider.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-navy-900 truncate">{rider.name}</h3>
          <div className="flex items-center gap-1 text-sm text-sand-500">
            <HiOutlineStar className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium text-navy-700">{rider.rating || '4.5'}</span>
            <span>•</span>
            <span>{rider.trips || 0} {language === 'sw' ? 'safari' : 'trips'}</span>
          </div>
          <p className="text-xs text-sand-400 mt-1">{rider.vehicleInfo?.model || 'Motorcycle'}</p>
          <p className="text-xs text-sand-400">{rider.vehicleInfo?.plateNumber || ''}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3">
        <RiderVerificationBadges rider={rider} />
      </div>

      {/* Price */}
      {rider.estimatedFare && (
        <div className="mt-3 pt-3 border-t border-sand-100 flex items-center justify-between">
          <span className="text-sm text-sand-500">
            {language === 'sw' ? 'Kadirio' : 'Est.'}
          </span>
          <span className="font-bold text-navy-900">
            TZS {rider.estimatedFare.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default RiderVerificationBadges;
