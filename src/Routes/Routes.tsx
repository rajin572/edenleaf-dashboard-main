import {
  createBrowserRouter,
  RouteObject,
  useNavigate,
} from "react-router-dom";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import { routeGenerator } from "@/utils/routesGenerator";
import { adminRoutes } from "./admin.route";
import { useEffect } from "react";
import Loading from "@/Components/ui/CustomUi/Loading";
import SignIn from "@/pages/Auth/SignIn";
import ForgotPassword from "@/pages/Auth/ForgetPassword";
import OTPVerify from "@/pages/Auth/OtpPage";
import UpdatePassword from "@/pages/Auth/UpdatePassword";
import NotFound from "@/Components/ui/CustomUi/NotFound/NotFound";
import useUserData from "@/hooks/useUserData";
import ProtectedRoute from "./ProtectedRoute";

function AuthRedirect() {
  const navigate = useNavigate();
  const user = useUserData();

  useEffect(() => {
    // The dashboard is staff/admin-only — "user" is a customer-only role,
    // only ever issued by the website's own login.
    if (user && user.role !== "user") {
      navigate("/admin/overview", { replace: true });
    } else {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, user]);

  return <Loading />;
}

// Define routes with TypeScript types
const router: RouteObject[] = [
  {
    path: "/",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/dashboard",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/admin/dashboard",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/overview",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/admin",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: routeGenerator(adminRoutes),
  },
  {
    path: "sign-in",
    element: <SignIn />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "forgot-password/otp-verify",
    element: <OTPVerify />,
  },
  {
    path: "update-password",
    element: <UpdatePassword />,
  },
  // {
  //   path: "password-reset-success",
  //   element: <PasswordResetSuccess />,
  // },
  {
    path: "*", // Catch-all for undefined routes
    element: <NotFound />,
  },
];

// Create the router using createBrowserRouter
const routes = createBrowserRouter(router);

export default routes;
