import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormSwitch, FormUpload } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import type { FileWithPreview } from "@/Components/ui/CustomUi/ReuseForm/FileUpload";
import type { IBanner, IBannerFormValues, IBannerPlacement } from "@/types";

const bannerSchema = z.object({
  destinationUrl: z.string().trim().min(1, "Destination URL is required").max(2000).refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "Use an internal path or an HTTP URL"
  ),
  isActive: z.boolean(),
  images: z.custom<FileWithPreview[]>().optional(),
});

type BannerFormInput = z.input<typeof bannerSchema>;
type BannerFormOutput = z.output<typeof bannerSchema>;

interface BannerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IBanner | null;
  placement: IBannerPlacement;
  slotLabel?: string;
  onSave: (values: IBannerFormValues, image?: File) => Promise<void>;
}

const BannerFormModal = ({ open, onOpenChange, editing, placement, slotLabel, onSave }: BannerFormModalProps) => {
  const isHero = placement === "hero";
  const form = useForm<BannerFormInput, unknown, BannerFormOutput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { destinationUrl: "/", isActive: true, images: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            destinationUrl: editing.destinationUrl,
            isActive: editing.isActive,
            images: [],
          }
          : { destinationUrl: "/", isActive: true, images: [] }
      );
    }
  }, [open, editing, form]);

  const onSubmit = async (values: BannerFormOutput) => {
    const { images, ...rest } = values;
    const image = images?.[0]?.file;
    if (!editing && !image) {
      form.setError("images", { type: "manual", message: "Banner image is required" });
      return;
    }
    if (image && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(image.type)) {
      form.setError("images", { type: "manual", message: "Upload a JPG, PNG, WebP, or GIF image" });
      return;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      form.setError("images", { type: "manual", message: "Image must be 5 MB or smaller" });
      return;
    }
    await onSave({ ...rest, placement }, image);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? `Edit ${slotLabel ?? "Hero Banner"}` : `Add ${slotLabel ?? "Hero Banner"}`}
      description={isHero ? "Upload an image for the homepage slider. Arrange its position in the table." : "Upload the image and choose where it opens."}
      footer={
        <Button type="submit" form="banner-form" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : editing ? "Save Changes" : "Add Banner"}
        </Button>
      }
    >
      <form id="banner-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          {editing && (
            <div>
              <FieldLabel className="text-sm font-medium mb-1.5">Current Image</FieldLabel>
              <img src={editing.image} alt={editing.title} className="h-32 w-full rounded-lg border border-border object-contain" />
            </div>
          )}

          <FormUpload
            control={form.control}
            name="images"
            label={editing ? "Replace Image (optional)" : "Banner Image"}
            maxFiles={1}
            accept="image/jpeg,image/png,image/webp,image/gif"
          />

          <FormInput
            control={form.control}
            name="destinationUrl"
            label="Destination URL"
            placeholder="/collections/offers or https://..."
          />
          {!isHero && <p className="text-xs text-secondbase-color">Use / to open the homepage, or enter the path this image should open.</p>}

          <FormSwitch control={form.control} name="isActive" label="Active on storefront" />
        </FieldGroup>
      </form>
    </ReusableModal>
  );
};

export default BannerFormModal;
