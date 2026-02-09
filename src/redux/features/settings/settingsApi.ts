import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IGetSettingsResponse, IUpdateSettingsPayload, IUpdateShippingPayload } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<IGetSettingsResponse, void>({
      query: () => ({ url: "/settings", method: "GET" }),
      providesTags: [tagTypes.settings],
    }),

    updateSettings: build.mutation<IGetSettingsResponse, MutationArg<IUpdateSettingsPayload>>({
      query: ({ body }) => ({ url: "/settings", method: "PATCH", body }),
      invalidatesTags: [tagTypes.settings],
    }),

    updateShippingSettings: build.mutation<IGetSettingsResponse, MutationArg<IUpdateShippingPayload>>({
      query: ({ body }) => ({ url: "/settings/shipping", method: "PATCH", body }),
      invalidatesTags: [tagTypes.settings],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateShippingSettingsMutation,
} = settingsApi;
