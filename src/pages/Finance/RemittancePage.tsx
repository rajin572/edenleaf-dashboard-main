import { useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { AlertTriangle, Plus } from "lucide-react";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { usePermission } from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import { formatDate } from "@/utils/dateFormet";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import type { IRemittanceBatch, IRemittanceEligibleOrder, TRemittanceStatus } from "@/types";
import {
  useGetRemittancesQuery,
  useGetEligibleCodOrdersQuery,
  useCreateRemittanceMutation,
  useReconcileRemittanceMutation,
} from "@/redux/features/finance/financeApi";

const RemittancePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<TRemittanceStatus | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchNote, setBatchNote] = useState("");
  const [reconcileTarget, setReconcileTarget] = useState<IRemittanceBatch | null>(null);
  const [detailTarget, setDetailTarget] = useState<IRemittanceBatch | null>(null);

  const canCreate = usePermission("remittance.create");
  const canReconcile = usePermission("remittance.reconcile");

  const { data: batchesRes, isFetching } = useGetRemittancesQuery(
    { page: currentPage, limit: 10, status: status || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const batches = batchesRes?.data?.data ?? [];
  const meta = batchesRes?.data?.meta;

  const { data: ordersRes, isFetching: loadingOrders, isError: ordersErrored, error: ordersError } = useGetEligibleCodOrdersQuery(
    { page: 1, limit: 100 },
    { skip: !createOpen }
  );
  // The seeded `accountant` role (remittance.*, finance.*, report.view) holds
  // no `order.view` — this list can legitimately 403 for exactly the role
  // this page is built for. Surface that plainly instead of spinning forever.
  const ordersForbidden = ordersErrored && (ordersError as { status?: number } | undefined)?.status === 403;
  // Belt-and-braces client-side filter on top of the server's own filter — the
  // backend's own atomic claim in createRemittance is the real source of truth.
  const eligibleOrders = (ordersRes?.data?.data ?? []).filter((o) => !o.remittanceBatch);

  const [createRemittance] = useCreateRemittanceMutation();
  const [reconcileRemittance] = useReconcileRemittanceMutation();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedTotal = eligibleOrders
    .filter((o) => selected.has(o._id))
    .reduce((sum, o) => sum + o.codAmountInPoisha, 0);

  const handleCreateBatch = async () => {
    const res = await tryCatchWrapper(
      createRemittance,
      { body: { orderIds: Array.from(selected), note: batchNote || undefined } },
      { toastLoadingMessage: "Creating remittance batch..." }
    );
    if (res?.success) {
      setCreateOpen(false);
      setSelected(new Set());
      setBatchNote("");
    }
  };

  const handleReconcile = async (batch: IRemittanceBatch, reason?: string) => {
    const res = await tryCatchWrapper(
      reconcileRemittance,
      { params: { id: batch._id }, body: { note: reason || undefined } },
      { toastLoadingMessage: "Reconciling batch..." }
    );
    if (res?.success) setReconcileTarget(null);
  };

  const orderColumns: Column<IRemittanceEligibleOrder>[] = [
    {
      header: "", accessorKey: "_id", render: (_v, row) => (
        <Checkbox checked={selected.has(row._id)} onCheckedChange={() => toggle(row._id)} />
      )
    },
    { header: "Order #", accessorKey: "orderNumber" },
    { header: "COD Amount", accessorKey: "codAmountInPoisha", render: (v) => formatMoney(v as number) },
  ];

  const batchColumns: Column<IRemittanceBatch>[] = [
    { header: "Batch #", accessorKey: "batchNumber" },
    { header: "Orders", accessorKey: "orderCount" },
    { header: "Total", accessorKey: "totalAmountInPoisha", render: (v) => formatMoney(v as number) },
    {
      header: "Status", accessorKey: "status", render: (v) => (
        <Tag theme={v === "RECONCILED" ? "success" : "warning"}>{v as string}</Tag>
      )
    },
    { header: "Created By", accessorKey: "createdBy", render: (_v, row) => row.createdBy?.name ?? "—" },
    { header: "Reconciled At", accessorKey: "reconciledAt", render: (v) => (v ? formatDate(v as string) : "—") },
    {
      header: "Actions", accessorKey: "_id", render: (_v, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDetailTarget(row)}>View</Button>
          {row.status === "PENDING" && canReconcile && (
            <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => setReconcileTarget(row)}>
              Reconcile
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <PageWraper
      title="Remittance"
      description="Batch collected COD orders for settlement, then reconcile once the money is in."
      actions={canCreate ? (
        <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary-dark text-white">
          <Plus className="mr-2 size-4" /> Create Batch
        </Button>
      ) : undefined}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <ReuseFilterSelect
          label="Status"
          options={[{ value: "PENDING", label: "Pending" }, { value: "RECONCILED", label: "Reconciled" }]}
          value={status}
          onChange={(v) => { setStatus(v as TRemittanceStatus); setCurrentPage(1); }}
          allowClear
          onClear={() => setStatus("")}
        />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <ReusableTable data={batches} columns={batchColumns} pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={10} total={meta?.total ?? 0} />
        )}
      </div>

      <ReusableModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Remittance Batch"
        description="Select collected COD orders to batch for settlement."
        maxWidth="sm:max-w-3xl"
        footer={
          !ordersForbidden && (
            <Button disabled={selected.size === 0} onClick={handleCreateBatch} className="bg-primary text-white">
              Create Batch ({selected.size} orders, {formatMoney(selectedTotal)})
            </Button>
          )
        }
      >
        {loadingOrders ? (
          <SpinLoader />
        ) : ordersForbidden ? (
          <div className="flex gap-3 items-start rounded-md border border-amber-300 bg-amber-50 p-4">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              Your account can create remittance batches but can&apos;t view the underlying orders — this role is
              missing the <span className="font-mono font-semibold">order.view</span> permission. Ask an admin to
              grant it, or have them select the orders for this batch.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ReusableTable data={eligibleOrders} columns={orderColumns} />
            <Textarea
              placeholder="Batch note (optional)"
              value={batchNote}
              onChange={(e) => setBatchNote(e.target.value)}
            />
          </div>
        )}
      </ReusableModal>

      <ConfirmModal
        open={!!reconcileTarget}
        onCancel={() => setReconcileTarget(null)}
        currentRecord={reconcileTarget}
        onConfirm={(batch, reason) => handleReconcile(batch, reason)}
        title="Reconcile remittance batch"
        description={`Mark ${reconcileTarget?.batchNumber}'s ${reconcileTarget?.orderCount} orders as REMITTED. This cannot be undone.`}
        confirmText="Reconcile"
        variant="success"
        withReason
        reasonLabel="Reconciliation note (optional)"
        reasonRequired={false}
      />

      <ReusableModal
        open={!!detailTarget}
        onOpenChange={(v) => !v && setDetailTarget(null)}
        title={detailTarget ? `Batch ${detailTarget.batchNumber}` : "Batch"}
        maxWidth="sm:max-w-2xl"
        showCloseButton
      >
        {detailTarget && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Tag theme={detailTarget.status === "RECONCILED" ? "success" : "warning"}>{detailTarget.status}</Tag>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{formatMoney(detailTarget.totalAmountInPoisha)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created By</p>
                <p className="font-semibold">{detailTarget.createdBy?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p className="font-semibold">{formatDate(detailTarget.createdAt)}</p>
              </div>
              {detailTarget.status === "RECONCILED" && (
                <>
                  <div>
                    <p className="text-muted-foreground">Reconciled By</p>
                    <p className="font-semibold">{detailTarget.reconciledBy?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reconciled At</p>
                    <p className="font-semibold">{detailTarget.reconciledAt ? formatDate(detailTarget.reconciledAt) : "—"}</p>
                  </div>
                </>
              )}
            </div>
            {detailTarget.note && (
              <div className="text-sm">
                <p className="text-muted-foreground">Note</p>
                <p>{detailTarget.note}</p>
              </div>
            )}
            {detailTarget.reconciliationNote && (
              <div className="text-sm">
                <p className="text-muted-foreground">Reconciliation Note</p>
                <p>{detailTarget.reconciliationNote}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Orders ({detailTarget.orderCount})</p>
              <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                {detailTarget.orders.map((o) => (
                  <div key={o.order} className="flex justify-between px-4 py-2 text-sm">
                    <span>{o.orderNumber}</span>
                    <span className="font-medium">{formatMoney(o.amountInPoisha)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ReusableModal>
    </PageWraper>
  );
};

export default RemittancePage;
