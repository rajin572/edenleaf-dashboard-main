import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IBlockedContact, IBlockedContactFormValues, IMeta, IQueryArgs } from "@/types";

type MutationArg<B = Record<string, unknown>> = { body?: B; params?: Record<string, string> };

export const blockedContactApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBlockedContacts: build.query<IApiResponse<{ meta: IMeta; data: IBlockedContact[] }>, IQueryArgs>({
      query: (arg) => ({ url: "/blocked-contacts", method: "GET", params: arg }),
      providesTags: [tagTypes.blockedContact],
    }),
    createBlockedContact: build.mutation<IApiResponse<IBlockedContact>, MutationArg<IBlockedContactFormValues>>({
      query: ({ body }) => ({ url: "/blocked-contacts", method: "POST", body }),
      invalidatesTags: [tagTypes.blockedContact],
    }),
    updateBlockedContact: build.mutation<IApiResponse<IBlockedContact>, MutationArg<Partial<IBlockedContactFormValues> & { active?: boolean }>>({
      query: ({ params, body }) => ({ url: `/blocked-contacts/${params?.id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.blockedContact],
    }),
    // DELETE here is a soft-deactivate server-side (active:false), never a
    // real delete — named to match, so the code doesn't imply otherwise.
    deactivateBlockedContact: build.mutation<IApiResponse<IBlockedContact>, MutationArg>({
      query: ({ params }) => ({ url: `/blocked-contacts/${params?.id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.blockedContact],
    }),
  }),
});

export const {
  useGetBlockedContactsQuery,
  useCreateBlockedContactMutation,
  useUpdateBlockedContactMutation,
  useDeactivateBlockedContactMutation,
} = blockedContactApi;
