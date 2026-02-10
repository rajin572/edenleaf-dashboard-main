import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ReuseRating from "@/Components/ui/CustomUi/ReuseRating";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, XCircle, EyeOff } from "lucide-react";
import { formatDate } from "@/utils/dateFormet";
import type { IReview, TReviewStatus } from "@/types";

const STATUS_THEME: Record<TReviewStatus, "warning" | "success" | "error" | "blue"> = {
  PENDING: "warning", APPROVED: "success", REJECTED: "error", HIDDEN: "blue",
};

interface ReviewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: IReview | null;
  canModerate: boolean;
  onModerate: (action: Exclude<TReviewStatus, "PENDING">) => void;
}

export default function ReviewDetailModal({ open, onOpenChange, review, canModerate, onModerate }: ReviewDetailModalProps) {
  if (!review) return null;

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Review Details"
      description={review.verifiedPurchase ? "Verified purchase — linked to the order the product was delivered on." : "Not linked to a verified purchase."}
      footer={
        canModerate ? (
          <div className="flex gap-2 w-full justify-end">
            {review.status !== "APPROVED" && (
              <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => onModerate("APPROVED")}>
                <CheckCircle2 className="mr-1.5 size-4" /> Approve
              </Button>
            )}
            {review.status !== "REJECTED" && (
              <Button size="sm" variant="outline" className="border-error text-error hover:bg-error/5" onClick={() => onModerate("REJECTED")}>
                <XCircle className="mr-1.5 size-4" /> Reject
              </Button>
            )}
            {review.status !== "HIDDEN" && (
              <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" onClick={() => onModerate("HIDDEN")}>
                <EyeOff className="mr-1.5 size-4" /> Hide
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">{review.reviewer.name}</p>
            <p className="text-xs text-secondbase-color font-mono">Order …{review.orderId.slice(-8)}</p>
          </div>
          <Tag theme={STATUS_THEME[review.status]}>{review.status}</Tag>
        </div>

        <div className="flex items-center justify-between border-t border-b border-border py-3">
          <ReuseRating value={review.rating} canChange={false} size={18} showValue />
          <span className="text-xs text-secondbase-color">{formatDate(review.createdAt)}</span>
        </div>

        <div>
          <p className="text-sm font-medium mb-1.5">Review Text</p>
          <p className="text-sm text-base-color bg-gray-50 rounded-lg p-3">{review.text}</p>
        </div>

        {review.moderatedAt && (
          <div>
            <p className="text-sm font-medium mb-1.5">Moderation History</p>
            <div className="text-sm bg-gray-50 rounded-lg p-3 space-y-1">
              <p>Marked <span className="font-semibold">{review.status}</span> on {formatDate(review.moderatedAt)}</p>
              {review.moderationNote && <p className="text-secondbase-color italic">Note: {review.moderationNote}</p>}
            </div>
          </div>
        )}
      </div>
    </ReusableModal>
  );
}
