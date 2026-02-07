import type { IApiResponse, IMeta } from "./common.type";

export type IComboStatus = "active" | "inactive" | "archived";

export interface IComboComponentView {
  variantId: string;
  quantity: number;
  variant: {
    _id: string;
    name: string;
    sku: string;
    priceInPoisha: number;
    stock: number;
    unit: string;
    attributes: Record<string, string>;
    status: "active" | "inactive" | "archived";
  };
  product: { _id: string; name: string; slug: string; image: string; status: string };
}

export interface ICombo {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  components: IComboComponentView[];
  comboPriceInPoisha: number;
  regularPriceInPoisha: number;
  savingsInPoisha: number;
  order: number;
  available: boolean;
  status: IComboStatus;
  createdAt: string;
  updatedAt: string;
}

export type IGetComboListResponse = IApiResponse<{ data: ICombo[]; meta: IMeta }>;

export interface IComboFormValues {
  name: string;
  slug?: string;
  description?: string;
  components: Array<{ variantId: string; quantity: number }>;
  comboPriceInPoisha: number;
  order?: number;
  status: "active" | "inactive";
}
