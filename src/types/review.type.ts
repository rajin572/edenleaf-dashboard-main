import type { IApiResponse, IMeta } from "./common.type";

export type TReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface IReview {
  _id: string;
  productId: string;
  variantId: string;
  orderId: string;
  reviewerId?: string;
  reviewer: { name: string };
  rating: number;
  text: string;
  verifiedPurchase: boolean;
  status: TReviewStatus;
  moderationNote?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type IGetReviewListResponse = IApiResponse<{ data: IReview[]; meta: IMeta }>;
