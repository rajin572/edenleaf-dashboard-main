import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IPermissionCatalog, IRole } from "@/types";

/** tryCatchWrapper calls the trigger with `{ body, params }` (CODING_RULES §3.2). */
type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const roleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<IApiResponse<IRole[]>, void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
      providesTags: [tagTypes.role],
    }),

    getRoleById: build.query<IApiResponse<IRole>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.role],
    }),

    createRole: build.mutation<IApiResponse<IRole>, MutationArg>({
      query: ({ body }) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.role],
    }),

    updateRole: build.mutation<IApiResponse<IRole>, MutationArg>({
      query: ({ params, body }) => ({
        url: `/roles/${params?.id}`,
        method: "PATCH",
        body,
      }),
      // A permission change alters the caller's own resolved set.
      invalidatesTags: [tagTypes.role, tagTypes.auth],
    }),

    deleteRole: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({
        url: `/roles/${params?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.role],
    }),

    /** Catalog grouped by resource, e.g. { product: [...], staff: [...] }. */
    getPermissions: build.query<IApiResponse<IPermissionCatalog>, void>({
      query: () => ({
        url: "/permissions",
        method: "GET",
      }),
      providesTags: [tagTypes.permission],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} = roleApi;
