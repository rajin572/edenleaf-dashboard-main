import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IInventoryReport, IOrderCountReport, IProductSalesReport, ISalesReport } from "@/types";

// All four M11 endpoints are read-only reports — no MutationArg/mutations here.

export const reportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSalesReport: build.query<IApiResponse<ISalesReport>, { from?: string; to?: string } | void>({
      query: (arg) => ({ url: "/reports/sales", method: "GET", params: arg ?? undefined }),
      providesTags: [tagTypes.report],
    }),

    getOrderCountReport: build.query<IApiResponse<IOrderCountReport>, void>({
      query: () => ({ url: "/reports/orders", method: "GET" }),
      providesTags: [tagTypes.report],
    }),

    getProductSalesReport: build.query<IApiResponse<IProductSalesReport[]>, { limit?: number } | void>({
      query: (arg) => ({ url: "/reports/product-sales", method: "GET", params: arg ?? undefined }),
      providesTags: [tagTypes.report],
    }),

    getInventoryReport: build.query<IApiResponse<IInventoryReport>, void>({
      query: () => ({ url: "/reports/inventory", method: "GET" }),
      providesTags: [tagTypes.report],
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetOrderCountReportQuery,
  useGetProductSalesReportQuery,
  useGetInventoryReportQuery,
} = reportApi;
