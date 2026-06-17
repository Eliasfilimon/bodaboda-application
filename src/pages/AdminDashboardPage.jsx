import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { FaMotorcycle } from 'react-icons/fa';
import { HiOutlineClock, HiOutlineXCircle, HiOutlineBars3, HiOutlineXMark, HiOutlineArrowRightOnRectangle, HiOutlineChartBar, HiOutlineUsers, HiOutlineMap, HiOutlineCheck } from 'react-icons/hi2';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [riders, setRiders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const apiFetch = useCallback(async (path) => {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d) ? d : (d.data || d.riders || d.trips || d.users || []);
  }, [token]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [r, t, u] = await Promise.all([
      apiFetch('/api/riders').catch(() => []),
      apiFetch('/api/trips').catch(() => []),
      apiFetch('/api/users').catch(() => []),
    ]);
    setRiders(r); setTrips(t); setUsers(u);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const patchRider = async (id, endpoint, newStatus) => {
    try {
      const res = await fetch(`${API}/api/riders/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setRiders(prev => prev.map(r => r.id === id ? { ...r, isApproved: endpoint === 'approve', status: newStatus } : r));
        showToast(endpoint === 'approve' ? '✅ Rider approved!' : '🚫 Rider suspended.', endpoint === 'approve' ? 'success' : 'warning');
      } else {
        showToast('Action failed — check backend.', 'error');
      }
    } catch { showToast('Network error.', 'error'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const pending = riders.filter(r => !r.isApproved && r.status !== 'suspended');
  const activeRiders = riders.filter(r => r.isApproved || r.status === 'active');
  const totalRevenue = trips.filter(t => t.status === 'completed').reduce((s, t) => s + parseFloat(t.fare || 0), 0);

  const stats = [
    { label: 'Total Riders', value: riders.length, icon: <FaMotorcycle />, bg: 'bg-gray-100 text-twende-text', border: 'border-twende-border' },
    { label: 'Active Riders', value: activeRiders.length, icon: <HiOutlineCheck />, bg: 'bg-twende-success/10 text-twende-success', border: 'border-twende-success/20' },
    { label: 'Pending', value: pending.length, icon: <HiOutlineClock />, bg: 'bg-twende-accent/10 text-twende-accent', border: 'border-twende-accent/20' },
    { label: 'Total Trips', value: trips.length, icon: <HiOutlineMap />, bg: 'bg-twende-info/10 text-twende-info', border: 'border-twende-info/20' },
    { label: 'Passengers', value: users.length, icon: <HiOutlineUsers />, bg: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
    { label: 'Revenue (TZS)', value: Math.round(totalRevenue).toLocaleString(), icon: <span className="font-serif">TSh</span>, bg: 'bg-twende-primary/10 text-twende-primary', border: 'border-twende-primary/20' },
  ];

  const sbadge = (s) => ({ active: 'bg-twende-success/10 text-twende-success', approved: 'bg-twende-success/10 text-twende-success', pending: 'bg-twende-accent/10 text-twende-accent', suspended: 'bg-twende-error/10 text-twende-error', completed: 'bg-twende-success/10 text-twende-success', cancelled: 'bg-twende-error/10 text-twende-error', started: 'bg-twende-info/10 text-twende-info', accepted: 'bg-purple-100 text-purple-700' }[s] || 'bg-gray-100 text-twende-text-secondary');

  const navItems = [
    { key: 'overview', icon: <HiOutlineChartBar />, label: 'Overview' },
    { key: 'riders', icon: <FaMotorcycle />, label: 'Riders' },
    { key: 'approvals', icon: <HiOutlineClock />, label: `Approvals${pending.length > 0 ? ` (${pending.length})` : ''}` },
    { key: 'trips', icon: <HiOutlineMap />, label: 'Trips' },
    { key: 'passengers', icon: <HiOutlineUsers />, label: 'Passengers' },
  ];

  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-6 border-b border-twende-border flex items-center justify-between">
        <div>
          <p className="text-twende-primary font-black text-xl tracking-tight">BodaGo</p>
          <p className="text-twende-text-secondary text-xs uppercase tracking-wider font-bold">Admin Portal</p>
        </div>
        {onClose && <button onClick={onClose} className="text-twende-text-secondary hover:text-twende-text text-xl"><HiOutlineXMark /></button>}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <button key={item.key} onClick={() => { setTab(item.key); onClose?.(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === item.key ? 'bg-gray-100 text-twende-text' : 'text-twende-text-secondary hover:bg-gray-50 hover:text-twende-text'
            }`}>
            <span className="text-lg">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-twende-border">
        <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-twende-border">
          <p className="text-xs text-twende-text-secondary uppercase tracking-wider font-bold mb-1">Logged in as</p>
          <p className="text-twende-text font-bold text-sm">{user?.name || 'Admin'}</p>
        </div>
        <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-gray-50 text-twende-error text-sm font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition-colors border border-twende-border">
          <HiOutlineArrowRightOnRectangle /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-twende-background font-poppins flex text-twende-text relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 animate-[slideDown_0.3s_ease-out] ${
          toast.type === 'success' ? 'bg-twende-success text-white' : toast.type === 'warning' ? 'bg-twende-accent text-white' : 'bg-twende-error text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen fixed left-0 top-0 bottom-0 z-40 border-r border-twende-border bg-white">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-twende-text/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        {/* Top header */}
        <header className="bg-white border-b border-twende-border px-6 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-twende-text hover:bg-gray-100 p-2 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
              <HiOutlineBars3 className="text-xl" />
            </button>
            <h1 className="font-bold text-twende-text text-xl flex items-center gap-2">
              {tab === 'overview' ? 'Dashboard Overview' : tab === 'approvals' ? `Pending Approvals (${pending.length})` : navItems.find(n=>n.key===tab)?.label}
            </h1>
          </div>
          <button onClick={fetchAll} className="text-sm font-bold text-twende-primary bg-twende-primary/10 px-4 py-2 rounded-lg hover:bg-twende-primary hover:text-white transition-colors">
            Refresh
          </button>
        </header>

        <div className="p-6 md:p-8 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <span className="animate-spin border-4 border-twende-primary/30 border-t-twende-primary rounded-full w-10 h-10" />
              <p className="text-twende-text-secondary text-sm font-bold uppercase tracking-widest">Loading data...</p>
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {stats.map(s => (
                      <div key={s.label} className={`bg-white rounded-2xl p-6 border ${s.border} shadow-sm flex flex-col`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${s.bg}`}>
                          {s.icon}
                        </div>
                        <p className="text-3xl font-black text-twende-text mb-1">{s.value}</p>
                        <p className="text-sm text-twende-text-secondary font-semibold">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {pending.length > 0 && (
                    <div className="bg-twende-accent/10 border border-twende-accent/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-twende-accent/20 text-twende-accent rounded-full flex items-center justify-center text-xl shrink-0">
                          <HiOutlineClock />
                        </div>
                        <div>
                          <p className="font-bold text-twende-text text-lg">{pending.length} rider{pending.length > 1 ? 's' : ''} waiting for approval</p>
                          <p className="text-sm text-twende-text-secondary mt-1">Review their documents to let them start earning.</p>
                        </div>
                      </div>
                      <button onClick={() => setTab('approvals')} className="bg-twende-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-twende-accent/90 transition-colors whitespace-nowrap">
                        Review Approvals
                      </button>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-twende-border shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-twende-border">
                      <h3 className="font-bold text-twende-text text-lg">Recent Trips</h3>
                    </div>
                    <div className="divide-y divide-twende-border">
                      {trips.slice(0, 6).map((t, i) => (
                        <div key={t.id || i} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-twende-text text-sm flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-twende-text shrink-0"></span> {t.pickupLocation || 'Unknown'} 
                              <span className="text-twende-text-secondary text-lg">→</span> 
                              <span className="w-2 h-2 rounded-full bg-twende-primary shrink-0"></span> {t.dropoffLocation || '—'}
                            </p>
                            <p className="text-xs text-twende-text-secondary mt-1 ml-5 font-medium">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/3 ml-5 sm:ml-0">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${sbadge(t.status)}`}>{t.status}</span>
                            <span className="font-black text-twende-text text-base">TZS {parseFloat(t.fare||0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      {trips.length === 0 && <p className="text-center text-twende-text-secondary py-12 text-sm">No trips recorded yet</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* RIDERS */}
              {tab === 'riders' && (
                <div className="bg-white rounded-2xl border border-twende-border shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-twende-border">
                    <h3 className="font-bold text-twende-text text-lg">All Riders ({riders.length})</h3>
                  </div>
                  
                  {/* Mobile View */}
                  <div className="md:hidden divide-y divide-twende-border">
                    {riders.map((r, i) => (
                      <div key={r.id||i} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-twende-text text-base">{r.name || r.fullName || '—'}</p>
                            <p className="text-sm text-twende-text-secondary mt-1">{r.phone || '—'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${sbadge(r.isApproved ? 'active' : r.status || 'pending')}`}>
                            {r.isApproved ? 'Active' : r.status || 'Pending'}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {!r.isApproved && <button onClick={() => patchRider(r.id,'approve','active')} className="flex-1 py-2 bg-twende-success/10 text-twende-success font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-twende-success hover:text-white transition-colors">Approve</button>}
                          {r.status !== 'suspended' && <button onClick={() => patchRider(r.id,'suspend','suspended')} className="flex-1 py-2 bg-twende-error/10 text-twende-error font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-twende-error hover:text-white transition-colors">Suspend</button>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-twende-border text-xs font-bold text-twende-text-secondary uppercase tracking-wider">
                        <tr>{['Name','Phone','Status','Trips','Actions'].map(h=><th key={h} className="px-6 py-4">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-twende-border">
                        {riders.map((r,i)=>(
                          <tr key={r.id||i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-twende-text">{r.name||r.fullName||'—'}</td>
                            <td className="px-6 py-4 text-twende-text-secondary">{r.phone||'—'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${sbadge(r.isApproved?'active':r.status||'pending')}`}>
                                {r.isApproved?'Active':r.status||'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-twende-text-secondary">{r.totalTrips||0}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {!r.isApproved&&<button onClick={()=>patchRider(r.id,'approve','active')} className="px-3 py-1.5 bg-twende-success/10 text-twende-success font-bold text-[10px] uppercase tracking-wider rounded hover:bg-twende-success hover:text-white transition-colors">Approve</button>}
                                {r.status!=='suspended'&&<button onClick={()=>patchRider(r.id,'suspend','suspended')} className="px-3 py-1.5 bg-twende-error/10 text-twende-error font-bold text-[10px] uppercase tracking-wider rounded hover:bg-twende-error hover:text-white transition-colors">Suspend</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* APPROVALS */}
              {tab === 'approvals' && (
                <div className="space-y-4">
                  {pending.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-twende-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 bg-twende-success/10 text-twende-success rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                        <HiOutlineCheck />
                      </div>
                      <h2 className="text-2xl font-bold text-twende-text mb-2">You're all caught up!</h2>
                      <p className="text-twende-text-secondary">There are no pending rider approvals at this time.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pending.map((r,i) => (
                        <div key={r.id||i} className="bg-white rounded-2xl border border-twende-border p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-bold text-twende-text text-lg">{r.name||r.fullName||'Rider'}</p>
                              <p className="text-sm text-twende-text-secondary mt-1">{r.phone||'—'}</p>
                            </div>
                            <span className="bg-twende-accent/10 text-twende-accent text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Pending</span>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                            <div className="flex justify-between">
                              <span className="text-xs text-twende-text-secondary font-bold uppercase tracking-wider">Vehicle</span>
                              <span className="text-sm font-semibold text-twende-text">{r.vehicleType||r.vehicleModel||'—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-twende-text-secondary font-bold uppercase tracking-wider">Plate #</span>
                              <span className="text-sm font-semibold text-twende-text">{r.licensePlate||r.plateNumber||'—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-twende-text-secondary font-bold uppercase tracking-wider">Joined</span>
                              <span className="text-sm font-semibold text-twende-text">{r.createdAt?new Date(r.createdAt).toLocaleDateString():'—'}</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button onClick={()=>patchRider(r.id,'suspend','suspended')} className="flex-1 py-3 rounded-xl border border-twende-error/30 text-twende-error font-bold hover:bg-twende-error/5 transition-colors flex items-center justify-center gap-2">
                              <HiOutlineXCircle /> Reject
                            </button>
                            <button onClick={()=>patchRider(r.id,'approve','active')} className="flex-1 py-3 rounded-xl bg-twende-primary text-white font-bold hover:bg-twende-primary-hover transition-colors shadow-sm flex items-center justify-center gap-2">
                              <HiOutlineCheck /> Approve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TRIPS */}
              {tab === 'trips' && (
                <div className="bg-white rounded-2xl border border-twende-border shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-twende-border">
                    <h3 className="font-bold text-twende-text text-lg">All Trips ({trips.length})</h3>
                  </div>
                  
                  <div className="md:hidden divide-y divide-twende-border">
                    {trips.map((t,i)=>(
                      <div key={t.id||i} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold ${sbadge(t.status)}`}>{t.status}</span>
                          <span className="text-xs font-bold text-twende-text-secondary">{t.createdAt?new Date(t.createdAt).toLocaleDateString():'—'}</span>
                        </div>
                        <div className="mb-4">
                          <p className="font-bold text-sm text-twende-text flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-twende-text"></span>{t.pickupLocation||'—'}</p>
                          <p className="text-xs text-twende-text-secondary mt-1 ml-3.5"><span className="w-1.5 h-1.5 rounded-full bg-twende-primary"></span>{t.dropoffLocation||'—'}</p>
                        </div>
                        <div className="font-black text-twende-text text-lg border-t border-twende-border pt-3">
                          TZS {parseFloat(t.fare||0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-twende-border text-xs font-bold text-twende-text-secondary uppercase tracking-wider">
                        <tr>{['ID','Route','Status','Fare','Date'].map(h=><th key={h} className="px-6 py-4">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-twende-border">
                        {trips.map((t,i)=>(
                          <tr key={t.id||i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-twende-text-secondary">#{t.id||i+1}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-twende-text">{t.pickupLocation||'—'}</p>
                              <p className="text-xs text-twende-text-secondary mt-0.5">to {t.dropoffLocation||'—'}</p>
                            </td>
                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${sbadge(t.status)}`}>{t.status}</span></td>
                            <td className="px-6 py-4 font-black text-twende-text">TZS {parseFloat(t.fare||0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-twende-text-secondary">{t.createdAt?new Date(t.createdAt).toLocaleDateString():'—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PASSENGERS */}
              {tab === 'passengers' && (
                <div className="bg-white rounded-2xl border border-twende-border shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-twende-border">
                    <h3 className="font-bold text-twende-text text-lg">All Passengers ({users.length})</h3>
                  </div>
                  <div className="divide-y divide-twende-border">
                    {users.map((u,i)=>(
                      <div key={u.id||i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-twende-text text-lg shrink-0">
                          {(u.name||u.fullName||'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-twende-text text-base">{u.name||u.fullName||'—'}</p>
                          <p className="text-sm text-twende-text-secondary mt-0.5">{u.phone||u.email||'—'}</p>
                        </div>
                        <div className="hidden sm:block text-right">
                          <p className="text-xs font-bold text-twende-text-secondary uppercase tracking-wider">Joined</p>
                          <p className="text-sm text-twende-text font-semibold">{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</p>
                        </div>
                      </div>
                    ))}
                    {users.length===0&&<p className="text-center text-twende-text-secondary py-12 text-sm">No passengers yet</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
