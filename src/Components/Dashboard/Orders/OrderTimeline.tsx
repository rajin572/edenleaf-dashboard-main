import { Check, XCircle, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IOrderDetail, TOrderStatus } from "@/types";

const HAPPY_STEPS: TOrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED",
];

const humanize = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatAt = (iso: string) =>
  new Date(iso).toLocaleString("en-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export default function OrderTimeline({ order }: { order: IOrderDetail }) {
  if (order.status === "CANCELLED") {
    const cancelEvent = [...order.statusHistory].reverse().find((e) => e.status === "CANCELLED");
    return (
      <div className="rounded-lg border border-error/30 bg-red-50 p-4">
        <p className="font-semibold text-error flex items-center gap-2">
          <XCircle className="size-4" /> Order Cancelled
        </p>
        {cancelEvent?.note && <p className="text-sm text-secondbase-color mt-1">{cancelEvent.note}</p>}
        {cancelEvent && <p className="text-xs text-secondbase-color mt-1">{formatAt(cancelEvent.createdAt)}</p>}
      </div>
    );
  }

  if (order.status === "DELIVERY_FAILED" || order.status === "RETURNED_TO_ORIGIN") {
    const failEvent = [...order.statusHistory].reverse().find((e) => e.status === "DELIVERY_FAILED");
    const rtoEvent = [...order.statusHistory].reverse().find((e) => e.status === "RETURNED_TO_ORIGIN");
    const finalEvent = rtoEvent ?? failEvent;
    return (
      <div className="space-y-3">
        <OrderTimelineHappyPath order={order} upTo="OUT_FOR_DELIVERY" />
        <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
          <p className="font-semibold text-orange-700 flex items-center gap-2">
            <Undo2 className="size-4" /> {order.status === "RETURNED_TO_ORIGIN" ? "Returned to Origin" : "Delivery Failed"}
          </p>
          {finalEvent?.note && <p className="text-sm text-secondbase-color mt-1">{finalEvent.note}</p>}
          {finalEvent && <p className="text-xs text-secondbase-color mt-1">{formatAt(finalEvent.createdAt)}</p>}
        </div>
      </div>
    );
  }

  return <OrderTimelineHappyPath order={order} />;
}

/** Renders the linear happy-path steps. `upTo` caps how far the "done" state
 *  extends — used when a later divergence (failed delivery / RTO) needs its
 *  own banner appended after this instead of the normal Delivered endpoint. */
function OrderTimelineHappyPath({ order, upTo }: { order: IOrderDetail; upTo?: TOrderStatus }) {
  const currentIndex = upTo ? HAPPY_STEPS.indexOf(upTo) : HAPPY_STEPS.indexOf(order.status);

  return (
    <div>
      {HAPPY_STEPS.map((step, i) => {
        const event = order.statusHistory.find((e) => e.status === step);
        const done = i <= currentIndex;
        const isLast = i === HAPPY_STEPS.length - 1;
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "size-7 shrink-0 rounded-full flex items-center justify-center border-2",
                  done ? "bg-secondary-color border-secondary-color text-white" : "border-gray-300 text-gray-300"
                )}
              >
                <Check className="size-3.5" />
              </div>
              {!isLast && <div className={cn("w-0.5 flex-1 min-h-8", i < currentIndex ? "bg-secondary-color" : "bg-gray-200")} />}
            </div>
            <div className={cn("pb-7", isLast && "pb-0")}>
              <p className={cn("font-semibold text-sm", done ? "text-base-color" : "text-gray-400")}>{humanize(step)}</p>
              {event ? (
                <>
                  <p className="text-xs text-secondbase-color">{formatAt(event.createdAt)}</p>
                  {event.note && <p className="text-xs text-secondbase-color mt-0.5">{event.note}</p>}
                </>
              ) : (
                <p className="text-xs text-gray-400">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
