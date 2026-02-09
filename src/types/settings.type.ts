import type { IApiResponse } from "./common.type";

export interface IAdminProfile {
  fullName: string;
  email: string;
  profileImage: string | null;
}

export interface IGetProfileResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IAdminProfile;
}

export interface IShippingZone {
  code: string;
  name: string;
  districts: string[];
  feeInPoisha: number;
}

export interface IShippingSettings {
  zones: IShippingZone[];
  defaultFeeInPoisha: number;
  freeShippingThresholdInPoisha: number | null;
}

export interface ISettings {
  _id: string;
  key: string;
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: "BDT";
  timezone: "Asia/Dhaka";
  shipping: IShippingSettings;
  lowStockThreshold: number;
  codEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  bkashNumber: string;
  nagadNumber: string;
  seo: { metaTitle: string; metaDescription: string };
  createdAt: string;
  updatedAt: string;
}

export type IGetSettingsResponse = IApiResponse<ISettings>;

/** Deliberately has no `shipping` key — shipping changes go through
 *  `updateShippingSettings` only. The backend 403s a `shipping` key sent by
 *  anyone without `settings.shipping`, even on this general route. */
export interface IUpdateSettingsPayload {
  storeName?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  lowStockThreshold?: number;
  codEnabled?: boolean;
  bkashEnabled?: boolean;
  nagadEnabled?: boolean;
  bkashNumber?: string;
  nagadNumber?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}

export interface IUpdateShippingPayload {
  shipping: Partial<IShippingSettings>;
}
