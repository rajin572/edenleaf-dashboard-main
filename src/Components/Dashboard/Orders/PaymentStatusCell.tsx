import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { getRealPaymentStatusTheme } from "@/utils/orderStatus";
import type { IOrder } from "@/types";

/** Payment method + status, display-only — verifying a manual bKash/Nagad
 *  transfer needs an exact-amount payload (see OrderDetailSheet's payment
 *  verification block), so it no longer fits an inline table-cell action. */
export default function PaymentStatusCell({ order }: { order: IOrder }) {
  return (
    <div className="flex flex-col">
      <span>{order.paymentMethod}</span>
      <Tag theme={getRealPaymentStatusTheme(order.paymentStatus)} className="mt-0.5 w-fit">{order.paymentStatus}</Tag>
    </div>
  );
}
