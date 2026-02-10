import { IMeta, TransportCategory } from "./common.type";

export type ListingStatus = "active" | "flagged";

export interface IListing {
  _id: string;
  listingCode: string;
  title: string;
  category: TransportCategory;
  ownerName: string;
  location: string;
  priceLabel: string;
  bookingsCount: number;
  revenue: number;
  rating: number;
  reviewCount: number;
  qualityScore: number;
  qualityLabel: string;
  status: ListingStatus;
  featured: boolean;
}

export interface IGetListingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IListing[];
    meta: IMeta;
  };
}

export interface IGetListingDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IListing;
}
