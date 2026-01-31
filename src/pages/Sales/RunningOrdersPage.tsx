import { useMemo, useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { ArrowRight, Ban, Eye } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import PaymentStatusCell from "@/Components/Dashboard/Orders/PaymentStatusCell";
import { getRealOrderStatusTheme } from "@/utils/orderStatus";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { useGetOrdersQuery, useGetOrderByIdQuery, useChangeOrderStatusMutation } from "@/redux/features/order/orderApi";
import type { IOrder, TOrderStatus } from "@/types";

const RUNNING_STATUSES: TOrderStatus[] = ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"];

// QueryBuilder's server-side .filter() only accepts a single status value, so
// this page fetches a broad recent set and narrows to the running statuses
// client-side — the same shape the old in-memory version used, just sourced
// from the real API now.
const RunningOrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<IOrder | null>(null);
  const [changeStatus] = useChangeOrderStatusMutation();

  const { data, isFetching } = useGetOrdersQuery(
    { limit: 100, searchTerm: search || undefined },
    { refetchOnMountOrArgChange: true },
  );
  const allOrders = data?.data.data ?? [];

  const running = useMemo(
    () => allOrders.filter((o) => RUNNING_STATUSES.includes(o.status) && (!statusFilter || o.status === statusFilter)),
    [allOrders, statusFilter],
  );
  const paged = running.slice((currentPage - 1) * 10, currentPage * 10);

  const { data: viewingRes, isFetching: viewingLoading } = useGetOrderByIdQuery(viewingId!, { skip: !viewingId });
  const viewing = viewingRes?.data ?? null;

  const handleAdvance = (order: IOrder) => {
    const next = order.legalNextStatuses.find((s) => s !== "CANCELLED");
    if (!next) return;
    tryCatchWrapper(changeStatus, { params: { id: order._id }, body: { status: next } }, { toastLoadingMessage: "Updating order..." });
  };

  const handleCancel = (order: IOrder, reason?: string) => {
    tryCatchWrapper(changeStatus, { params: { id: order._id }, body: { status: "CANCELLED", note: reason } }, { toastLoadingMessage: "Cancelling order..." });
    setCancelling(null);
  };

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderNumber", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Customer", accessorKey: "customerSnapshot", render: (_val, row) => (
      <div className="flex flex-col">
        <span>{row.customerSnapshot.name}</span>
        <span className="text-xs text-secondbase-color">{row.customerSnapshot.phone}</span>
      </div>
    ) },
    { header: "Amount", accessorKey: "grandTotalInPoisha", render: (val) => formatMoney(val) },
    { header: "Payment", accessorKey: "paymentMethod", render: (_val, row) => <PaymentStatusCell order={row} /> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={getRealOrderStatusTheme(val)}>{val}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => {
        const next = row.legalNextStatuses.find((s) => s !== "CANCELLED");
        const canCancel = row.legalNextStatuses.includes("CANCELLED");
        return (
          <div className="flex gap-2">
            {next && (
              <Button size="sm" onClick={() => handleAdvance(row)}>
                <ArrowRight className="mr-1.5 size-4" /> Mark {next.replace(/_/g, " ").toLowerCase()}
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="outline" className="border-error text-error hover:bg-error/5" onClick={() => setCancelling(row)}>
                <Ban className="mr-1.5 size-4" /> Cancel
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
              <Eye className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <PageWraper title="Running Orders" description="Accepted orders moving through confirmation, processing, packing and shipping.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="flex-1 max-w-md" />
          <ReuseFilterSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            placeholder="All Stages"
            allowClear
            onClear={() => setStatusFilter("")}
            options={RUNNING_STATUSES.map((s) => ({ label: s, value: s }))}
          />
        </div>
        {isFetching ? (
          <SpinLoader />
        ) : (
          <ReusableTable
            data={paged}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={running.length}
          />
        )}
      </div>

      <OrderDetailSheet open={!!viewingId} onOpenChange={(o) => !o && setViewingId(null)} order={viewing} isLoading={viewingLoading} />

      <ConfirmModal
        open={!!cancelling}
        onCancel={() => setCancelling(null)}
        currentRecord={cancelling}
        onConfirm={handleCancel}
        title={`Cancel ${cancelling?.orderNumber ?? "this order"}?`}
        description="The customer will see this order as cancelled."
        confirmText="Cancel Order"
        variant="danger"
        iconPreset="cancel"
        withReason
        reasonLabel="Cancellation reason"
        reasonRequired
      />
    </PageWraper>
  );
};

export default RunningOrdersPage;
