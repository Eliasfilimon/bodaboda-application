import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { OfflineBanner } from "./components/OfflineBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { RequestRidePage } from "./pages/RequestRidePage";
import { RiderDashboardPage } from "./pages/RiderDashboardPage";
import { TrackRidePage } from "./pages/TrackRidePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RiderRegisterPage } from "./pages/RiderRegisterPage";
import { RiderLoginPage } from "./pages/RiderLoginPage";
import { TripHistoryPage } from "./pages/TripHistoryPage";
import { RateTripPage } from "./pages/RateTripPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PaymentPage } from "./pages/PaymentPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

function App() {
  return (
    <div className="min-h-screen bg-sand-50 font-jakarta pb-20 md:pb-0">
      <OfflineBanner />
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rider-register" element={<RiderRegisterPage />} />
        <Route path="/rider-login" element={<RiderLoginPage />} />

        {/* Protected - any authenticated user */}
        <Route path="/request" element={
          <ProtectedRoute requiredType="user">
            <RequestRidePage />
          </ProtectedRoute>
        } />
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
        <Route path="/rate/:tripId" element={
          <ProtectedRoute>
            <RateTripPage />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/* Protected - rider only */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredType="rider">
            <RiderDashboardPage />
          </ProtectedRoute>
        } />

        {/* Admin - open in dev, protect with role in production */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
