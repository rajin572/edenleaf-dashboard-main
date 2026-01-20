import OverviewPage from "@/pages/Overview/Overview";
import {
  LayoutDashboard, ShoppingCart, Package, Box, Users, Megaphone,
  ListOrdered, Layers, Star, Image, Sparkles, PackagePlus, FileBarChart,
  Settings, UserCheck, Truck, Clock, Loader, Mail, ShieldCheck, UserCog, Undo2,
  BarChart3, Ban, Wallet, Banknote,
} from "lucide-react";

import SalesOverviewPage from "@/pages/Sales/SalesOverviewPage";
import OrdersPage from "@/pages/Sales/OrdersPage";
import PendingOrdersPage from "@/pages/Sales/PendingOrdersPage";
import RunningOrdersPage from "@/pages/Sales/RunningOrdersPage";
import ReturnsPage from "@/pages/Sales/ReturnsPage";
import ManualOrdersPage from "@/pages/Sales/ManualOrdersPage";
import OrderTrackingPage from "@/pages/Sales/OrderTrackingPage";

import BannersPage from "@/pages/Website/BannersPage";
import CategoriesPage from "@/pages/Catalog/CategoriesPage";
import ProductsPage from "@/pages/Catalog/ProductsPage";
import CombosPage from "@/pages/Website/CombosPage";
import FeaturedProductsPage from "@/pages/Website/FeaturedProductsPage";
import NewArrivalsPage from "@/pages/Website/NewArrivalsPage";
import ReviewsPage from "@/pages/Catalog/ReviewsPage";

import StockPage from "@/pages/Inventory/StockPage";
import CustomersPage from "@/pages/Customers/CustomersPage";
import BlocklistPage from "@/pages/Customers/BlocklistPage";
import CouponsPage from "@/pages/Marketing/CouponsPage";
import NewsletterPage from "@/pages/Marketing/NewsletterPage";
import BasicReportsPage from "@/pages/Reports/BasicReportsPage";

import RevenuePage from "@/pages/Finance/RevenuePage";
import RemittancePage from "@/pages/Finance/RemittancePage";

import EmployeesPage from "@/pages/Staff/EmployeesPage";
import RolesPage from "@/pages/Staff/RolesPage";

import SettingsPage from "@/pages/Settings/SettingsPage";
import ProfilePage from "@/pages/Settings/ProfilePage";

/**
 * V1 scope only — see planning/admin_dashboard_design_plan.md §2.
 *
 * The codebase has far more pages scaffolded (Inventory/Purchases &
 * Suppliers & Warehouses, Customers/Segments, Marketing/Campaigns &
 * Promotions, Staff/Permissions) than V1 needs — those belong to later
 * versions and are deliberately not wired into this nav. The page files
 * still exist on disk for when their version comes up; don't delete them.
 * Staff/EmployeesPage and Staff/RolesPage ARE wired in (Administration group
 * below) — Permissions is folded into the role edit modal instead of being
 * its own page, so Staff/PermissionsPage.tsx stays unwired. Finance/RevenuePage
 * and Finance/RemittancePage ARE wired in (Finance group below); only
 * Finance/CogsPage and Finance/ExpensesPage stay unwired — COGS/profitability
 * has no backend at all (out of scope through V5). Don't confuse
 * Finance/ReportsPage.tsx (unwired dummy stub) with the real Reports nav
 * entry below, which is Reports/BasicReportsPage.tsx.
 */
export const adminRoutes = [
  {
    title: "",
    items: [
      {
        title: "Dashboard",
        url: "overview",
        icon: LayoutDashboard,
        element: <OverviewPage />,
      },
    ],
  },
  {
    title: "Website Management",
    items: [
      {
        title: "Banner Management",
        url: "banners",
        permission: "banner.view",
        icon: Image,
        element: <BannersPage />,
      },
      {
        title: "Category",
        url: "categories",
        permission: "category.view",
        icon: Layers,
        element: <CategoriesPage />,
      },
      {
        title: "Product",
        url: "products",
        permission: "product.view",
        icon: Package,
        element: <ProductsPage />,
      },
      {
        title: "Combo",
        url: "combos",
        permission: "combo.view",
        icon: Box,
        element: <CombosPage />,
      },
      {
        title: "Featured Product",
        url: "featured-products",
        permission: "product.view",
        icon: Star,
        element: <FeaturedProductsPage />,
      },
      {
        title: "New Arrivals",
        url: "new-arrivals",
        permission: "product.view",
        icon: Sparkles,
        element: <NewArrivalsPage />,
      },
      {
        title: "Reviews",
        url: "reviews",
        permission: "review.view",
        icon: PackagePlus,
        element: <ReviewsPage />,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        title: "Sales Overview",
        url: "sales-overview",
        permission: "order.view",
        icon: BarChart3,
        element: <SalesOverviewPage />,
      },
      {
        title: "Orders",
        url: "orders",
        permission: "order.view",
        icon: ShoppingCart,
        element: <OrdersPage />,
      },
      {
        title: "Pending Orders",
        url: "orders/pending",
        permission: "order.view",
        icon: Clock,
        element: <PendingOrdersPage />,
      },
      {
        title: "Running Orders",
        url: "orders/running",
        permission: "order.view",
        icon: Loader,
        element: <RunningOrdersPage />,
      },
      {
        title: "Returns",
        url: "orders/returns",
        permission: "order.view",
        icon: Undo2,
        element: <ReturnsPage />,
      },
      {
        title: "Manual Orders",
        url: "manual-orders",
        permission: "order.create",
        icon: ListOrdered,
        element: <ManualOrdersPage />,
      },
      {
        title: "Track Order",
        url: "order-tracking",
        permission: "order.view",
        icon: Truck,
        element: <OrderTrackingPage />,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Stock",
        url: "stock",
        permission: "inventory.view",
        icon: Box,
        element: <StockPage />,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        title: "All Customers",
        url: "customers",
        permission: "customer.view",
        icon: Users,
        element: <CustomersPage />,
      },
      {
        title: "Blocklist",
        url: "customers/blocklist",
        permission: "customer.block",
        icon: Ban,
        element: <BlocklistPage />,
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Coupons",
        url: "coupons",
        permission: "coupon.view",
        icon: Megaphone,
        element: <CouponsPage />,
      },
      {
        title: "Newsletter",
        url: "newsletter",
        permission: "newsletter.view",
        icon: Mail,
        element: <NewsletterPage />,
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Reports",
        url: "reports",
        permission: "report.view",
        icon: FileBarChart,
        element: <BasicReportsPage />,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Ledger / Revenue",
        url: "finance/ledger",
        permission: "finance.view",
        icon: Wallet,
        element: <RevenuePage />,
      },
      {
        title: "Remittance",
        url: "finance/remittance",
        permission: "remittance.view",
        icon: Banknote,
        element: <RemittancePage />,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Admins",
        url: "admins",
        permission: "staff.view",
        icon: UserCog,
        element: <EmployeesPage />,
      },
      {
        title: "Roles & Permissions",
        url: "roles",
        permission: "staff.manage_roles",
        icon: ShieldCheck,
        element: <RolesPage />,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Store Settings",
        url: "settings",
        permission: "settings.view",
        icon: Settings,
        element: <SettingsPage />,
      },
      {
        // No permission — every signed-in staff member manages their own account.
        title: "My Profile",
        url: "profile",
        icon: UserCheck,
        element: <ProfilePage />,
      },
    ],
  },
];
