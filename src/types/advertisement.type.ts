import { IMeta, TransportCategory } from "./common.type";

export type AdPlacement = "home_carousel" | "search_feed";
export type AdStatus = "active" | "paused" | "scheduled" | "ended";

export interface IAdvertisement {
  _id: string;
  adCode: string;
  name: string;
  placement: AdPlacement;
  startDate: string;
  endDate: string;
  impressions: number;
  status: AdStatus;
}

export interface IFeaturedListingToggle {
  _id: string;
  name: string;
  category: TransportCategory;
  featured: boolean;
}

export interface IGetAdvertisementsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IAdvertisement[];
    meta: IMeta;
  };
}

export interface IGetAdDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IAdvertisement;
}
