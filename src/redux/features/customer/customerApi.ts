import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type {
  IApiResponse, ICustomer, ICustomerDetail, ICustomerOrderSummaryRow, IMeta, IQueryArgs,
} from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<IApiResponse<{ meta: IMeta; data: ICustomer[] }>, IQueryArgs>({
      query: (arg) => ({ url: "/customers", method: "GET", params: arg }),
      providesTags: [tagTypes.customer],
    }),

    getCustomerById: build.query<IApiResponse<ICustomerDetail>, string>({
      query: (id) => ({ url: `/customers/${id}`, method: "GET" }),
      providesTags: [tagTypes.customer],
    }),

    updateCustomer: build.mutation<IApiResponse<ICustomer>, MutationArg>({
      query: ({ params, body }) => ({ url: `/customers/${params?.id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.customer],
    }),

    /** Recent orders for the detail sheet only — the full order list/type is orderApi.ts's job. */
    getCustomerOrders: build.query<IApiResponse<{ meta: IMeta; data: ICustomerOrderSummaryRow[] }>, string>({
      query: (customerId) => ({
        url: "/orders",
        method: "GET",
        params: { customer: customerId, limit: 5, sort: "-createdAt" },
      }),
      providesTags: [tagTypes.customer],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useGetCustomerOrdersQuery,
} = customerApi;
