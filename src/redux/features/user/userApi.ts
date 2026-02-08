import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IUser } from "@/types";

/** tryCatchWrapper calls the trigger with `{ body, params }` (CODING_RULES §3.2). */
type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyProfile: build.query<IApiResponse<IUser>, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: [tagTypes.user],
    }),

    updateMe: build.mutation<IApiResponse<IUser>, MutationArg>({
      query: ({ body }) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      // /auth/me carries the same profile fields the sidebar renders.
      invalidatesTags: [tagTypes.user, tagTypes.auth],
    }),
  }),
});

export const { useGetMyProfileQuery, useUpdateMeMutation } = userApi;
