import { getBrandCookie } from "@/utils/brandCookies";
import { toast } from "sonner";
import { getBaseUrl } from "@/helpers/config/envConfig";

/** GET /orders/:id/invoice returns raw PDF bytes, not a JSON envelope, so this
 *  is a plain imperative fetch rather than an RTK Query endpoint. */
export const downloadInvoice = async (orderId: string, orderNumber: string) => {
  const token = getBrandCookie("accessToken");
  const res = await fetch(`${getBaseUrl()}/orders/${orderId}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    toast.error("Could not download invoice");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
