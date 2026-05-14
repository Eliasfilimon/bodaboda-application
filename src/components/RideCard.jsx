import { StatusBadge } from "./StatusBadge";
import { FiArrowDown, FiMapPin } from "react-icons/fi";

export const RideCard = ({ trip, onAssign, onlineRiders }) => {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-navy-900 text-lg">{trip.customer}</h3>
          <p className="text-sm text-sand-400">{trip.phone || "Phone not provided"}</p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <FiMapPin className="text-amber-500" />
          <span className="text-navy-800">{trip.pickup}</span>
        </div>
        <div className="flex items-center gap-2 ml-6 text-xs text-sand-400">
          <FiArrowDown />
        </div>
        <div className="flex items-center gap-2">
          <FiMapPin className="text-amber-500" />
          <span className="text-navy-800">{trip.dropoff}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3 py-2 border-t border-sand-200">
        <div>
          <p className="text-xs text-sand-400">Fare</p>
          <p className="font-bold text-navy-900">TZS {trip.fare.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-sand-400">Payment</p>
          <p className="font-semibold text-sm text-navy-800">{trip.payment}</p>
        </div>
      </div>

      {trip.status === "pending" && onAssign && (
        <div className="space-y-2">
          <label className="text-xs text-sand-400">Assign Rider</label>
          <select
            className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
            defaultValue=""
            onChange={(e) => {
              const riderId = parseInt(e.target.value, 10);
              if (!Number.isNaN(riderId)) onAssign(trip.id, riderId);
            }}
          >
            <option value="">Select a rider</option>
            {onlineRiders.map((rider) => (
              <option key={rider.id} value={rider.id}>
                {rider.name} (Rating {rider.rating})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
