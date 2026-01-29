import type { IApiResponse, IMeta } from "./common.type";

export type TProductStatus = "draft" | "published" | "archived";
export type TVariantStatus = "active" | "inactive" | "archived";

export interface IProductVariant {
  _id: string;
  productId: string;
  name: string;
  sku: string;
  priceInPoisha: number;
  comparePriceInPoisha?: number;
  /** Present only when the caller holds `product.view_cost` (super_admin always does). */
  costPriceInPoisha?: number;
  stock: number;
  unit: string;
  attributes: Record<string, string>;
  isDefault: boolean;
  status: TVariantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IProductImageAsset {
  url: string;
  publicId: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category: { _id: string; name: string; slug: string };
  categorySlug: string;
  subCategorySlug?: string;
  images: string[];
  image: string;
  secondaryImage?: string;
  /** Admin-only field — present because every dashboard request carries a Bearer token. */
  imageAssets?: IProductImageAsset[];
  status: TProductStatus;
  minPriceInPoisha: number;
  maxPriceInPoisha: number;
  totalStock: number;
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  featuredOrder: number;
  isNewArrival: boolean;
  newArrivalOrder: number;
  /** Denormalized from the default variant, for list-row rendering without a second call. */
  priceInPoisha: number;
  comparePriceInPoisha?: number;
  costPriceInPoisha?: number;
  stock: number;
  sku: string;
  unit: string;
  variants: IProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export type IGetProductListResponse = IApiResponse<{ data: IProduct[]; meta: IMeta }>;

export interface IVariantPayload {
  name?: string;
  sku: string;
  priceInPoisha: number;
  comparePriceInPoisha?: number;
  costPriceInPoisha?: number;
  stock?: number;
  unit?: string;
  attributes?: Record<string, string>;
  isDefault?: boolean;
}

/**
 * Matches `ProductValidation.create`'s `createFields` — status is writable
 * as Draft/Published only; Archived only happens via DELETE.
 *
 * `variants` must be omitted entirely (not sent as `[]`) when this is used
 * for `PATCH /products/:id` — `updateFields` is `.strict()` with no
 * `variants` key at all; variant edits go through the `/variants`
 * sub-resource instead. Sending it as `[]` 400s with "Unrecognized key".
 */
export interface IProductFormValues {
  name: string;
  categoryId: string;
  description?: string;
  status: "draft" | "published";
  variants?: IVariantPayload[];
}
