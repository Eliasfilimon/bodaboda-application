import { HiOutlineCheckCircle, HiOutlineStar, HiOutlineMapPin, HiOutlineTruck } from 'react-icons/hi2';

export const RiderCard = ({ rider, selected, onSelect }) => {
  if (!rider) return null;

  const statusColor = {
    online: 'bg-twende-success',
    offline: 'bg-gray-400',
    on_trip: 'bg-twende-accent',
  }[rider.status] || 'bg-gray-400';

  return (
    <div
      onClick={() => onSelect && onSelect(rider.id)}
      className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
        selected
          ? 'border-twende-primary bg-twende-primary/10'
          : 'border-twende-border bg-white hover:border-twende-primary/50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-twende-primary flex items-center justify-center text-white font-bold text-lg">
            {rider.name?.[0]?.toUpperCase() || 'R'}
          </div>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColor}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-twende-text text-sm truncate">{rider.name}</p>
            {rider.isIdentityVerified && (
              <HiOutlineCheckCircle className="text-twende-success flex-shrink-0" size={13} title="Verified" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-xs text-twende-accent font-bold">
              <HiOutlineStar size={11} className="fill-twende-accent" />
              {Number(rider.rating || 4.5).toFixed(1)}
            </span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs font-semibold text-twende-text-secondary">{rider.trips || 0} trips</span>
          </div>

          <div className="flex items-center gap-1 mt-0.5 text-twende-text-secondary">
            <HiOutlineMapPin size={11} className="flex-shrink-0" />
            <span className="text-xs font-semibold truncate">{rider.location || 'Nearby'}</span>
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-[10px] font-bold text-twende-text-secondary bg-gray-100 px-2 py-1 rounded-md">
            <HiOutlineTruck size={12} />
            {rider.vehicleInfo?.plateNumber || 'N/A'}
          </span>
          {selected && (
            <span className="text-[10px] font-black uppercase text-twende-primary mt-1">Selected ✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderCard;
