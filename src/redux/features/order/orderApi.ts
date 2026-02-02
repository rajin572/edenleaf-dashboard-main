import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type {
  IApiResponse, IMeta, IQueryArgs, IOrder, IOrderDetail, IPlaceOrderResponse,
  IManualOrderCreatePayload, IUpdateOrderStatusPayload, IVerifyPaymentPayload,
} from "@/types";

/** Matches tryCatchWrapper's fixed {body, params} call shape exactly — no
 *  bespoke extra fields, so createManualOrder folds its idempotency key into
 *  `body` instead (see ManualOrdersPage.tsx) and strips it back out here. */
type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<IApiResponse<{ meta: IMeta; data: IOrder[] }>, IQueryArgs>({
      query: (arg) => ({ url: "/orders", method: "GET", params: arg }),
      providesTags: [tagTypes.order],
    }),

    getOrderById: build.query<IApiResponse<IOrderDetail>, string>({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      providesTags: [tagTypes.order],
    }),

    createManualOrder: build.mutation<IApiResponse<IPlaceOrderResponse>, MutationArg<IManualOrderCreatePayload & { idempotencyKey: string }>>({
      query: ({ body }) => {
        const { idempotencyKey, ...rest } = body ?? ({} as IManualOrderCreatePayload & { idempotencyKey: string });
        return {
          url: "/orders/manual",
          method: "POST",
          body: rest,
          headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        };
      },
      invalidatesTags: [tagTypes.order],
    }),

    changeOrderStatus: build.mutation<IApiResponse<IOrderDetail>, MutationArg<IUpdateOrderStatusPayload>>({
      query: ({ params, body }) => ({ url: `/orders/${params?.id}/status`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.order],
    }),

    verifyOrderPayment: build.mutation<IApiResponse<IOrderDetail>, MutationArg<IVerifyPaymentPayload>>({
      query: ({ params, body }) => ({ url: `/orders/${params?.id}/verify-payment`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateManualOrderMutation,
  useChangeOrderStatusMutation,
  useVerifyOrderPaymentMutation,
} = orderApi;
