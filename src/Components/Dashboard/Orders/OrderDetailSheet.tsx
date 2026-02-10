import { useState } from "react";
import ReusableSheet from "@/Components/ui/CustomUi/ReuseableSheet";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import RtoCostModal from "./RtoCostModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Download, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import OrderTimeline from "./OrderTimeline";
import { getRealOrderStatusTheme, getRealPaymentStatusTheme } from "@/utils/orderStatus";
import { useChangeOrderStatusMutation, useVerifyOrderPaymentMutation } from "@/redux/features/order/orderApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import usePermission from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import { downloadInvoice } from "@/utils/downloadInvoice";
import type { IOrderDetail, IShippingAddressSnapshot, TOrderStatus } from "@/types";

interface OrderDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrderDetail | null;
  isLoading?: boolean;
}

const STATUS_LABEL: Partial<Record<TOrderStatus, string>> = {
  CONFIRMED: "Confirm Order",
  PROCESSING: "Mark Processing",
  PACKED: "Mark Packed",
  SHIPPED: "Mark Shipped",
  OUT_FOR_DELIVERY: "Mark Out for Delivery",
  DELIVERED: "Mark Delivered",
  DELIVERY_FAILED: "Mark Delivery Failed",
  RETURNED_TO_ORIGIN: "Mark Returned to Origin",
  CANCELLED: "Cancel Order",
};

const PAID_STATUSES = ["VERIFIED", "COLLECTED", "REMITTED"];

const formatAddress = (a: IShippingAddressSnapshot) =>
  [a.street, a.area, a.thana, a.district, a.postcode].filter(Boolean).join(", ");

