import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IMeta, IQueryArgs, IReview } from "@/types";

type MutationArg<B = Record<string, unknown>> = { body?: B; params?: Record<string, string> };

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<IApiResponse<{ meta: IMeta; data: IReview[] }>, IQueryArgs>({
      query: (arg) => ({ url: "/admin/reviews", method: "GET", params: arg }),
      providesTags: [tagTypes.review],
    }),

    moderateReview: build.mutation<IApiResponse<IReview>, MutationArg<{ status: "APPROVED" | "REJECTED" | "HIDDEN"; note?: string }>>({
      query: ({ params, body }) => ({ url: `/admin/reviews/${params?.id}/moderate`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.review],
    }),

    deleteReview: build.mutation<IApiResponse<IReview>, MutationArg>({
      query: ({ params }) => ({ url: `/admin/reviews/${params?.id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.review],
    }),
  }),
});

export const { useGetReviewsQuery, useModerateReviewMutation, useDeleteReviewMutation } = reviewApi;
