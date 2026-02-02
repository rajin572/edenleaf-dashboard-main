import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IGuestOrderAccessRecord, IMeta, IOrderTrackingSummary } from "@/types";

type MutationArg<B = Record<string, unknown>> = { body?: B; params?: Record<string, string> };

export const guestOrderAccessApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Reuses GET /orders's own searchTerm (orderNumber / customerSnapshot.name / .phone). */
    searchOrdersForTracking: build.query<IApiResponse<{ meta: IMeta; data: IOrderTrackingSummary[] }>, string>({
      query: (searchTerm) => ({ url: "/orders", method: "GET", params: { searchTerm, limit: 10 } }),
      providesTags: [tagTypes.orderAccess],
    }),

    getOrderAccessHistory: build.query<IApiResponse<IGuestOrderAccessRecord[]>, string>({
      query: (orderId) => ({ url: `/orders/${orderId}/access-tokens`, method: "GET" }),
      providesTags: [tagTypes.orderAccess],
    }),

    revokeOrderAccess: build.mutation<IApiResponse<IGuestOrderAccessRecord>, MutationArg>({
      query: ({ params }) => ({
        url: `/orders/${params?.id}/access-tokens/${params?.accessId}/revoke`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.orderAccess],
    }),
  }),
});

export const {
  useSearchOrdersForTrackingQuery,
  useGetOrderAccessHistoryQuery,
  useRevokeOrderAccessMutation,
} = guestOrderAccessApi;
