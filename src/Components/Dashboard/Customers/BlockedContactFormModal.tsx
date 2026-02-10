import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import { bdPhoneSchema } from "@/utils/phoneValidation";
import type { IBlockedContact, IBlockedContactFormValues } from "@/types";

const blockedContactSchema = z.object({
  phone: bdPhoneSchema,
  reason: z.string().trim().min(2, "Reason is required").max(500),
});

interface BlockedContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IBlockedContact | null;
  onSave: (values: IBlockedContactFormValues) => void;
}

export default function BlockedContactFormModal({ open, onOpenChange, editing, onSave }: BlockedContactFormModalProps) {
  const form = useForm<IBlockedContactFormValues>({
    resolver: zodResolver(blockedContactSchema),
    defaultValues: { phone: "", reason: "" },
  });

  useEffect(() => {
    if (open) form.reset(editing ? { phone: editing.phone, reason: editing.reason } : { phone: "", reason: "" });
  }, [open, editing, form]);

  const onSubmit = (values: IBlockedContactFormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Blocked Contact" : "Block a Phone Number"}
      description="Orders from this phone number will be rejected at checkout."
      footer={<Button type="submit" form="blocked-contact-form">{editing ? "Save Changes" : "Block Number"}</Button>}
    >
      <form id="blocked-contact-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormInput control={form.control} name="phone" label="Phone Number" placeholder="01700000000" />
        <FormTextarea control={form.control} name="reason" label="Reason (e.g. Repeated fake orders / abusive behavior)" />
      </form>
    </ReusableModal>
  );
}
