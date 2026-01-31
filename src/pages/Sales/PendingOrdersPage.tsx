import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import PaymentStatusCell from "@/Components/Dashboard/Orders/PaymentStatusCell";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { formatDateTime } from "@/utils/dateFormet";
import { formatMoney } from "@/utils/money";
import { useGetOrdersQuery, useGetOrderByIdQuery, useChangeOrderStatusMutation } from "@/redux/features/order/orderApi";
import type { IOrder } from "@/types";

// New orders land here first — accept to move them into Running Orders'
// fulfillment pipeline, or reject to cancel before any work starts.
const PendingOrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<IOrder | null>(null);
  const [changeStatus] = useChangeOrderStatusMutation();

  const { data, isFetching } = useGetOrdersQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, status: "PENDING" },
    { refetchOnMountOrArgChange: true },
  );
  const orders = data?.data.data ?? [];
  const meta = data?.data.meta;

  const { data: viewingRes, isFetching: viewingLoading } = useGetOrderByIdQuery(viewingId!, { skip: !viewingId });
  const viewing = viewingRes?.data ?? null;

  const handleAccept = (order: IOrder) =>
    tryCatchWrapper(changeStatus, { params: { id: order._id }, body: { status: "CONFIRMED" } }, { toastLoadingMessage: "Accepting order..." });

  const handleReject = (order: IOrder, reason?: string) => {
    tryCatchWrapper(changeStatus, { params: { id: order._id }, body: { status: "CANCELLED", note: reason } }, { toastLoadingMessage: "Rejecting order..." });
    setRejecting(null);
  };

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderNumber", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Customer", accessorKey: "customerSnapshot", render: (_val, row) => (
      <div className="flex flex-col">
        <span>{row.customerSnapshot.name}</span>
        <span className="text-xs text-secondbase-color">{row.customerSnapshot.phone}</span>
      </div>
    ) },
    { header: "Placed", accessorKey: "createdAt", render: (val) => formatDateTime(val) },
    { header: "Amount", accessorKey: "grandTotalInPoisha", render: (val) => formatMoney(val) },
    { header: "Payment", accessorKey: "paymentMethod", render: (_val, row) => <PaymentStatusCell order={row} /> },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => handleAccept(row)}>
            <CheckCircle2 className="mr-1.5 size-4" /> Accept
          </Button>
          <Button size="sm" variant="outline" className="border-error text-error hover:bg-error/5" onClick={() => setRejecting(row)}>
            <XCircle className="mr-1.5 size-4" /> Reject
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper title="Pending Orders" description="New orders awaiting confirmation. Accept to start fulfillment, or reject to cancel.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="max-w-md" />
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

      <ConfirmModal
        open={!!rejecting}
        onCancel={() => setRejecting(null)}
        currentRecord={rejecting}
        onConfirm={handleReject}
        title={`Reject ${rejecting?.orderNumber ?? "this order"}?`}
        description="The customer will see this order as cancelled."
        confirmText="Reject Order"
        variant="danger"
        iconPreset="decline"
        withReason
        reasonLabel="Rejection reason"
        reasonRequired
      />
    </PageWraper>
  );
};

export default PendingOrdersPage;