export default function OrderDetailSheet({ open, onOpenChange, order, isLoading }: OrderDetailSheetProps) {
  const [changeStatus, { isLoading: statusLoading }] = useChangeOrderStatusMutation();
  const [verifyPayment, { isLoading: verifyLoading }] = useVerifyOrderPaymentMutation();
  const canUpdateStatus = usePermission("order.update");
  const canVerifyPayment = usePermission("order.verify_payment");
  const canViewOrders = usePermission("order.view");
  const [rtoOpen, setRtoOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!open) return null;

  const handleTransition = (status: TOrderStatus, note?: string, extra?: { deliveryCostInPoisha?: number; rtoCostInPoisha?: number }) => {
    if (!order) return;
    tryCatchWrapper(
      changeStatus,
      { params: { id: order._id }, body: { status, note, ...extra } },
      { toastLoadingMessage: "Updating order status..." },
    );
  };

  const handleButtonClick = (status: TOrderStatus) => {
    if (status === "RETURNED_TO_ORIGIN") { setRtoOpen(true); return; }
    if (status === "CANCELLED") { setCancelling(true); return; }
    handleTransition(status);
  };

  const handleRtoConfirm = (values: { deliveryCostInPoisha?: number; rtoCostInPoisha?: number }) =>
    handleTransition("RETURNED_TO_ORIGIN", undefined, values);

  const handleCancelConfirm = (_record: IOrderDetail, reason?: string) => {
    handleTransition("CANCELLED", reason);
    setCancelling(false);
  };

  const handleVerify = (status: "COLLECTED" | "VERIFIED" | "FAILED", amountInPoisha?: number) => {
    if (!order) return;
    tryCatchWrapper(
      verifyPayment,
      { params: { id: order._id }, body: { status, amountInPoisha } },
      { toastLoadingMessage: "Recording payment..." },
    );
  };

  const isPaid = !!order && PAID_STATUSES.includes(order.paymentStatus);
  const shipBlockedByPayment = !!order && order.paymentMethod !== "COD" && order.paymentStatus !== "VERIFIED";

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title={order?.orderNumber ?? "Order Details"}
      description={order ? `Placed ${new Date(order.createdAt).toLocaleString()} via ${order.source}` : undefined}
      width="sm:max-w-lg"
      footer={
        order && canViewOrders ? (
          <Button variant="outline" className="w-full" onClick={() => downloadInvoice(order._id, order.orderNumber)}>
            <Download className="mr-2 size-4" /> Download Invoice
          </Button>
        ) : undefined
      }
    >
      {isLoading || !order ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-secondbase-color" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag theme={getRealOrderStatusTheme(order.status)}>{order.status}</Tag>
            <Tag theme={getRealPaymentStatusTheme(order.paymentStatus)}>{`${order.paymentMethod} · ${order.paymentStatus}`}</Tag>
            {order.paymentFlags.duplicateTrxId && <Tag theme="warning">Duplicate TrxID — review</Tag>}
          </div>

          <div>
            <p className="text-sm font-bold mb-1.5">Customer</p>
            <p className="text-sm">{order.customerSnapshot.name}</p>
            <p className="text-sm text-secondbase-color">{order.customerSnapshot.phone}</p>
            <p className="text-sm text-secondbase-color">{formatAddress(order.shippingAddress)}</p>
          </div>

          {order.manualPaymentTrxId && (
            <div>
              <p className="text-sm font-bold mb-1.5">Payment Reference</p>
              <p className="text-sm text-secondbase-color">
                Transaction ID: <span className="font-mono text-base-color">{order.manualPaymentTrxId}</span>
              </p>
            </div>
          )}

          {canVerifyPayment && order.paymentMethod === "COD" && order.status === "DELIVERED" && order.paymentStatus === "PENDING" && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-center justify-between gap-3">
              <p className="text-xs text-orange-800">Confirm the exact COD amount collected: {formatMoney(order.codAmountInPoisha)}.</p>
              <Button
                size="sm"
                className="bg-success hover:bg-success/90 text-white shrink-0"
                disabled={verifyLoading}
                onClick={() => handleVerify("COLLECTED", order.codAmountInPoisha)}
              >
                <CheckCircle2 className="mr-1.5 size-4" /> Mark Collected
              </Button>
            </div>
          )}

          {canVerifyPayment && order.paymentMethod !== "COD" && order.paymentStatus === "PENDING_VERIFICATION" && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-center justify-between gap-3">
              <p className="text-xs text-orange-800">Verify {formatMoney(order.manualPaymentClaimedAmountInPoisha)} against the wallet statement.</p>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 text-white"
                  disabled={verifyLoading}
                  onClick={() => handleVerify("VERIFIED", order.manualPaymentClaimedAmountInPoisha)}
                >
                  <CheckCircle2 className="mr-1.5 size-4" /> Verify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-error text-error hover:bg-error/5"
                  disabled={verifyLoading}
                  onClick={() => handleVerify("FAILED")}
                >
                  <XCircle className="mr-1.5 size-4" /> Mark Failed
                </Button>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-bold mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.variant} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName} — {item.variantName}</p>
                    <p className="text-xs text-secondbase-color">{item.unit} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(item.lineTotalInPoisha)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-secondbase-color"><span>Subtotal</span><span>{formatMoney(order.subtotalInPoisha)}</span></div>
            <div className="flex justify-between text-secondbase-color"><span>Delivery Fee</span><span>{formatMoney(order.deliveryFeeInPoisha)}</span></div>
            {order.discountInPoisha > 0 && (
              <div className="flex justify-between text-error"><span>Discount</span><span>- {formatMoney(order.discountInPoisha)}</span></div>
            )}
            <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border">
              <span>Total</span><span className="text-secondary-color">{formatMoney(order.grandTotalInPoisha)}</span>
            </div>
          </div>

          {canUpdateStatus && order.legalNextStatuses.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {order.legalNextStatuses.map((status) => {
                  const blockedShip = status === "SHIPPED" && shipBlockedByPayment;
                  const blockedCancel = status === "CANCELLED" && isPaid;
                  const disabled = statusLoading || blockedShip || blockedCancel;
                  const title = blockedShip
                    ? "Verify wallet payment first."
                    : blockedCancel
                      ? "Paid orders require a refund flow, which isn't available yet."
                      : undefined;
                  return (
                    <Button
                      key={status}
                      size="sm"
                      variant={status === "CANCELLED" ? "outline" : "default"}
                      className={status === "CANCELLED" ? "border-error text-error hover:bg-error/5" : undefined}
                      disabled={disabled}
                      title={title}
                      onClick={() => handleButtonClick(status)}
                    >
                      <ArrowRight className="mr-1.5 size-4" /> {STATUS_LABEL[status] ?? status}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-bold mb-3">Order Tracking</p>
            <OrderTimeline order={order} />
          </div>
        </div>
      )}

      {order && (
        <>
          <RtoCostModal open={rtoOpen} onOpenChange={setRtoOpen} order={order} onConfirm={handleRtoConfirm} />
          <ConfirmModal
            open={cancelling}
            onCancel={() => setCancelling(false)}
            currentRecord={order}
            onConfirm={handleCancelConfirm}
            title={`Cancel ${order.orderNumber}?`}
            description="Stock is restored and any applied coupon usage is reversed."
            confirmText="Cancel Order"
            variant="danger"
            iconPreset="cancel"
            withReason
            reasonLabel="Cancellation reason"
            reasonRequired
          />
        </>
      )}
    </ReusableSheet>
  );
}
