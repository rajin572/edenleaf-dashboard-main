import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Search, PackageSearch, Phone, Ban } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { formatDate } from "@/utils/dateFormet";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useSearchOrdersForTrackingQuery,
  useGetOrderAccessHistoryQuery,
  useRevokeOrderAccessMutation,
} from "@/redux/features/guestOrderAccess/guestOrderAccessApi";
import type { IGuestOrderAccessRecord, IOrderTrackingSummary } from "@/types";

// Staff-facing lookup of a guest order's tracking-link history (issued /
// expired / revoked) — a completely different feature from the customer-
// facing delivery-status timeline, which lives on the order detail sheet.
const OrderTrackingPage = () => {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrderTrackingSummary | null>(null);
  const [revoking, setRevoking] = useState<IGuestOrderAccessRecord | null>(null);
  const canUpdate = usePermission("order.update");

  const { data, isFetching } = useSearchOrdersForTrackingQuery(submitted, { skip: !submitted });
  const matches = data?.data.data ?? [];

  const { data: historyRes, isFetching: historyLoading } = useGetOrderAccessHistoryQuery(selectedOrder?._id ?? "", { skip: !selectedOrder });
  const history = historyRes?.data ?? [];

  const [revokeOrderAccess] = useRevokeOrderAccessMutation();

  const handleSearch = () => {
    setSubmitted(query);
    setSelectedOrder(null);
  };

  const handleRevoke = async (record: IGuestOrderAccessRecord) => {
    if (!selectedOrder) return;
    const res = await tryCatchWrapper(
      revokeOrderAccess,
      { params: { id: selectedOrder._id, accessId: record._id } },
      { toastLoadingMessage: "Revoking access..." }
    );
    if (res?.success) setRevoking(null);
  };

  const columns: Column<IGuestOrderAccessRecord>[] = [
    { header: "Contact Type", accessorKey: "contactType", render: (val) => <span className="capitalize">{val}</span> },
    { header: "State", accessorKey: "state", render: (val) => <Tag theme={val === "active" ? "success" : val === "revoked" ? "error" : "warning"}>{val}</Tag> },
    { header: "Issued", accessorKey: "createdAt", render: (val) => formatDate(val) },
    { header: "Expires", accessorKey: "expiresAt", render: (val) => formatDate(val) },
    { header: "Last Used", accessorKey: "lastUsedAt", render: (val) => (val ? formatDate(val as string) : "Never") },
    { header: "Access Count", accessorKey: "accessCount" },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          className="border-error text-error hover:bg-error/5"
          disabled={row.state !== "active" || !canUpdate}
          onClick={() => setRevoking(row)}
        >
          <Ban className="mr-1.5 size-4" /> Revoke
        </Button>
      ),
    },
  ];

  return (
    <PageWraper title="Track Order" description="Look up a guest order's tracking-link history — when it was issued, when it expires, and revoke it early if needed.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. ORD-10050 or 01933445566"
              className="pl-10 py-5 border-[#E5E5E5] bg-[#F5F5F5]"
            />
          </div>
          <Button onClick={handleSearch}>Track</Button>
        </div>
      </div>

      {isFetching && (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100"><SpinLoader /></div>
      )}

      {!isFetching && submitted && matches.length === 0 && (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
          <PackageSearch className="size-10 text-gray-300" />
          <p className="font-medium">No order found for "{submitted}"</p>
          <p className="text-sm text-secondbase-color">Check the Order ID or phone number and try again.</p>
        </div>
      )}

      {!isFetching && matches.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
          <p className="text-sm font-medium text-secondbase-color mb-2">{matches.length} order{matches.length === 1 ? "" : "s"} found — select one to view tracking history:</p>
          {matches.map((o) => (
            <button
              key={o._id}
              onClick={() => setSelectedOrder(o)}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border text-left hover:bg-gray-50 ${selectedOrder?._id === o._id ? "border-secondary-color bg-secondary-color/5" : "border-border"}`}
            >
              <div>
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-xs text-secondbase-color">{o.customerSnapshot.name} · {formatMoney(o.grandTotalInPoisha)}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{o.status}</span>
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 h-fit">
            <div>
              <p className="text-xs text-secondbase-color">Order</p>
              <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-secondbase-color"><Phone className="size-4" /> {selectedOrder.customerSnapshot.phone}</p>
              {selectedOrder.customerSnapshot.email && <p className="text-secondbase-color">{selectedOrder.customerSnapshot.email}</p>}
            </div>
            <div className="border-t border-border pt-4 flex justify-between text-sm">
              <span className="text-secondbase-color">Total</span>
              <span className="font-bold text-secondary-color">{formatMoney(selectedOrder.grandTotalInPoisha)}</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold mb-4">Guest Tracking Access History</p>
            {historyLoading ? (
              <div className="py-10 flex justify-center"><SpinLoader /></div>
            ) : history.length === 0 ? (
              <p className="text-sm text-secondbase-color py-6 text-center">No tracking link has been issued for this order yet.</p>
            ) : (
              <ReusableTable data={history} columns={columns} />
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!revoking}
        onCancel={() => setRevoking(null)}
        currentRecord={revoking}
        onConfirm={handleRevoke}
        title="Revoke this tracking link?"
        description="The customer's current tracking link will stop working immediately. They can request a new one."
        confirmText="Revoke"
        variant="danger"
        iconPreset="cancel"
      />
    </PageWraper>
  );
};

export default OrderTrackingPage;
