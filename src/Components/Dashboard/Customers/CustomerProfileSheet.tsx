import { useState } from "react";
import { toast } from "sonner";
import ReusableSheet from "@/Components/ui/CustomUi/ReuseableSheet";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Mail } from "lucide-react";
import ComposeEmailModal from "@/Components/Dashboard/Marketing/ComposeEmailModal";
import { getRealOrderStatusTheme } from "@/utils/orderStatus";
import { formatDate } from "@/utils/dateFormet";
import { formatMoney } from "@/utils/money";
import { useGetCustomerByIdQuery, useGetCustomerOrdersQuery } from "@/redux/features/customer/customerApi";
import type { INewsletterCampaignValues, TOrderStatus } from "@/types";

interface CustomerProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

export default function CustomerProfileSheet({ open, onOpenChange, customerId }: CustomerProfileSheetProps) {
  const { data, isFetching } = useGetCustomerByIdQuery(customerId ?? "", { skip: !open || !customerId });
  const { data: ordersRes } = useGetCustomerOrdersQuery(customerId ?? "", { skip: !open || !customerId });
  const customer = data?.data;
  const orders = ordersRes?.data?.data ?? [];
  const [composeOpen, setComposeOpen] = useState(false);

  if (!open) return null;

  const handleSend = (values: INewsletterCampaignValues) => {
    toast.success(`"${values.subject}" sent to ${customer?.email}`);
  };

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title={customer?.name ?? "Customer Profile"}
      description={customer ? `Customer since ${formatDate(customer.createdAt)}` : undefined}
      width="sm:max-w-lg"
      footer={
        customer ? (
          <Button
            className="w-full"
            disabled={!customer.email}
            title={customer.email ? undefined : "No email on file for this customer"}
            onClick={() => setComposeOpen(true)}
          >
            <Mail className="mr-2 size-4" /> Send Email to {customer.name}
          </Button>
        ) : undefined
      }
    >
      {isFetching || !customer ? (
        <div className="flex justify-center py-10"><SpinLoader /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Tag theme={customer.status === "active" ? "success" : customer.status === "blocked" ? "error" : "warning"}>{customer.status}</Tag>
            <Tag theme="blue">{customer.role?.name ?? "Customer"}</Tag>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-secondbase-color">Phone</p>
              <p className="text-sm font-medium">{customer.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-secondbase-color">Email</p>
              <p className="text-sm font-medium">{customer.email || "—"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold mb-2">Addresses</p>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-secondbase-color">No saved addresses.</p>
            ) : (
              <div className="space-y-2">
                {customer.addresses.map((a) => (
                  <div key={a._id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{a.name}</p>
                      {a.isDefault && <Tag theme="blue">Default</Tag>}
                    </div>
                    <p className="text-xs text-secondbase-color mt-0.5">
                      {[a.street, a.area, a.thana, a.district, a.postcode].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-xs text-secondbase-color">{a.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-secondbase-color">Total Orders</p>
              <p className="text-xl font-bold">{customer.orderSummary.orderCount}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-secondbase-color">Delivered Spend</p>
              <p className="text-xl font-bold text-secondary-color">{formatMoney(customer.orderSummary.deliveredSpendInPoisha)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold mb-2">Recent Orders</p>
            {orders.length === 0 ? (
              <p className="text-sm text-secondbase-color">No orders placed yet.</p>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-bold">{o.orderNumber}</p>
                      <p className="text-xs text-secondbase-color" title={new Date(o.createdAt).toLocaleString()}>
                        {formatDate(o.createdAt)} · {formatMoney(o.grandTotalInPoisha)}
                      </p>
                    </div>
                    <Tag theme={getRealOrderStatusTheme(o.status as TOrderStatus)}>{o.status}</Tag>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {customer?.email && (
        <ComposeEmailModal
          open={composeOpen}
          onOpenChange={setComposeOpen}
          title={`Email ${customer.name}`}
          description={`This will be sent directly to ${customer.email}.`}
          submitLabel="Send"
          onSend={handleSend}
        />
      )}
    </ReusableSheet>
  );
}
