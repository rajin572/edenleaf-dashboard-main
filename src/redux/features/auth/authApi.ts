import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, ILoginResponse, IMeResponse } from "@/types";

/** Mutations are invoked through tryCatchWrapper, which calls the trigger with
 *  `{ body, params }` (CODING_RULES §3.2) — so every mutation destructures it. */
type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<IApiResponse<ILoginResponse>, MutationArg>({
      query: ({ body }) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    logout: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ body }) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    /** Step 1 of the reset chain — sends the OTP. */
    forgetPassword: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ body }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    /** Step 2 — exchanges the OTP for a reset token. */
    verifyForgotOtp: build.mutation<IApiResponse<{ resetToken: string }>, MutationArg>({
      query: ({ body }) => ({
        url: "/auth/verify-forgot-otp",
        method: "POST",
        body,
      }),
    }),

    /** Step 3 — consumes the reset token. The backend reads it from the
     *  Authorization header, never the body, so it's pulled out here. */
    resetPassword: build.mutation<
      IApiResponse<null>,
      MutationArg<{ resetToken: string; newPassword: string }>
    >({
      query: ({ body }) => ({
        url: "/auth/reset-password",
        method: "POST",
        headers: body?.resetToken ? { Authorization: `Bearer ${body.resetToken}` } : undefined,
        body: { newPassword: body?.newPassword },
      }),
    }),

    resendOtp: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ body }) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body,
      }),
    }),

    changePassword: build.mutation<IApiResponse<null>, MutationArg>({
      query: ({ body }) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body,
      }),
    }),

    /** The only source of the resolved permission set — the JWT does not carry it. */
    getMe: build.query<IApiResponse<IMeResponse>, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: [tagTypes.auth],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgetPasswordMutation,
  useVerifyForgotOtpMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} = authApi;
