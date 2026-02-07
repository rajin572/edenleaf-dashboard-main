import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IGetComboListResponse } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetCombosArgs = {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: string;
};

export const comboApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCombos: builder.query<IGetComboListResponse, GetCombosArgs>({
      query: ({ page, limit, searchTerm, status }) => ({
        url: "/admin/combos",
        method: "GET",
        params: { page, limit, searchTerm, status },
      }),
      providesTags: [tagTypes.combo],
    }),

    createCombo: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body }) => ({ url: "/admin/combos", method: "POST", body }),
      invalidatesTags: [tagTypes.combo],
    }),

    updateCombo: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body, params }) => ({
        url: `/admin/combos/${params?.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.combo],
    }),

    deleteCombo: builder.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({ url: `/admin/combos/${params?.id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.combo],
    }),
  }),
});

export const {
  useGetCombosQuery,
  useCreateComboMutation,
  useUpdateComboMutation,
  useDeleteComboMutation,
} = comboApi;
