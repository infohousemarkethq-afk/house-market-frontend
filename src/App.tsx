import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { queryClient } from "./api/queryClient";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";
import UnitDetail from "./pages/UnitDetail";
import Units from "./pages/Units";
import VerifyOtpPage from "./pages/VerifyOtpPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Signed out only — a signed-in user landing here goes home. */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/units" element={<Units />} />
                <Route path="/units/:id" element={<UnitDetail />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#141412",
            color: "#F5F3EF",
            borderRadius: "10px",
            fontSize: "14px",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
