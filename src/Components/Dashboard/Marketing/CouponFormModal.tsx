import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import { SelectItem } from "@/Components/ui/select";
import { toPoisha, fromPoisha } from "@/utils/money";
import type { ICoupon, ICouponFormValues } from "@/types";

const toDateInput = (iso: string) => iso.slice(0, 10);

const couponSchema = z
  .object({
    code: z.string().min(3, "Code must be at least 3 characters").transform((v) => v.toUpperCase()),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().min(1, "Value must be greater than 0"),
    minOrderAmount: z.coerce.number().min(0, "Must be 0 or greater").optional(),
    maxDiscount: z.coerce.number().min(0, "Must be 0 or greater").optional(),
    usageLimit: z.coerce.number().int().min(1, "Must be at least 1").optional(),
    perUserLimit: z.coerce.number().int().min(1, "Must be at least 1").optional(),
    startDate: z.string().min(1, "Start date is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    firstOrderOnly: z.boolean(),
    isPublic: z.boolean(),
    isActive: z.boolean(),
  })
  .refine((v) => new Date(v.expiryDate) > new Date(v.startDate), {
    message: "Expiry must be after the start date",
    path: ["expiryDate"],
  })
  .refine((v) => v.type !== "percentage" || v.value <= 100, {
    message: "Percentage cannot exceed 100",
    path: ["value"],
  });

type CouponFormInput = z.input<typeof couponSchema>;
type CouponFormOutput = z.output<typeof couponSchema>;

interface CouponFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ICoupon | null;
  onSave: (values: ICouponFormValues) => void;
}

const emptyValues: CouponFormInput = {
  code: "", name: "", description: "", type: "percentage", value: 10,
  minOrderAmount: undefined, maxDiscount: undefined, usageLimit: undefined, perUserLimit: undefined,
  startDate: new Date().toISOString().slice(0, 10), expiryDate: new Date().toISOString().slice(0, 10),
  firstOrderOnly: false, isPublic: false, isActive: true,
};

export default function CouponFormModal({ open, onOpenChange, editing, onSave }: CouponFormModalProps) {
  const form = useForm<CouponFormInput, unknown, CouponFormOutput>({
    resolver: zodResolver(couponSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            code: editing.code, name: editing.name, description: editing.description ?? "",
            type: editing.type,
            // `value` is a raw percentage (1-100) for Percentage coupons, but
            // stored in poisha for Fixed ones — the taka input needs the
            // conversion only in the Fixed case.
            value: editing.type === "fixed" ? fromPoisha(editing.value) : editing.value,
            minOrderAmount: editing.minOrderInPoisha ? fromPoisha(editing.minOrderInPoisha) : undefined,
            maxDiscount: editing.maxDiscountInPoisha ? fromPoisha(editing.maxDiscountInPoisha) : undefined,
            usageLimit: editing.usageLimit ?? undefined,
            perUserLimit: editing.perUserLimit ?? undefined,
            startDate: toDateInput(editing.startsAt), expiryDate: toDateInput(editing.expiresAt),
            firstOrderOnly: editing.firstOrderOnly, isPublic: editing.isPublic,
            isActive: editing.status === "active",
          }
          : emptyValues
      );
    }
  }, [open, editing, form]);

  const type = form.watch("type");

  // maxDiscount only applies to percentage coupons (the backend 400s
  // otherwise) — react-hook-form keeps a field's value in state after it
  // unmounts, so switching type away from "percentage" without clearing this
  // would silently resubmit a stale cap and get rejected.
  useEffect(() => {
    if (type !== "percentage") form.setValue("maxDiscount", undefined);
  }, [type, form]);

  const onSubmit = (values: CouponFormOutput) => {
    const { isActive, startDate, expiryDate, minOrderAmount, maxDiscount, value, ...rest } = values;
    onSave({
      ...rest,
      // Same taka-vs-poisha split as the reset above — Percentage stays a
      // raw 1-100 number, Fixed is stored in poisha on the wire.
      value: rest.type === "fixed" ? toPoisha(value) : value,
      minOrderInPoisha: minOrderAmount !== undefined ? toPoisha(minOrderAmount) : undefined,
      maxDiscountInPoisha: maxDiscount !== undefined ? toPoisha(maxDiscount) : null,
      startsAt: new Date(startDate).toISOString(),
      expiresAt: new Date(expiryDate).toISOString(),
      status: isActive ? "active" : "inactive",
    });
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Coupon" : "Create Coupon"}
      description="Discount coupons customers can apply at checkout."
      maxWidth="sm:max-w-[600px]"
      footer={
        <Button type="submit" form="coupon-form">
          {editing ? "Save Changes" : "Create Coupon"}
        </Button>
      }
    >
      <form id="coupon-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="code" label="Coupon Code" placeholder="e.g. WELCOME10" inputClassName="uppercase" />
          <FormSelect control={form.control} name="type" label="Discount Type" placeholder="Select type">
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
          </FormSelect>
        </div>

        <FormInput control={form.control} name="name" label="Internal Name" placeholder="e.g. New Year Sale" />
        <FormTextarea control={form.control} name="description" label="Description (optional)" />

        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="value" label={type === "percentage" ? "Discount (%)" : "Discount Amount (৳)"} type="number" />
          {type === "percentage" && <FormInput control={form.control} name="maxDiscount" label="Max Discount Cap (optional, ৳)" type="number" />}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="minOrderAmount" label="Minimum Order Amount (optional, ৳)" type="number" />
          <FormInput control={form.control} name="usageLimit" label="Total Usage Limit (optional)" type="number" />
        </div>

        <FormInput control={form.control} name="perUserLimit" label="Per-Customer Usage Limit (optional)" type="number" />

        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="startDate" label="Start Date" type="date" />
          <FormInput control={form.control} name="expiryDate" label="Expiry Date" type="date" />
        </div>

        <FormSwitch control={form.control} name="firstOrderOnly" label="First order only" />
        <FormSwitch control={form.control} name="isPublic" label="Show in customer's 'My Coupons' page" />
        <FormSwitch control={form.control} name="isActive" label="Active (customers can use this code)" />
      </form>
    </ReusableModal>
  );
}
