import { Navigate, Outlet } from "react-router";

import Loader from "../components/ui/Loader";
import { useAuth } from "../features/auth/hooks/useAuth";

const PublicOnlyRoute = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Loader fullScreen label="Checking your session" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default PublicOnlyRoute;
