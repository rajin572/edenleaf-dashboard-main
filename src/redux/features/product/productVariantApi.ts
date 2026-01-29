import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IProductVariant, IVariantPayload } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const productVariantApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVariants: build.query<IApiResponse<IProductVariant[]>, string>({
      query: (productId) => ({ url: `/products/${productId}/variants`, method: "GET" }),
      providesTags: [tagTypes.product],
    }),

    createVariant: build.mutation<IApiResponse<IProductVariant>, MutationArg<IVariantPayload>>({
      query: ({ params, body }) => ({ url: `/products/${params?.productId}/variants`, method: "POST", body }),
      invalidatesTags: [tagTypes.product],
    }),

    updateVariant: build.mutation<
      IApiResponse<IProductVariant>,
      MutationArg<Partial<IVariantPayload> & { status?: "active" | "inactive" }>
    >({
      query: ({ params, body }) => ({
        url: `/products/${params?.productId}/variants/${params?.variantId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    archiveVariant: build.mutation<IApiResponse<IProductVariant>, MutationArg>({
      query: ({ params }) => ({
        url: `/products/${params?.productId}/variants/${params?.variantId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useArchiveVariantMutation,
} = productVariantApi;
