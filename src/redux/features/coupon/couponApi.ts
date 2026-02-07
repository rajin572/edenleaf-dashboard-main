import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type {
  IApiResponse,
  ICouponFormValues,
  IGetCouponListResponse,
  IGetCouponRedemptionsResponse,
} from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetCouponsArgs = {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: string;
  type?: string;
  isPublic?: boolean;
};

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<IGetCouponListResponse, GetCouponsArgs>({
      query: (arg) => ({ url: "/admin/coupons", method: "GET", params: arg }),
      providesTags: [tagTypes.coupon],
    }),

    createCoupon: builder.mutation<IApiResponse<null>, MutationArg<ICouponFormValues>>({
      query: ({ body }) => ({ url: "/admin/coupons", method: "POST", body }),
      invalidatesTags: [tagTypes.coupon],
    }),

    updateCoupon: builder.mutation<IApiResponse<null>, MutationArg<ICouponFormValues>>({
      query: ({ body, params }) => ({
        url: `/admin/coupons/${params?.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.coupon],
    }),

    deleteCoupon: builder.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({ url: `/admin/coupons/${params?.id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.coupon],
    }),

    getCouponRedemptions: builder.query<
      IGetCouponRedemptionsResponse,
      { id: string; page: number; limit: number; status?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/coupons/${id}/redemptions`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.coupon],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponRedemptionsQuery,
} = couponApi;
