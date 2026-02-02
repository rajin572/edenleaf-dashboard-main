export type TGuestAccessState = "active" | "expired" | "revoked";

/** Mirrors GuestOrderAccessService.viewAccess()'s return shape field-for-field. */
export interface IGuestOrderAccessRecord {
  _id: string;
  order: string;
  contactType: "phone" | "email";
  state: TGuestAccessState;
  expiresAt: string;
  revokedAt?: string;
  lastUsedAt?: string;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Just enough of an order to identify it and show its access-token history —
 *  intentionally not the full `IOrder` type, to avoid two parts editing the
 *  same order.type.ts for no shared benefit. */
export interface IOrderTrackingSummary {
  _id: string;
  orderNumber: string;
  status: string;
  grandTotalInPoisha: number;
  createdAt: string;
  customerSnapshot: { name: string; phone: string; email?: string };
}
