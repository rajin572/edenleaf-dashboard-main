// Reuses the storefront's badge/status hexes (ecommerce-website globals.css)
// so a chart color means the same thing on both the admin and customer sides.
export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "#64748B",
  Confirmed: "#3b82f6",
  Processing: "#d97706",
  Packed: "#8b5cf6",
  Shipped: "#ff5014",
  Delivered: "#16a34a",
  Cancelled: "#dc2626",
  Returned: "#a855f7",
};

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  COD: "#1f2937",
  bKash: "#E11471",
  Nagad: "#F37021",
};

// Real 14-value backend order status / 3-value payment method — used by
// pages wired to the real /orders API (Part 08/09). Kept separate from the
// maps above, which still serve Overview.tsx and any not-yet-migrated page.
export const REAL_ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "#64748B",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#d97706",
  PACKED: "#8b5cf6",
  SHIPPED: "#ff5014",
  OUT_FOR_DELIVERY: "#c026d3",
  DELIVERED: "#16a34a",
  DELIVERY_FAILED: "#dc2626",
  RETURNED_TO_ORIGIN: "#a855f7",
  CANCELLED: "#991b1b",
};

export const REAL_PAYMENT_METHOD_COLORS: Record<string, string> = {
  COD: "#1f2937",
  BKASH_MANUAL: "#E11471",
  NAGAD_MANUAL: "#F37021",
};
