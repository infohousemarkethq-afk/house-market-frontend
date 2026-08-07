import { Navigate, Outlet, useLocation } from "react-router";

import Callout from "../components/ui/Callout";
import Loader from "../components/ui/Loader";
import { useAuth } from "../features/auth/hooks/useAuth";

const ProtectedRoute = () => {
  const { isLoading, isAuthenticated, viewRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader fullScreen label="Checking your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!viewRole) {
    return (
      <div className="mx-auto max-w-md p-8">
        <Callout tone="warning" title="This account can't use this app">
          Platform administrators manage House Market from the platform console,
          not from a company workspace.
        </Callout>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
