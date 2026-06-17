import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import { HomePage }               from './pages/HomePage';
import { RequestRidePage }        from './pages/RequestRidePage';
import { RiderDashboardPage }     from './pages/RiderDashboardPage';
import { PassengerDashboardPage } from './pages/PassengerDashboardPage';
import { TrackRidePage }          from './pages/TrackRidePage';
import { RegisterPage }           from './pages/RegisterPage';
import { LoginPage }              from './pages/LoginPage';
import { ProfilePage }            from './pages/ProfilePage';
import { RiderRegisterPage }      from './pages/RiderRegisterPage';
import { RiderLoginPage }         from './pages/RiderLoginPage';
import { TripHistoryPage }        from './pages/TripHistoryPage';
import { RateTripPage }           from './pages/RateTripPage';
import { NotFoundPage }           from './pages/NotFoundPage';
import { PaymentPage }            from './pages/PaymentPage';
import { NotificationsPage }      from './pages/NotificationsPage';
import { AdminDashboardPage }     from './pages/AdminDashboardPage';
import { MqttDemoPage }             from './pages/MqttDemoPage';

/**
 * Smart redirect after login/register:
 * - admin  → /admin
 * - rider  → /dashboard
 * - user   → /passenger-dashboard
 * - guest  → /
 */
function RootRedirect() {
  const { isAuthenticated, userType, user } = useAuth();
  if (!isAuthenticated) return <HomePage />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (userType === 'rider')   return <Navigate to="/dashboard" replace />;
  return <Navigate to="/passenger-dashboard" replace />;
}

function App() {
  return (
    <div className="min-h-screen bg-twende-navy font-jakarta pb-20 md:pb-0">
      <OfflineBanner />
      <Navbar />
      <Routes>
        {/* Root — smart redirect based on auth state */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public */}
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/rider-register" element={<RiderRegisterPage />} />
        <Route path="/rider-login"    element={<RiderLoginPage />} />
        <Route path="/home"           element={<HomePage />} />

        {/* ── PASSENGER DASHBOARD ── */}
        <Route path="/passenger-dashboard" element={
          <ProtectedRoute requiredType="user">
            <PassengerDashboardPage />
          </ProtectedRoute>
        } />

        {/* ── PASSENGER ROUTES ── */}
        <Route path="/request" element={
          <ProtectedRoute requiredType="user">
            <RequestRidePage />
          </ProtectedRoute>
        } />
        <Route path="/rate/:tripId" element={
          <ProtectedRoute requiredType="user">
            <RateTripPage />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute requiredType="user">
            <PaymentPage />
          </ProtectedRoute>
        } />

        {/* ── SHARED AUTHENTICATED ROUTES ── */}
        <Route path="/track" element={
          <ProtectedRoute>
            <TrackRidePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <TripHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/* ── RIDER DASHBOARD ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredType="rider">
            <RiderDashboardPage />
          </ProtectedRoute>
        } />

        {/* ── ADMIN DASHBOARD ── */}
        <Route path="/admin" element={
          <ProtectedRoute requiredType="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />

        {/* MQTT Demo for presentation */}
        <Route path="/mqtt-demo" element={<MqttDemoPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
