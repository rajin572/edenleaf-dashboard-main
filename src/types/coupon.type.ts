import type { IApiResponse } from "./common.type";

export type ICouponType = "percentage" | "fixed";
export type ICouponStatus = "active" | "inactive" | "archived";

export interface ICoupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  type: ICouponType;
  value: number;
  minOrderInPoisha: number;
  maxDiscountInPoisha: number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  remainingUses: number | null;
  perUserLimit: number | null;
  firstOrderOnly: boolean;
  isPublic: boolean;
  status: ICouponStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICouponRedemption {
  _id: string;
  coupon: string;
  user?: { _id: string; name: string; email: string };
  order?: Record<string, unknown>;
  redemptionKey: string;
  eligibleSubtotalInPoisha: number;
  discountInPoisha: number;
  status: "Applied" | "Reversed";
  appliedAt: string;
  reversedAt?: string;
}

/**
 * Verified against coupon.controller.ts — unlike Banner/Combo/Newsletter's
 * admin-list endpoints, Coupon's list endpoints put `meta` only at the
 * envelope's top level and `data` is the plain array (`data: result.data`,
 * not `data: result`). Do NOT copy the nested `{data,meta}` shape used
 * elsewhere in this codebase — it is genuinely different for this module.
 */
export type IGetCouponListResponse = IApiResponse<ICoupon[]>;
export type IGetCouponRedemptionsResponse = IApiResponse<ICouponRedemption[]>;

export interface ICouponFormValues {
  code: string;
  name: string;
  description?: string;
  type: ICouponType;
  value: number;
  minOrderInPoisha?: number;
  maxDiscountInPoisha?: number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  firstOrderOnly: boolean;
  isPublic: boolean;
  status: "active" | "inactive";
}
