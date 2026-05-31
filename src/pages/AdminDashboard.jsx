import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../config/api.js";

const tabs = ["overview", "riders", "passengers", "trips", "approvals"];

const statusLabel = (status) => {
  if (status === "pending") return "Pending";
  if (status === "suspended") return "Suspended";
  if (status === "online" || status === "active" || status === "on_trip") return "Active";
  return "Pending";
};

const statusBadge = (status) => {
  const label = statusLabel(status);
  if (label === "Active") return "bg-twende-light text-twende-dark";
  if (label === "Suspended") return "bg-red-100 text-red-700";
  return "bg-amber-200 text-amber-800";
};

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [riders, setRiders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [allRiders, allTrips] = await Promise.all([api.riders.getAll(), api.trips.getAll()]);
      setRiders(allRiders || []);
      setTrips(allTrips || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const pendingApprovals = useMemo(() => riders.filter((rider) => statusLabel(rider.status) === "Pending"), [riders]);
  const activeRiders = useMemo(() => riders.filter((rider) => statusLabel(rider.status) === "Active"), [riders]);
  const todayTrips = useMemo(() => trips.filter((trip) => new Date(trip.createdAt || Date.now()).toDateString() === new Date().toDateString()), [trips]);
  const totalRevenue = useMemo(() => trips.filter((trip) => trip.status === "completed").reduce((sum, trip) => sum + Number(trip.fare || 0), 0), [trips]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const updateRiderStatus = async (riderId, status) => {
    await api.riders.updateStatus(riderId, { status });
    await load();
  };

  return (
    <div className="min-h-screen bg-twende-bg p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        <aside className="bg-twende-white border border-sand-200 rounded-2xl p-3 h-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium capitalize ${activeTab === tab ? "bg-twende-primary text-white" : "text-twende-text hover:bg-twende-light"}`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <main className="space-y-5">
          {loading && <div className="bg-twende-white rounded-2xl p-6 border border-sand-200 text-twende-gray">Loading dashboard...</div>}

          {!loading && activeTab === "overview" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="bg-twende-white border border-sand-200 rounded-2xl p-4"><p className="text-sm text-twende-gray">Total Riders</p><p className="text-2xl font-bold text-twende-text">{riders.length}</p></div>
              <div className="bg-twende-white border border-sand-200 rounded-2xl p-4"><p className="text-sm text-twende-gray">Active Riders</p><p className="text-2xl font-bold text-twende-text">{activeRiders.length}</p></div>
              <div className="bg-twende-white border border-sand-200 rounded-2xl p-4"><p className="text-sm text-twende-gray">Total Trips Today</p><p className="text-2xl font-bold text-twende-text">{todayTrips.length}</p></div>
              <div className="bg-twende-white border border-sand-200 rounded-2xl p-4"><p className="text-sm text-twende-gray">Total Revenue</p><p className="text-2xl font-bold text-twende-text">TZS {totalRevenue.toLocaleString()}</p></div>
              <div className="bg-twende-white border border-sand-200 rounded-2xl p-4"><p className="text-sm text-twende-gray">Pending Approvals</p><p className="text-2xl font-bold text-twende-text">{pendingApprovals.length}</p></div>
            </section>
          )}

          {!loading && activeTab === "riders" && (
            <section className="bg-twende-white rounded-2xl border border-sand-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-twende-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-twende-text">Name</th>
                      <th className="px-4 py-3 text-left text-twende-text">Phone</th>
                      <th className="px-4 py-3 text-left text-twende-text">Status</th>
                      <th className="px-4 py-3 text-left text-twende-text">Total Trips</th>
                      <th className="px-4 py-3 text-left text-twende-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {riders.map((rider) => (
                      <tr key={rider.id}>
                        <td className="px-4 py-3">{rider.name}</td>
                        <td className="px-4 py-3">{rider.phone}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(rider.status)}`}>{statusLabel(rider.status)}</span></td>
                        <td className="px-4 py-3">{rider.trips || 0}</td>
                        <td className="px-4 py-3 flex flex-wrap gap-2">
                          <button onClick={() => updateRiderStatus(rider.id, "online")} className="px-2 py-1 rounded bg-twende-primary text-white text-xs">Approve</button>
                          <button onClick={() => updateRiderStatus(rider.id, "suspended")} className="px-2 py-1 rounded bg-twende-accent text-white text-xs">Suspend</button>
                          <button onClick={() => switchTab("approvals")} className="px-2 py-1 rounded bg-twende-light text-twende-dark text-xs">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {!loading && activeTab === "approvals" && (
            <section className="space-y-3">
              {pendingApprovals.length === 0 && <div className="bg-twende-white rounded-2xl border border-sand-200 p-4 text-twende-gray">No riders pending approval.</div>}
              {pendingApprovals.map((rider) => (
                <div key={rider.id} className="bg-twende-white rounded-2xl border border-sand-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-twende-text">{rider.name}</p>
                    <p className="text-sm text-twende-gray">{rider.phone} • {rider.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateRiderStatus(rider.id, "online")} className="px-3 py-2 rounded-xl bg-twende-primary text-white text-sm font-semibold">APPROVE</button>
                    <button onClick={() => updateRiderStatus(rider.id, "suspended")} className="px-3 py-2 rounded-xl bg-twende-accent text-white text-sm font-semibold">REJECT</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {!loading && activeTab === "trips" && (
            <section className="bg-twende-white rounded-2xl border border-sand-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-twende-light">
                    <tr>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Fare</th>
                      <th className="px-4 py-3 text-left">Passenger</th>
                      <th className="px-4 py-3 text-left">Rider</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {trips.map((trip) => (
                      <tr key={trip.id}>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${trip.status === "completed" ? "bg-twende-light text-twende-dark" : "bg-amber-200 text-amber-800"}`}>{trip.status}</span></td>
                        <td className="px-4 py-3">TZS {Number(trip.fare || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">{trip.customer || "-"}</td>
                        <td className="px-4 py-3">{trip.rider || "-"}</td>
                        <td className="px-4 py-3">{new Date(trip.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {!loading && activeTab === "passengers" && (
            <section className="bg-twende-white rounded-2xl border border-sand-200 p-4 text-twende-gray">
              Passenger analytics can be added from the backend API.
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
