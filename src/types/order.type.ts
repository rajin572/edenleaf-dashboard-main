import type { IApiResponse, IMeta } from "./common.type";

export type TOrderStatus =
  | "PENDING" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY"
  | "DELIVERED" | "DELIVERY_FAILED" | "RETURNED_TO_ORIGIN" | "CANCELLED"
  | "RETURN_REQUESTED" | "RETURNED" | "REFUND_PENDING" | "REFUNDED";

export type TPaymentStatus =
  | "PENDING" | "PENDING_VERIFICATION" | "VERIFIED" | "COLLECTED" | "REMITTED"
  | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export type TPaymentMethod = "COD" | "BKASH_MANUAL" | "NAGAD_MANUAL";
export type TOrderSource = "WEBSITE" | "FACEBOOK" | "WHATSAPP" | "PHONE" | "OFFLINE" | "MANUAL" | "OTHER";

export interface ICustomerSnapshot { name: string; phone: string; email?: string }
export interface IShippingAddressSnapshot {
  name: string; phone: string; district: string; thana: string;
  area?: string; street: string; postcode?: string;
}

/** Cost fields never appear here — the backend strips unitCostInPoisha unconditionally. */
export interface IOrderItemSnapshot {
  product: string; variant: string;
  productName: string; variantName: string; sku: string; unit: string;
  quantity: number; unitPriceInPoisha: number; lineTotalInPoisha: number;
}

export interface IOrderStatusHistoryEntry {
  _id: string; order: string; status: TOrderStatus; note: string;
  changedBy?: string; createdAt: string; updatedAt: string;
}

/** Base shape returned on every list row AND every single-order response. */
export interface IOrder {
  _id: string;
  orderNumber: string;
  customer?: string;
  customerSnapshot: ICustomerSnapshot;
  shippingAddress: IShippingAddressSnapshot;
  items: IOrderItemSnapshot[];
  subtotalInPoisha: number;
  discountInPoisha: number;
  deliveryFeeInPoisha: number;
  grandTotalInPoisha: number;
  shippingZoneCode?: string;
  coupon?: string;
  couponCode?: string;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;
  codAmountInPoisha: number;
  manualPaymentClaimedAmountInPoisha: number;
  manualPaymentSenderNumber?: string;
  manualPaymentTrxId?: string;
  paymentFlags: { duplicateTrxId: boolean };
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  remittanceBatch?: string;
  status: TOrderStatus;
  source: TOrderSource;
  createdBy?: string;
  inventoryRestoredAt?: string;
  couponReversedAt?: string;
  /** Server-computed from ORDER_TRANSITIONS[status] — drive transition buttons off this, not a client-side copy of the map. */
  legalNextStatuses: TOrderStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface ILedgerEntry {
  _id: string; order: string; orderNumber: string;
  type: "SALE" | "COGS" | "PURCHASE" | "EXPENSE" | "REFUND" | "COD_FEE" | "DELIVERY_COST" | "RTO_COST" | "MARKETING_COST" | "ADJUSTMENT";
  direction: "DEBIT" | "CREDIT"; amountInPoisha: number; currency: "BDT";
  note: string; createdBy: string; createdAt: string;
}

/** GET /orders/:id, and the response of every mutating order endpoint. */
export interface IOrderDetail extends IOrder {
  statusHistory: IOrderStatusHistoryEntry[];
  ledgerEntries?: ILedgerEntry[];
}

export interface ICheckoutItemInput { variantId: string; quantity: number }

export interface IOrderCreatePayload {
  customer: ICustomerSnapshot;
  shippingAddress: IShippingAddressSnapshot;
  items: ICheckoutItemInput[];
  paymentMethod: TPaymentMethod;
  manualPaymentSenderNumber?: string;
  manualPaymentTrxId?: string;
  couponCode?: string;
}

export interface IManualOrderCreatePayload extends IOrderCreatePayload {
  customerId?: string;
  source?: Exclude<TOrderSource, "WEBSITE">;
}

export interface IPlaceOrderResponse extends IOrderDetail { idempotencyReplayed: boolean }

export interface IUpdateOrderStatusPayload {
  status: TOrderStatus; note?: string;
  deliveryCostInPoisha?: number; rtoCostInPoisha?: number;
}

export interface IVerifyPaymentPayload {
  status: "COLLECTED" | "VERIFIED" | "FAILED";
  amountInPoisha?: number; deliveryCostInPoisha?: number; codFeeInPoisha?: number;
  rtoCostInPoisha?: number; note?: string;
}

export type IGetOrderListResponse = IApiResponse<{ data: IOrder[]; meta: IMeta }>;
