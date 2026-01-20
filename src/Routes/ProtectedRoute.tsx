import { Navigate } from "react-router-dom";
import useUserData from "../hooks/useUserData";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useUserData();

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // The dashboard is staff/admin-only — "user" is a customer-only role, only
  // ever issued by the website's own login.
  if (user.role === "user") {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
