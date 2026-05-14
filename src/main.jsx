import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App.jsx";
import { RideProvider } from "./context/RideContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationProvider, NotificationPermissionBanner } from "./components/PushNotifications";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <NotificationProvider>
            <AuthProvider>
              <RideProvider>
                <NotificationPermissionBanner />
                <App />
              </RideProvider>
            </AuthProvider>
          </NotificationProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
