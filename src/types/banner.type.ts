import type { IApiResponse, IMeta } from "./common.type";

export type IBannerPlacement = "hero" | "hero_side" | "marketing_left" | "marketing_right";

export interface IBanner {
  _id: string;
  placement: IBannerPlacement;
  image: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  destinationUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export type IGetBannerListResponse = IApiResponse<{ data: IBanner[]; meta: IMeta }>;

export interface IBannerFormValues {
  placement: IBannerPlacement;
  destinationUrl: string;
  isActive: boolean;
}
