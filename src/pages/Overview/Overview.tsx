import { useNavigate } from "react-router-dom";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import DashboardStatCards from "@/Components/Dashboard/Overview/DashboardStatCards";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Package, Layers, Users, Megaphone, Mail, UserCog, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/utils/money";
import { formatDate } from "@/utils/dateFormet";
import { getRealOrderStatusTheme, getRealPaymentStatusTheme } from "@/utils/orderStatus";
import { usePermission } from "@/hooks/usePermission";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetCustomersQuery } from "@/redux/features/customer/customerApi";
import { useGetCouponsQuery } from "@/redux/features/coupon/couponApi";
import { useGetNewsletterSubscribersQuery } from "@/redux/features/newsletter/newsletterApi";
import { useGetStaffsQuery } from "@/redux/features/staff/staffApi";
import { useGetOrdersQuery } from "@/redux/features/order/orderApi";
import { useGetSalesReportQuery, useGetOrderCountReportQuery, useGetInventoryReportQuery } from "@/redux/features/report/reportApi";
import type { IDashboardStats, IOrder } from "@/types";

// This page is the cross-module launchpad — what's happening everywhere.
// For sales-specific charts and trends, see Sales > Sales Overview instead;
// deliberately not duplicated here.
const OverviewPage = () => {
  const navigate = useNavigate();

  const canViewProducts = usePermission("product.view");
  const canViewCategories = usePermission("category.view");
  const canViewCustomers = usePermission("customer.view");
  const canViewCoupons = usePermission("coupon.view");
  const canViewNewsletter = usePermission("newsletter.view");
  const canViewStaff = usePermission("staff.view");
  const canViewOrders = usePermission("order.view");
  const canViewReports = usePermission("report.view");

  const { data: salesRes } = useGetSalesReportQuery(undefined, { skip: !canViewReports });
  const { data: orderCountRes } = useGetOrderCountReportQuery(undefined, { skip: !canViewReports });
  const { data: inventoryRes } = useGetInventoryReportQuery(undefined, { skip: !canViewReports });

  const { data: pendingOrdersRes, isFetching: loadingPending } = useGetOrdersQuery(
    { status: "PENDING", limit: 5, sort: "-createdAt" },
    { skip: !canViewOrders }
  );
  const { data: verificationOrdersRes, isFetching: loadingVerification } = useGetOrdersQuery(
    { paymentStatus: "PENDING_VERIFICATION", limit: 5, sort: "-createdAt" },
    { skip: !canViewOrders }
  );

  const { data: productsRes } = useGetProductsQuery({ limit: 1 }, { skip: !canViewProducts });
  const { data: categoriesRes } = useGetCategoriesQuery({ page: 1, limit: 1, status: "Active" }, { skip: !canViewCategories });
  const { data: customersRes } = useGetCustomersQuery({ limit: 1 }, { skip: !canViewCustomers });
  const { data: couponsRes } = useGetCouponsQuery({ page: 1, limit: 1, status: "Active" }, { skip: !canViewCoupons });
  const { data: subscribersRes } = useGetNewsletterSubscribersQuery({ page: 1, limit: 1, status: "subscribed" }, { skip: !canViewNewsletter });
  const { data: staffRes } = useGetStaffsQuery({ limit: 1 }, { skip: !canViewStaff });

  const stats: IDashboardStats = {
    salesToday: salesRes?.data?.today.amountInPoisha ?? 0,
    pendingOrders: orderCountRes?.data?.pending ?? 0,
    // meta.total reflects every matching order server-side, independent of
    // the small `limit` used to also fetch this list's actual rows below.
    pendingPaymentVerification: verificationOrdersRes?.data?.meta?.total ?? 0,
    lowStockItems: (inventoryRes?.data?.lowStock.length ?? 0) + (inventoryRes?.data?.outOfStock.length ?? 0),
  };

  const snapshot = [
    {
      label: "Products",
      value: productsRes?.data?.meta?.total ?? 0,
      sub: "in catalog",
      icon: Package,
      color: "text-secondary-color bg-secondary-color/10",
      url: "/admin/products",
      visible: canViewProducts,
    },
    {
      label: "Categories",
      value: categoriesRes?.data?.meta?.total ?? 0,
      sub: "active",
      icon: Layers,
      color: "text-blue-600 bg-blue-50",
      url: "/admin/categories",
      visible: canViewCategories,
    },
    {
      label: "Customers",
      value: customersRes?.data?.meta?.total ?? 0,
      sub: "total accounts",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
      url: "/admin/customers",
      visible: canViewCustomers,
    },
    {
      label: "Active Coupons",
      value: couponsRes?.meta?.total ?? 0,
      sub: "running now",
      icon: Megaphone,
      color: "text-purple-600 bg-purple-50",
      url: "/admin/coupons",
      visible: canViewCoupons,
    },
    {
      label: "Newsletter Subscribers",
      value: subscribersRes?.data?.meta?.total ?? 0,
      sub: "subscribed",
      icon: Mail,
      color: "text-pink-600 bg-pink-50",
      url: "/admin/newsletter",
      visible: canViewNewsletter,
    },
    {
      label: "Admins & Staff",
      value: staffRes?.data?.meta?.total ?? 0,
      sub: "accounts",
      icon: UserCog,
      color: "text-amber-600 bg-amber-50",
      url: "/admin/admins",
      visible: canViewStaff,
    },
  ].filter((card) => card.visible);

  // "Needs attention" = awaiting confirmation, or a wallet payment awaiting
  // staff verification — the two states where the order is stalled on staff
  // action, not the customer's or the courier's.
  const attentionOrders = (() => {
    const byId = new Map<string, IOrder>();
    [...(pendingOrdersRes?.data?.data ?? []), ...(verificationOrdersRes?.data?.data ?? [])].forEach((order) => byId.set(order._id, order));
    return Array.from(byId.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  })();

  const columns: Column<IOrder>[] = [
    { header: "Order #", accessorKey: "orderNumber", render: (val) => <span className="font-bold">{val as string}</span> },
    {
      header: "Customer",
      accessorKey: "customerSnapshot",
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.customerSnapshot.name}</p>
          <p className="text-xs text-secondbase-color">{row.customerSnapshot.phone}</p>
        </div>
      ),
    },
    { header: "Total", accessorKey: "grandTotalInPoisha", render: (val) => formatMoney(val as number) },
    {
      header: "Order Status",
      accessorKey: "status",
      render: (val) => <Tag theme={getRealOrderStatusTheme(val as IOrder["status"])}>{val as string}</Tag>,
    },
    {
      header: "Payment",
      accessorKey: "paymentStatus",
      render: (val, row) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs text-secondbase-color">{row.paymentMethod}</span>
          <Tag theme={getRealPaymentStatusTheme(val as IOrder["paymentStatus"])}>{val as string}</Tag>
        </div>
      ),
    },
    { header: "Placed", accessorKey: "createdAt", render: (val) => formatDate(val as string) },
    {
      header: "Action",
      accessorKey: "_id",
      // No per-order detail route exists on this SPA (order detail opens as
      // a sheet from within the order list pages) — send staff to the list,
      // same destination "View All Orders" already uses, not a fake deep link.
      render: () => (
        <Button variant="secondary" size="sm" className="text-xs py-1 h-auto" onClick={() => navigate("/admin/orders")}>
          View Order
        </Button>
      ),
    },
  ];

  return (
    <PageWraper title="Dashboard Overview" description="What's happening across the whole store today — for sales trends and charts, see Sales Overview">
      {canViewReports && <DashboardStatCards stats={stats} />}

      {snapshot.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-base-color mb-3">Store at a Glance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {snapshot.map(({ label, value, sub, icon: Icon, color, url }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(url)}
                className="group bg-white rounded-xl border border-border shadow-sm p-4 text-left hover:border-secondary-color/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`size-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <ArrowUpRight className="size-3.5 text-secondbase-color opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold text-base-color">{value}</p>
                <p className="text-xs text-secondbase-color mt-0.5">{label} · {sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {canViewOrders && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-base-color">Orders Needing Attention</h2>
              <p className="text-sm text-secondbase-color">Pending fulfilment or awaiting payment verification</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
              View All Orders
            </Button>
          </div>
          {loadingPending || loadingVerification ? (
            <div className="py-10 flex justify-center"><span className="text-sm text-secondbase-color">Loading…</span></div>
          ) : (
            <ReusableTable data={attentionOrders} columns={columns} />
          )}
        </div>
      )}
    </PageWraper>
  );
};

export default OverviewPage;
