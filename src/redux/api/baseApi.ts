import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "../tagTypes";
import { getBrandCookie, removeBrandCookie, setAccessTokenCookie } from "@/utils/brandCookies";
import { toast } from "sonner";
import { getBaseUrl } from "../../helpers/config/envConfig";
import { TOKEN_UPDATED_EVENT } from "../../hooks/useUserData";

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers) => {
    // Contract: Authorization: Bearer <accessToken> — matches the backend auth middleware.
    const token = getBrandCookie("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Access tokens are short-lived (1h) while the session itself lasts 30 days, held by an
// httpOnly `refreshToken` cookie. When any request 401s we first try to trade that cookie
// for a fresh access token and replay the request; only if the refresh is itself rejected
// (revoked/expired session) do we clear the cookie and send the user to /sign-in.
const REFRESH_LOCK = "ednleaf_refresh_token_lock";

type RefreshOutcome = "refreshed" | "rejected" | "unavailable";

const requestNewAccessToken = async (staleToken: string | undefined): Promise<RefreshOutcome> => {
  // Another tab (or an earlier 401 in this one) may already have refreshed while we waited
  // for the lock. The refresh token rotates on every use, so a second call would fail.
  const current = getBrandCookie("accessToken");
  if (current && current !== staleToken) return "refreshed";

  try {
    const res = await fetch(`${getBaseUrl()}/auth/refresh-token`, { method: "POST", credentials: "include" });
    if (res.status === 401 || res.status === 403) return "rejected";
    if (!res.ok) return "unavailable";

    const json = await res.json();
    const accessToken = json?.data?.accessToken as string | undefined;
    if (!accessToken) return "rejected";

    setAccessTokenCookie(accessToken);
    window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
    return "refreshed";
  } catch {
    // Offline / server down — keep the session, the next request will try again.
    return "unavailable";
  }
};

let inFlightRefresh: Promise<RefreshOutcome> | null = null;

const refreshAccessToken = (staleToken: string | undefined) => {
  if (!inFlightRefresh) {
    // Web Locks serialises the refresh across tabs; fall back to per-tab de-duping.
    const run = () => requestNewAccessToken(staleToken);
    inFlightRefresh = (navigator.locks ? navigator.locks.request(REFRESH_LOCK, run) : run()).finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
};

const isAuthEndpoint = (args: string | FetchArgs) => {
  const url = typeof args === "string" ? args : args.url;
  return url.includes("/auth/login") || url.includes("/auth/refresh-token");
};

let sessionEndedHandledAt = 0;

// After the refresh endpoint fails (offline, 5xx, 429) don't hammer it again for every
// request that 401s — that burns the auth rate limit and keeps the failure going.
const REFRESH_COOLDOWN_MS = 30_000;
let refreshBlockedUntil = 0;

const endSession = () => {
  const now = Date.now();
  // Several queries can 401 in the same tick (e.g. on page load) — only react once.
  if (now - sessionEndedHandledAt <= 3000) return;
  sessionEndedHandledAt = now;
  removeBrandCookie("accessToken");
  window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
  toast.error("Your session has ended. Please sign in again.");
};

const baseQueryWithRefreshToken: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const tokenUsed = getBrandCookie("accessToken");
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || !tokenUsed || isAuthEndpoint(args)) return result;
  if (Date.now() < refreshBlockedUntil) return result;

  const outcome = await refreshAccessToken(tokenUsed);

  if (outcome === "unavailable") {
    refreshBlockedUntil = Date.now() + REFRESH_COOLDOWN_MS;
    return result;
  }

  if (outcome === "refreshed") {
    refreshBlockedUntil = 0;
    const retried = await baseQuery(args, api, extraOptions);
    if (retried.error?.status !== 401) return retried;
    // A token we were just handed was rejected too — the session itself is dead.
    endSession();
    return retried;
  }

  endSession();
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefreshToken,
  endpoints: () => ({}),
  tagTypes: tagTypesList,
});
