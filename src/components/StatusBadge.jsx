
export const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    online: "bg-green-100 text-green-700",
    on_trip: "bg-amber-500 text-white",
    offline: "bg-sand-200 text-sand-700",
  };

  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    online: "Online",
    on_trip: "On Trip",
    offline: "Offline",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};
