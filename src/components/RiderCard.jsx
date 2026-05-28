import { FiStar, FiMapPin, FiCheckCircle, FiTruck } from 'react-icons/fi';

export const RiderCard = ({ rider, selected, onSelect }) => {
  if (!rider) return null;

  const statusColor = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    on_trip: 'bg-yellow-500',
  }[rider.status] || 'bg-gray-400';

  return (
    <div
      onClick={() => onSelect && onSelect(rider.id)}
      className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
        selected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
            {rider.name?.[0]?.toUpperCase() || 'R'}
          </div>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColor}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{rider.name}</p>
            {rider.isIdentityVerified && (
              <FiCheckCircle className="text-green-500 flex-shrink-0" size={13} title="Verified" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-xs text-yellow-600">
              <FiStar size={11} fill="currentColor" />
              {Number(rider.rating || 4.5).toFixed(1)}
            </span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{rider.trips || 0} trips</span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <FiMapPin size={11} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{rider.location || 'Nearby'}</span>
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <FiTruck size={12} />
            {rider.vehicleInfo?.plateNumber || 'N/A'}
          </span>
          {selected && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Selected ✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderCard;
