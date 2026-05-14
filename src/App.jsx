import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { OfflineBanner } from "./components/OfflineBanner";
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

function App() {
  return (
    <div className="min-h-screen bg-sand-50 font-jakarta pb-20 md:pb-0">
      <OfflineBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/request" element={<RequestRidePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rider-register" element={<RiderRegisterPage />} />
        <Route path="/rider-login" element={<RiderLoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<TripHistoryPage />} />
        <Route path="/rate/:tripId" element={<RateTripPage />} />
        <Route path="/track" element={<TrackRidePage />} />
        <Route path="/dashboard" element={<RiderDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
