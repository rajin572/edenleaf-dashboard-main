import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IGetCategoryListResponse } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetCategoriesArgs = {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: "Active" | "Inactive" | "Archived";
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<IGetCategoryListResponse, GetCategoriesArgs>({
      query: ({ page, limit, searchTerm, status }) => ({
        url: "/categories",
        method: "GET",
        params: { page, limit, searchTerm, status },
      }),
      providesTags: [tagTypes.category],
    }),

    createCategory: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body }) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    updateCategory: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body, params }) => ({
        url: `/categories/${params?.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    deleteCategory: builder.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({
        url: `/categories/${params?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
