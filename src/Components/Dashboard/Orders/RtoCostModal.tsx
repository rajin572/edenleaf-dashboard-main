import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import { toPoisha } from "@/utils/money";
import type { IOrder } from "@/types";

const rtoSchema = z.object({
  deliveryCostInPoisha: z.coerce.number().min(0).optional(),
  rtoCostInPoisha: z.coerce.number().min(0).optional(),
});

type RtoFormInput = z.input<typeof rtoSchema>;
type RtoFormOutput = z.output<typeof rtoSchema>;

interface RtoCostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder | null;
  onConfirm: (values: { deliveryCostInPoisha?: number; rtoCostInPoisha?: number }) => void;
}

/** Recording the optional delivery/RTO cost when a failed-delivery order is
 *  marked returned-to-origin — both feed the ledger's DELIVERY_COST/RTO_COST
 *  entries and are the only extra payload the RETURNED_TO_ORIGIN transition accepts. */
export default function RtoCostModal({ open, onOpenChange, order, onConfirm }: RtoCostModalProps) {
  const form = useForm<RtoFormInput, unknown, RtoFormOutput>({
    resolver: zodResolver(rtoSchema),
    defaultValues: { deliveryCostInPoisha: 0, rtoCostInPoisha: 0 },
  });

  useEffect(() => {
    if (open) form.reset({ deliveryCostInPoisha: 0, rtoCostInPoisha: 0 });
  }, [open, order, form]);

  if (!order) return null;

  const onSubmit = (values: RtoFormOutput) => {
    onConfirm({
      deliveryCostInPoisha: values.deliveryCostInPoisha ? toPoisha(values.deliveryCostInPoisha) : undefined,
      rtoCostInPoisha: values.rtoCostInPoisha ? toPoisha(values.rtoCostInPoisha) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Mark ${order.orderNumber} as Returned to Origin`}
      description="Optionally record the delivery and return-to-origin costs — both post to the finance ledger."
      footer={<Button type="submit" form="rto-cost-form">Confirm</Button>}
    >
      <form id="rto-cost-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormInput control={form.control} name="deliveryCostInPoisha" label="Delivery Cost (৳, optional)" type="number" />
        <FormInput control={form.control} name="rtoCostInPoisha" label="Return-to-Origin Cost (৳, optional)" type="number" />
      </form>
    </ReusableModal>
  );
}
