import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type {
  IApiResponse,
  IMeta,
  IFinanceLedgerEntry,
  ILedgerSummary,
  IRemittanceBatch,
  IRemittanceEligibleOrder,
  TLedgerDirection,
  TLedgerEntryType,
  TLedgerSource,
  TRemittanceStatus,
} from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

export interface IGetLedgerArgs {
  page?: number;
  limit?: number;
  searchTerm?: string;
  order?: string;
  type?: TLedgerEntryType;
  direction?: TLedgerDirection;
  source?: TLedgerSource;
  from?: string;
  to?: string;
  sort?: "createdAt" | "-createdAt" | "amountInPoisha" | "-amountInPoisha";
}

export interface IGetRemittancesArgs {
  page?: number;
  limit?: number;
  status?: TRemittanceStatus;
  sort?: "createdAt" | "-createdAt" | "totalAmountInPoisha" | "-totalAmountInPoisha";
}

export const financeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLedger: build.query<IApiResponse<{ meta: IMeta; data: IFinanceLedgerEntry[] }>, IGetLedgerArgs>({
      query: (arg) => ({ url: "/finances/ledger", method: "GET", params: arg }),
      providesTags: [tagTypes.finance],
    }),

    getLedgerSummary: build.query<IApiResponse<ILedgerSummary>, { from?: string; to?: string }>({
      query: (arg) => ({ url: "/finances/summary", method: "GET", params: arg }),
      providesTags: [tagTypes.finance],
    }),

    getRemittances: build.query<IApiResponse<{ meta: IMeta; data: IRemittanceBatch[] }>, IGetRemittancesArgs>({
      query: (arg) => ({ url: "/finances/remittances", method: "GET", params: arg }),
      providesTags: [tagTypes.remittance],
    }),

    getRemittanceById: build.query<IApiResponse<IRemittanceBatch>, string>({
      query: (id) => ({ url: `/finances/remittances/${id}`, method: "GET" }),
      providesTags: [tagTypes.remittance],
    }),

    /**
     * Self-contained eligible-orders read for the Create Batch picker.
     * Deliberately doesn't depend on orderApi.ts/order.type.ts — reuses the
     * real GET /orders list endpoint (gated order.view) with a fixed
     * COD+COLLECTED filter; the backend's own atomic check in
     * createRemittance is the real source of truth, this only feeds the
     * checkbox list.
     */
    getEligibleCodOrders: build.query<
      IApiResponse<{ meta: IMeta; data: IRemittanceEligibleOrder[] }>,
      { page?: number; limit?: number; searchTerm?: string }
    >({
      query: (arg) => ({
        url: "/orders",
        method: "GET",
        params: { ...arg, paymentMethod: "COD", paymentStatus: "COLLECTED" },
      }),
      providesTags: [tagTypes.order],
    }),

    createRemittance: build.mutation<IApiResponse<IRemittanceBatch>, MutationArg<{ orderIds: string[]; note?: string }>>({
      query: ({ body }) => ({ url: "/finances/remittances", method: "POST", body }),
      invalidatesTags: [tagTypes.remittance, tagTypes.order],
    }),

    reconcileRemittance: build.mutation<IApiResponse<IRemittanceBatch>, MutationArg<{ note?: string }>>({
      query: ({ params, body }) => ({ url: `/finances/remittances/${params?.id}/reconcile`, method: "PATCH", body }),
      // Reconciling flips every batched order's paymentStatus to REMITTED —
      // invalidate order caches too, not just the remittance/finance ones.
      invalidatesTags: [tagTypes.remittance, tagTypes.order, tagTypes.finance],
    }),
  }),
});

export const {
  useGetLedgerQuery,
  useGetLedgerSummaryQuery,
  useGetRemittancesQuery,
  useGetRemittanceByIdQuery,
  useGetEligibleCodOrdersQuery,
  useCreateRemittanceMutation,
  useReconcileRemittanceMutation,
} = financeApi;
