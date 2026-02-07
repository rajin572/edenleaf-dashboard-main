import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IGetNewsletterSubscriberListResponse } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetSubscribersArgs = {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: string;
};

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNewsletterSubscribers: builder.query<IGetNewsletterSubscriberListResponse, GetSubscribersArgs>({
      query: ({ page, limit, searchTerm, status }) => ({
        url: "/admin/newsletter/subscribers",
        method: "GET",
        params: { page, limit, searchTerm, status },
      }),
      providesTags: [tagTypes.newsletter],
    }),

    // GET /admin/newsletter/export returns a raw text/csv body, not a JSON
    // envelope — responseHandler bypasses fetchBaseQuery's default .json().
    exportNewsletterSubscribers: builder.query<Blob, { status?: string }>({
      query: ({ status }) => ({
        url: "/admin/newsletter/export",
        method: "GET",
        params: { status },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    deleteNewsletterSubscriber: builder.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({
        url: `/admin/newsletter/subscribers/${params?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.newsletter],
    }),
  }),
});

export const {
  useGetNewsletterSubscribersQuery,
  useLazyExportNewsletterSubscribersQuery,
  useDeleteNewsletterSubscriberMutation,
} = newsletterApi;
