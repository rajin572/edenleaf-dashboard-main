import { TOrderStatus, TPaymentStatus } from "@/types";

type TagTheme = "error" | "warning" | "success" | "blue" | "purple" | "orange";

/** Real 14-value backend order status — used by every page wired to the real /orders API. */
const REAL_ORDER_STATUS_THEME: Record<TOrderStatus, TagTheme> = {
  PENDING: "blue",
  CONFIRMED: "purple",
  PROCESSING: "warning",
  PACKED: "blue",
  SHIPPED: "purple",
  OUT_FOR_DELIVERY: "purple",
  DELIVERED: "success",
  DELIVERY_FAILED: "error",
  RETURNED_TO_ORIGIN: "orange",
  CANCELLED: "error",
  // Dead statuses — no backend code path ever produces these, but the union
  // still has to be exhaustive for the Record type.
  RETURN_REQUESTED: "orange",
  RETURNED: "orange",
  REFUND_PENDING: "orange",
  REFUNDED: "orange",
};

export const getRealOrderStatusTheme = (status: TOrderStatus): TagTheme => REAL_ORDER_STATUS_THEME[status];

const REAL_PAYMENT_STATUS_THEME: Record<TPaymentStatus, TagTheme> = {
  PENDING: "blue",
  PENDING_VERIFICATION: "orange",
  VERIFIED: "success",
  COLLECTED: "success",
  REMITTED: "success",
  FAILED: "error",
  REFUNDED: "orange",
  PARTIALLY_REFUNDED: "orange",
};

export const getRealPaymentStatusTheme = (status: TPaymentStatus): TagTheme => REAL_PAYMENT_STATUS_THEME[status];
