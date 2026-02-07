import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseableSheet from "@/Components/ui/CustomUi/ReuseableSheet";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, History } from "lucide-react";
import CouponFormModal from "@/Components/Dashboard/Marketing/CouponFormModal";
import { usePermission } from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponRedemptionsQuery,
} from "@/redux/features/coupon/couponApi";
import type { ICoupon, ICouponFormValues } from "@/types";

const STATUS_THEME: Record<ICoupon["status"], "success" | "warning" | "error"> = {
  active: "success",
  inactive: "warning",
  archived: "error",
};

const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

function RedemptionHistorySheet({ coupon, onOpenChange }: { coupon: ICoupon; onOpenChange: (open: boolean) => void }) {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetCouponRedemptionsQuery({ id: coupon._id, page, limit: 10 });
  const redemptions = data?.data ?? [];
  const meta = data?.meta;

  return (
    <ReuseableSheet
      open
      onOpenChange={onOpenChange}
      title={`Redemptions — ${coupon.code}`}
      description={`${coupon.usedCount} total use${coupon.usedCount === 1 ? "" : "s"}${coupon.usageLimit ? ` of ${coupon.usageLimit}` : ""}.`}
      width="sm:max-w-lg"
    >
      {isFetching ? (
        <div className="py-16 flex justify-center"><SpinLoader /></div>
      ) : redemptions.length === 0 ? (
        <p className="text-center text-sm text-secondbase-color py-16">No redemptions yet.</p>
      ) : (
        <div className="space-y-3">
          {redemptions.map((r) => (
            <div key={r._id} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.user?.name ?? "—"}</span>
                <Tag theme={r.status === "Applied" ? "success" : "error"}>{r.status}</Tag>
              </div>
              <p className="text-xs text-secondbase-color">{r.user?.email ?? "—"}</p>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-secondbase-color">Discount</span>
                <span className="font-semibold">{formatMoney(r.discountInPoisha)}</span>
              </div>
              <p className="text-xs text-secondbase-color mt-1">{new Date(r.appliedAt).toLocaleString()}</p>
            </div>
          ))}
          {meta && meta.totalPage > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= meta.totalPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </ReuseableSheet>
  );
}

const CouponsPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICoupon | null>(null);
  const [deleting, setDeleting] = useState<ICoupon | null>(null);
  const [viewingHistory, setViewingHistory] = useState<ICoupon | null>(null);

  const canCreate = usePermission("coupon.create");
  const canUpdate = usePermission("coupon.update");
  const canDelete = usePermission("coupon.delete");

  // Coupon's list envelope is flat (data: ICoupon[], meta at the top level) —
  // unlike Banner/Combo/Newsletter's nested {data:{data,meta}} shape.
  const { data, isFetching } = useGetCouponsQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const coupons = data?.data ?? [];
  const meta = data?.meta;

  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const openAddModal = () => { setEditing(null); setModalOpen(true); };
  const openEditModal = (coupon: ICoupon) => { setEditing(coupon); setModalOpen(true); };

  const handleSave = async (values: ICouponFormValues) => {
    const result = editing
      ? await tryCatchWrapper(updateCoupon, { body: values, params: { id: editing._id } }, { toastLoadingMessage: "Saving coupon..." })
      : await tryCatchWrapper(createCoupon, { body: values }, { toastLoadingMessage: "Creating coupon..." });
    if (result?.success) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await tryCatchWrapper(deleteCoupon, { params: { id: deleting._id } }, { toastLoadingMessage: "Deleting coupon..." });
    if (res?.success) setDeleting(null);
  };

  const columns: Column<ICoupon>[] = [
    { header: "Code", accessorKey: "code", render: (val, row) => (
      <div>
        <span className="font-mono font-bold">{val}</span>
        <p className="text-xs text-secondbase-color">{row.name}</p>
      </div>
    ) },
    { header: "Discount", accessorKey: "value", render: (val, row) => (row.type === "percentage" ? `${val}%` : formatMoney(val)) },
    { header: "Min. Order", accessorKey: "minOrderInPoisha", render: (val) => (val ? formatMoney(val) : "—") },
    { header: "Usage", accessorKey: "usedCount", render: (val, row) => `${val}${row.usageLimit ? ` / ${row.usageLimit}` : ""}` },
    { header: "Expires", accessorKey: "expiresAt", render: (val) => new Date(val).toLocaleDateString() },
    {
      header: "Status", accessorKey: "status", render: (val, row) => (
        <div className="flex flex-col gap-1">
          <Tag theme={STATUS_THEME[val as ICoupon["status"]]} className="capitalize">{val}</Tag>
          {val !== "archived" && isExpired(row.expiresAt) && <Tag theme="error">Expired</Tag>}
        </div>
      ),
    },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Redemption history" className="h-8 w-8 text-purple-600 bg-purple-50" onClick={() => setViewingHistory(row)}>
            <History className="size-4" />
          </Button>
          {canUpdate && row.status !== "archived" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50" onClick={() => openEditModal(row)}>
              <Edit className="size-4" />
            </Button>
          )}
          {canDelete && row.status !== "archived" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setDeleting(row)}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Coupons"
      description="Create and manage discount coupons customers can apply at checkout."
      actions={canCreate ? <Button onClick={openAddModal}><Plus className="mr-2 size-4" /> Create Coupon</Button> : undefined}
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search by coupon code..." setSearch={setSearch} setPage={setCurrentPage} />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={coupons}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <CouponFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />

      {viewingHistory && (
        <RedemptionHistorySheet coupon={viewingHistory} onOpenChange={(open) => !open && setViewingHistory(null)} />
      )}

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this coupon?"
        description="Customers will no longer be able to apply this code."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default CouponsPage;
