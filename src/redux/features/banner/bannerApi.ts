import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IBannerPlacement, IGetBannerListResponse } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetBannersArgs = {
  page: number;
  limit: number;
  searchTerm?: string;
  placement?: IBannerPlacement;
};

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<IGetBannerListResponse, GetBannersArgs>({
      query: ({ page, limit, searchTerm, placement }) => ({
        url: "/admin/banners",
        method: "GET",
        params: { page, limit, searchTerm, placement },
      }),
      providesTags: [tagTypes.banner],
    }),

    createBanner: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body }) => ({
        url: "/admin/banners",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    updateBanner: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body, params }) => ({
        url: `/admin/banners/${params?.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    toggleBannerActive: builder.mutation<IApiResponse<null>, MutationArg<{ isActive: boolean }>>({
      query: ({ body, params }) => ({
        url: `/admin/banners/${params?.id}/toggle-active`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    reorderBanner: builder.mutation<IApiResponse<null>, MutationArg<{ direction: "up" | "down" }>>({
      query: ({ body, params }) => ({
        url: `/admin/banners/${params?.id}/reorder`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    deleteBanner: builder.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({
        url: `/admin/banners/${params?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.banner],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerActiveMutation,
  useReorderBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
