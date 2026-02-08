import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IMeta, IQueryArgs, IStaffListItem } from "@/types";

/** tryCatchWrapper calls the trigger with `{ body, params }` (CODING_RULES §3.2). */
type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffs: build.query<IApiResponse<{ meta: IMeta; data: IStaffListItem[] }>, IQueryArgs>({
      query: (arg) => ({
        url: "/staff",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.staff],
    }),

    getStaffById: build.query<IApiResponse<IStaffListItem>, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.staff],
    }),

    createStaff: build.mutation<IApiResponse<IStaffListItem>, MutationArg>({
      query: ({ body }) => ({
        url: "/staff",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.staff],
    }),

    updateStaff: build.mutation<IApiResponse<IStaffListItem>, MutationArg>({
      query: ({ params, body }) => ({
        url: `/staff/${params?.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.staff],
    }),

    updateStaffStatus: build.mutation<IApiResponse<IStaffListItem>, MutationArg>({
      query: ({ params, body }) => ({
        url: `/staff/${params?.id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.staff],
    }),

    updateStaffRole: build.mutation<IApiResponse<IStaffListItem>, MutationArg>({
      query: ({ params, body }) => ({
        url: `/staff/${params?.id}/role`,
        method: "PATCH",
        body,
      }),
      // Changing someone's role changes their resolved permissions.
      invalidatesTags: [tagTypes.staff, tagTypes.auth],
    }),

    forceLogoutStaff: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({
        url: `/staff/${params?.id}/force-logout`,
        method: "POST",
      }),
      invalidatesTags: [tagTypes.staff],
    }),
  }),
});

export const {
  useGetStaffsQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffRoleMutation,
  useForceLogoutStaffMutation,
} = staffApi;
