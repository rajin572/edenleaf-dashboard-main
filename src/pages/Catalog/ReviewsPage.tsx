import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ReuseRating from "@/Components/ui/CustomUi/ReuseRating";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Eye, Trash2, CheckCircle2, XCircle, EyeOff } from "lucide-react";
import ReviewDetailModal from "@/Components/Dashboard/Reviews/ReviewDetailModal";
import { usePermission } from "@/hooks/usePermission";
import { formatDate } from "@/utils/dateFormet";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { useGetReviewsQuery, useModerateReviewMutation, useDeleteReviewMutation } from "@/redux/features/review/reviewApi";
import type { IReview, TReviewStatus } from "@/types";

const STATUS_OPTIONS: { value: TReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIDDEN", label: "Hidden" },
];

const STATUS_THEME: Record<TReviewStatus, "warning" | "success" | "error" | "blue"> = {
  PENDING: "warning", APPROVED: "success", REJECTED: "error", HIDDEN: "blue",
};

interface ModerationTarget { review: IReview; action: Exclude<TReviewStatus, "PENDING"> }

const MODERATION_COPY: Record<ModerationTarget["action"], { title: string; description: string; confirmText: string; variant: "success" | "danger"; iconPreset: "approve" | "decline" | "block"; reasonRequired: boolean }> = {
  APPROVED: { title: "Approve this review?", description: "It becomes visible on the product page immediately.", confirmText: "Approve", variant: "success", iconPreset: "approve", reasonRequired: false },
  REJECTED: { title: "Reject this review?", description: "It never appears publicly. The customer can see the rejection note on their own review history.", confirmText: "Reject", variant: "danger", iconPreset: "decline", reasonRequired: false },
  HIDDEN: { title: "Hide this review?", description: "It's removed from the storefront but still shows in this queue and the customer's own history as Hidden. For a permanent removal, use Delete instead.", confirmText: "Hide", variant: "danger", iconPreset: "block", reasonRequired: false },
};

const ReviewsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TReviewStatus | "">("PENDING");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [moderationTarget, setModerationTarget] = useState<ModerationTarget | null>(null);
  const [deleting, setDeleting] = useState<IReview | null>(null);

  const canModerate = usePermission("review.moderate");
  const canDelete = usePermission("review.delete");

  const { data, isFetching } = useGetReviewsQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, status: status || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const reviews = data?.data.data ?? [];
  const meta = data?.data.meta;
  const viewing = reviews.find((r) => r._id === viewingId) ?? null;

  const [moderateReview] = useModerateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleModerate = async (_record: IReview, reason?: string) => {
    if (!moderationTarget) return;
    await tryCatchWrapper(
      moderateReview,
      { params: { id: moderationTarget.review._id }, body: { status: moderationTarget.action, ...(reason ? { note: reason } : {}) } },
      { toastLoadingMessage: "Updating review..." }
    );
    setModerationTarget(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await tryCatchWrapper(deleteReview, { params: { id: deleting._id } }, { toastLoadingMessage: "Deleting review..." });
    if (res?.success) setDeleting(null);
  };

  const columns: Column<IReview>[] = [
    { header: "Rating", accessorKey: "rating", render: (val) => <ReuseRating value={val} canChange={false} size={14} /> },
    {
      header: "Review", accessorKey: "text", width: 280, render: (val, row) => (
        <div>
          <span className="line-clamp-2 text-sm">{val}</span>
          {row.moderationNote && <p className="text-xs text-secondbase-color italic mt-1">Note: {row.moderationNote}</p>}
        </div>
      ),
    },
    {
      header: "Reviewer", accessorKey: "reviewer", render: (_val, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.reviewer.name}</span>
          {row.verifiedPurchase && <Tag theme="blue" className="w-fit">Verified</Tag>}
        </div>
      ),
    },
    { header: "Order", accessorKey: "orderId", render: (val) => <span className="text-xs font-mono text-secondbase-color">{String(val).slice(-8)}</span> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={STATUS_THEME[val as TReviewStatus]}>{val}</Tag> },
    { header: "Submitted", accessorKey: "createdAt", render: (val) => formatDate(val) },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-1.5">
          {canModerate && row.status !== "APPROVED" && (
            <Button variant="ghost" size="icon" title="Approve" className="h-8 w-8 text-success bg-success/10" onClick={() => setModerationTarget({ review: row, action: "APPROVED" })}>
              <CheckCircle2 className="size-4" />
            </Button>
          )}
          {canModerate && row.status !== "REJECTED" && (
            <Button variant="ghost" size="icon" title="Reject" className="h-8 w-8 text-error bg-error/10" onClick={() => setModerationTarget({ review: row, action: "REJECTED" })}>
              <XCircle className="size-4" />
            </Button>
          )}
          {canModerate && row.status !== "HIDDEN" && (
            <Button variant="ghost" size="icon" title="Hide" className="h-8 w-8 text-amber-600 bg-amber-50" onClick={() => setModerationTarget({ review: row, action: "HIDDEN" })}>
              <EyeOff className="size-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" title="View" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
            <Eye className="size-4" />
          </Button>
          {canDelete && (
            <Button variant="ghost" size="icon" title="Delete" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setDeleting(row)}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWraper title="Reviews" description="Moderation queue — customer reviews only appear on the storefront once approved.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by review text or reviewer..." className="max-w-md" />
          <ReuseFilterSelect
            label="Status"
            value={status}
            onChange={(v) => { setStatus(v as TReviewStatus | ""); setCurrentPage(1); }}
            options={STATUS_OPTIONS}
            allowClear
            onClear={() => setStatus("")}
          />
        </div>
        {isFetching ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <ReusableTable
            data={reviews}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <ReviewDetailModal
        open={!!viewing}
        onOpenChange={(o) => !o && setViewingId(null)}
        review={viewing}
        canModerate={canModerate}
        onModerate={(action) => viewing && setModerationTarget({ review: viewing, action })}
      />

      {moderationTarget && (
        <ConfirmModal
          open={!!moderationTarget}
          onCancel={() => setModerationTarget(null)}
          currentRecord={moderationTarget.review}
          onConfirm={handleModerate}
          title={MODERATION_COPY[moderationTarget.action].title}
          description={MODERATION_COPY[moderationTarget.action].description}
          confirmText={MODERATION_COPY[moderationTarget.action].confirmText}
          variant={MODERATION_COPY[moderationTarget.action].variant}
          iconPreset={MODERATION_COPY[moderationTarget.action].iconPreset}
          withReason={moderationTarget.action !== "APPROVED"}
          reasonLabel="Note (optional, visible to the customer)"
          reasonRequired={false}
        />
      )}

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this review?"
        description="This permanently removes it from the storefront and the customer's own review history — unlike Hide, this cannot be undone."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default ReviewsPage;
