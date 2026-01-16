import { toast } from "sonner";

interface TryCatchWrapperOptions<T = unknown> {
  body?: T;
  params?: Record<string, string>;
}

interface TryCatchConfig {
  showToast?: boolean;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
  toastLoadingMessage?: string;
  toastSuccessMessage?: string;
  toastErrorMessage?: string;
}

interface SuccessResponse<R> {
  success: true;
  message: string;
  data?: R;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: unknown;
}

type TryCatchResponse<R> = SuccessResponse<R> | ErrorResponse;

/**
 * What the server actually sends (§4 envelope). `success` is a plain boolean
 * here — narrowing to the discriminated union above happens at runtime, below.
 */
interface ApiEnvelope<R> {
  success: boolean;
  message?: string;
  data?: R;
}

const tryCatchWrapper = async <T, R>(
  asyncFunction: (req: { body?: T; params?: Record<string, string> }) => { unwrap: () => Promise<ApiEnvelope<R>> },
  reqData?: TryCatchWrapperOptions<T>,
  config: TryCatchConfig = {
    showToast: true,
  },
): Promise<TryCatchResponse<R>> => {
  const {
    showToast = true,
    setLoading,
    setError,
    toastLoadingMessage = "Processing...",
    toastSuccessMessage,
    toastErrorMessage = "Something went wrong! Please try again.",
  } = config;

  setLoading?.(true);

  const toastId = showToast
    ? toast.loading(toastLoadingMessage, { duration: 2000 })
    : undefined;

  try {
    let req: { body?: T; params?: Record<string, string> } = {};

    if (reqData?.body && reqData?.params) {
      req = { body: reqData.body, params: reqData.params };
    } else if (reqData?.body) {
      req = { body: reqData.body };
    } else if (reqData?.params) {
      req = { params: reqData.params };
    }

    const res = await asyncFunction(req).unwrap();

    if (!res.success) {
      throw new Error(res.message);
    }

    if (showToast) {
      toast.success(toastSuccessMessage ?? res.message ?? "Done", {
        id: toastId,
        duration: 2000,
      });
    }

    setLoading?.(false);
    setError?.(null);
    return { success: true, message: res.message ?? "", data: res.data };
  } catch (error: unknown) {
    console.log(error);

    const err = error as any;
    console.log(err?.data?.message)
    const errorMessage =
      (err?.data as Record<string, string>)?.message || err?.data?.errorMessages?.[0]?.message ||
      err?.message ||
      err?.error ||
      "";

    let displayError = toastErrorMessage;

    if (typeof errorMessage === "string") {
      if (
        errorMessage.toLowerCase().includes("body size") ||
        errorMessage.toLowerCase().includes("exceeded") ||
        errorMessage.toLowerCase().includes("10mb") ||
        errorMessage.toLowerCase().includes("body limit") ||
        errorMessage.toLowerCase().includes("unexpected end of form") ||
        errorMessage.toLowerCase().includes("too large")
      ) {
        displayError = "File size exceeded! Maximum upload size is 500MB. Please upload smaller files.";
      } else if (errorMessage) {
        displayError = errorMessage;
      }
    }

    setError?.(displayError);

    if (showToast) {
      toast.error(displayError, {
        id: toastId,
        duration: 3000,
      });
    }

    setLoading?.(false);
    return { success: false, message: displayError };
  }
};

export default tryCatchWrapper;
