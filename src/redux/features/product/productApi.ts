import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IGetProductListResponse, IProduct } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetProductsArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "draft" | "published" | "archived";
  categoryId?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  sort?: string;
};

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<IGetProductListResponse, GetProductsArgs>({
      query: (arg) => ({ url: "/products", method: "GET", params: arg }),
      providesTags: [tagTypes.product],
    }),

    getProductById: build.query<IApiResponse<IProduct>, string>({
      query: (id) => ({ url: `/products/${id}`, method: "GET" }),
      providesTags: [tagTypes.product],
    }),

    createProduct: build.mutation<IApiResponse<IProduct>, MutationArg<FormData>>({
      query: ({ body }) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [tagTypes.product],
    }),

    updateProduct: build.mutation<IApiResponse<IProduct>, MutationArg<FormData>>({
      query: ({ body, params }) => ({ url: `/products/${params?.id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.product],
    }),

    deleteProduct: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({ url: `/products/${params?.id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.product],
    }),

    setFeaturedPlacement: build.mutation<IApiResponse<IProduct>, MutationArg<{ enabled: boolean; order?: number }>>({
      query: ({ params, body }) => ({ url: `/products/${params?.id}/featured`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.product],
    }),

    setNewArrivalPlacement: build.mutation<IApiResponse<IProduct>, MutationArg<{ enabled: boolean; order?: number }>>({
      query: ({ params, body }) => ({ url: `/products/${params?.id}/new-arrival`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSetFeaturedPlacementMutation,
  useSetNewArrivalPlacementMutation,
} = productApi;
