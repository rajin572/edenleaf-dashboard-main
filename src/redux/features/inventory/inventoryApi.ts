import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IMeta, IProductVariant } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export interface IStockLevelRow extends IProductVariant {
  product?: { _id: string; name: string; slug: string; status: string };
}

export interface IStockMovement {
  _id: string;
  product: { _id: string; name: string; slug: string };
  variant: { _id: string; name: string; sku: string };
  type: "ManualAdjustment" | "InitialStock" | "OrderPlaced" | "OrderCancelled";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
}

type GetStockArgs = { page?: number; limit?: number; searchTerm?: string; productId?: string; status?: "active" | "inactive" | "archived"; sort?: string };
type GetMovementsArgs = { page?: number; limit?: number; productId?: string; variantId?: string; type?: IStockMovement["type"] };

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStockLevels: build.query<IApiResponse<{ data: IStockLevelRow[]; meta: IMeta }>, GetStockArgs>({
      query: (arg) => ({ url: "/inventory/stock", method: "GET", params: arg }),
      providesTags: [tagTypes.product],
    }),

    getStockMovements: build.query<IApiResponse<{ data: IStockMovement[]; meta: IMeta }>, GetMovementsArgs>({
      query: (arg) => ({ url: "/inventory/movements", method: "GET", params: arg }),
      providesTags: [tagTypes.product],
    }),

    adjustStock: build.mutation<IApiResponse<IStockMovement>, MutationArg<{ variantId: string; quantityChange: number; reason: string }>>({
      query: ({ body }) => ({ url: "/inventory/adjustments", method: "POST", body }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const { useGetStockLevelsQuery, useGetStockMovementsQuery, useAdjustStockMutation } = inventoryApi;
