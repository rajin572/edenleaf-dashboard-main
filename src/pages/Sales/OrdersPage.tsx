import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Eye, X } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import PaymentStatusCell from "@/Components/Dashboard/Orders/PaymentStatusCell";
import { getRealOrderStatusTheme } from "@/utils/orderStatus";
import { formatDateTime } from "@/utils/dateFormet";
import { formatMoney } from "@/utils/money";
import { useGetOrdersQuery, useGetOrderByIdQuery } from "@/redux/features/order/orderApi";
import type { IOrder, TOrderStatus, TPaymentMethod } from "@/types";

const STATUS_OPTIONS: TOrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY",
  "DELIVERED", "DELIVERY_FAILED", "RETURNED_TO_ORIGIN", "CANCELLED",
];

const PAYMENT_OPTIONS: TPaymentMethod[] = ["COD", "BKASH_MANUAL", "NAGAD_MANUAL"];

const OrdersPage = () => {
  const location = useLocation();
  const navState = location.state as { searchOrderId?: string } | null;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(navState?.searchOrderId ?? "");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const { data, isFetching } = useGetOrdersQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, status: statusFilter || undefined, paymentMethod: paymentFilter || undefined },
    { refetchOnMountOrArgChange: true },
  );
  const orders = data?.data.data ?? [];
  const meta = data?.data.meta;

  const { data: viewingRes, isFetching: viewingLoading } = useGetOrderByIdQuery(viewingId!, { skip: !viewingId });
  const viewing = viewingRes?.data ?? null;

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderNumber", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Customer", accessorKey: "customerSnapshot", render: (_val, row) => row.customerSnapshot.name },
    { header: "Date", accessorKey: "createdAt", render: (val) => formatDateTime(val) },
    { header: "Amount", accessorKey: "grandTotalInPoisha", render: (val) => formatMoney(val) },
    { header: "Source", accessorKey: "source", render: (val) => <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{val}</span> },
    { header: "Payment", accessorKey: "paymentMethod", render: (_val, row) => <PaymentStatusCell order={row} /> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={getRealOrderStatusTheme(val)}>{val}</Tag> },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setViewingId(row._id)}>
          <Eye className="mr-2 size-4" /> View
        </Button>
      ),
    },
  ];

  return (
    <PageWraper title="Orders" description="View and manage all customer orders across all channels.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <ReuseSearchInput
            setSearch={setSearch}
            setPage={setCurrentPage}
            defaultValue={navState?.searchOrderId}
            placeholder="Search by Order ID or Customer..."
            className="flex-1 max-w-md"
          />
          <ReuseFilterSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            placeholder="All Statuses"
            allowClear
            onClear={() => setStatusFilter("")}
            options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
          />
          <ReuseFilterSelect
            value={paymentFilter}
            onChange={(val) => { setPaymentFilter(val); setCurrentPage(1); }}
            placeholder="All Payment Methods"
            allowClear
            onClear={() => setPaymentFilter("")}
            options={PAYMENT_OPTIONS.map((s) => ({ label: s, value: s }))}
          />
          {(statusFilter || paymentFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(""); setPaymentFilter(""); }} className="text-secondbase-color">
              <X className="mr-1 size-3.5" /> Clear filters
            </Button>
          )}
        </div>
        {isFetching ? (
          <SpinLoader />
        ) : (
          <ReusableTable
            data={orders}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <OrderDetailSheet open={!!viewingId} onOpenChange={(o) => !o && setViewingId(null)} order={viewing} isLoading={viewingLoading} />
    </PageWraper>
  );
};

export default OrdersPage;
