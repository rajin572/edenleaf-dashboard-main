import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import { Send } from "lucide-react";
import type { INewsletterCampaignValues } from "@/types";

const campaignSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

interface ComposeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  onSend: (values: INewsletterCampaignValues) => void;
}

export default function ComposeEmailModal({ open, onOpenChange, title, description, submitLabel, onSend }: ComposeEmailModalProps) {
  const form = useForm<INewsletterCampaignValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { subject: "", message: "" },
  });

  const onSubmit = (values: INewsletterCampaignValues) => {
    onSend(values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <Button type="submit" form="compose-email-form">
          <Send className="mr-2 size-4" /> {submitLabel}
        </Button>
      }
    >
      <form id="compose-email-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormInput control={form.control} name="subject" label="Subject" placeholder="e.g. এই সপ্তাহের বিশেষ অফার" />
        <FormTextarea control={form.control} name="message" label="Message" />
      </form>
    </ReusableModal>
  );
}
