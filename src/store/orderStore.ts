import { useSyncExternalStore } from "react";
import { DUMMY_ORDERS } from "@/data/dummyStore";

// The fictional pre-Part-08 order shape, kept alive here (file-local, not in
// types/order.type.ts — that file now carries the REAL 14-status backend
// shape) purely so CustomerProfileSheet.tsx (Part 10, not yet migrated) and
// dummyStore.ts keep compiling unchanged. Do not add new consumers of this —
// every page that talks to the real /orders API uses @/types' IOrder instead.
export type LegacyOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type LegacyOrderSource = "Website" | "Facebook" | "WhatsApp" | "Phone" | "Offline";
export type LegacyOrderPaymentMethod = "COD" | "bKash" | "Nagad";
export type LegacyOrderPaymentStatus = "Pending" | "Pending Verification" | "Verified" | "Failed";
export type LegacyOrderRefundStatus = "pending" | "refunded";

export interface LegacyOrderItem {
  productId: string;
  name: string;
  image?: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface LegacyOrderStatusEvent {
  status: LegacyOrderStatus;
  note?: string;
  at: string;
}

export interface LegacyOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  source: LegacyOrderSource;
  items: LegacyOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: LegacyOrderPaymentMethod;
  paymentStatus: LegacyOrderPaymentStatus;
  transactionId?: string;
  status: LegacyOrderStatus;
  courierName?: string;
  courierTrackingId?: string;
  /** Only set once an order reaches "Returned". */
  refundStatus?: LegacyOrderRefundStatus;
  statusHistory: LegacyOrderStatusEvent[];
  placedAt: string;
}

// A tiny external store (same useSyncExternalStore pattern as useUserData.ts)
// so the still-unmigrated Customer profile drawer (Part 10) keeps reading a
// consistent in-memory order list. Every page talking to the real backend
// (Orders, Pending/Running/Returns) uses RTK Query's orderApi.ts instead.
let orders: LegacyOrder[] = DUMMY_ORDERS.map((o) => ({
  ...o,
  items: [...o.items],
  statusHistory: [...o.statusHistory],
}));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => orders;

export const useOrders = (): LegacyOrder[] => useSyncExternalStore(subscribe, getSnapshot);

const setStatus = (orderId: string, status: LegacyOrderStatus, note?: string) => {
  orders = orders.map((o) =>
    o._id === orderId
      ? { ...o, status, statusHistory: [...o.statusHistory, { status, note, at: new Date().toISOString() }] }
      : o
  );
  emit();
};

export const acceptOrder = (orderId: string) => setStatus(orderId, "Confirmed", "Accepted by admin");

export const rejectOrder = (orderId: string, reason?: string) =>
  setStatus(orderId, "Cancelled", reason ? `Rejected — ${reason}` : "Rejected by admin");

export const cancelOrder = (orderId: string, reason?: string) =>
  setStatus(orderId, "Cancelled", reason ? `Cancelled — ${reason}` : "Cancelled by admin");

export const advanceOrder = (orderId: string, nextStatus: LegacyOrderStatus, note?: string) => {
  // Cash on Delivery is collected at the door, so reaching Delivered is the
  // moment a COD payment is actually confirmed — no separate manual step.
  if (nextStatus === "Delivered") {
    orders = orders.map((o) =>
      o._id === orderId && o.paymentMethod === "COD" && o.paymentStatus === "Pending"
        ? { ...o, paymentStatus: "Verified" }
        : o
    );
  }
  setStatus(orderId, nextStatus, note ?? (nextStatus === "Delivered" ? "COD collected on delivery" : undefined));
};

export const shipOrder = (orderId: string, courierName: string, courierTrackingId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, courierName, courierTrackingId } : o));
  setStatus(orderId, "Shipped", `Handed to ${courierName} — ${courierTrackingId}`);
};

export const NEXT_STATUS: Partial<Record<LegacyOrderStatus, LegacyOrderStatus>> = {
  Confirmed: "Processing",
  Processing: "Packed",
  Packed: "Shipped",
  Shipped: "Delivered",
};

/** Verify or fail a manual bKash/Nagad transfer against the wallet statement. */
export const verifyPayment = (orderId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, paymentStatus: "Verified" } : o));
  emit();
};

export const failPayment = (orderId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, paymentStatus: "Failed" } : o));
  emit();
};

/** Only reachable from Delivered — the customer sent the product back after receiving it. */
export const returnOrder = (orderId: string, reason: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, refundStatus: "pending" as const } : o));
  setStatus(orderId, "Returned", reason);
};

export const markRefunded = (orderId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, refundStatus: "refunded" } : o));
  emit();
};
