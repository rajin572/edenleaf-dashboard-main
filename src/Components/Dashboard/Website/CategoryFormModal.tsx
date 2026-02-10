import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea, FormSelect, FormSwitch, FormUpload } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { SelectItem } from "@/Components/ui/select";
import type { FileWithPreview } from "@/Components/ui/CustomUi/ReuseForm/FileUpload";
import type { ICategory, ICategoryFormValues } from "@/types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parentId: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean(),
  order: z.coerce.number().int().min(0, "Order must be 0 or greater"),
  images: z.custom<FileWithPreview[]>().optional(),
});

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormOutput = z.output<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ICategory | null;
  parentOptions: ICategory[];
  /** Pre-selects a parent when creating a subcategory from a category row's "Add Subcategory" action. */
  presetParentId?: string | null;
  onSave: (values: ICategoryFormValues, image?: File) => void;
}

const NONE_PARENT = "none";

export default function CategoryFormModal({ open, onOpenChange, editing, parentOptions, presetParentId, onSave }: CategoryFormModalProps) {
  const form = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: NONE_PARENT,
      seoTitle: "",
      seoDescription: "",
      isActive: true,
      order: 0,
      images: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            name: editing.name,
            slug: editing.slug,
            description: editing.description ?? "",
            parentId: editing.parentId ?? NONE_PARENT,
            seoTitle: editing.seoTitle ?? "",
            seoDescription: editing.seoDescription ?? "",
            isActive: editing.status === "active",
            order: editing.order,
            images: [],
          }
          : { name: "", slug: "", description: "", parentId: presetParentId ?? NONE_PARENT, seoTitle: "", seoDescription: "", isActive: true, order: 0, images: [] }
      );
    }
  }, [open, editing, presetParentId, form]);

  // Auto-derive the slug while creating a new category; once a category
  // exists, editing its name must never silently change a live URL.
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!editing) {
      form.setValue("slug", slugify(nameValue ?? ""));
    }
  }, [nameValue, editing, form]);

  const onSubmit = (values: CategoryFormOutput) => {
    const { images, isActive, parentId, ...rest } = values;
    onSave(
      {
        ...rest,
        parentId: parentId === NONE_PARENT ? null : parentId,
        status: isActive ? "active" : "inactive",
      },
      images?.[0]?.file
    );
    onOpenChange(false);
  };

  const availableParents = parentOptions.filter((c) => c._id !== editing?._id);

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Category" : presetParentId ? "Create Sub-category" : "Create Category"}
      description="Organize storefront navigation into categories and sub-categories."
      footer={
        <Button type="submit" form="category-form">
          {editing ? "Save Changes" : "Create Category"}
        </Button>
      }
    >
      <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          {editing?.image && (
            <div>
              <FieldLabel className="text-sm font-medium mb-1.5">Current Image</FieldLabel>
              <img src={editing.image} alt={editing.name} className="w-24 h-24 object-cover rounded-lg border border-border" />
            </div>
          )}

          <FormUpload control={form.control} name="images" label={editing ? "Replace Image (optional)" : "Category Image (optional)"} maxFiles={1} />

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="name" label="Category Name" placeholder="e.g. Honey" />
            <FormInput control={form.control} name="slug" label="Slug" placeholder="e.g. honey" />
          </div>

          <FormTextarea control={form.control} name="description" label="Description (optional)" />

          <FormSelect control={form.control} name="parentId" label="Parent Category" placeholder="None (top-level category)">
            <SelectItem value={NONE_PARENT}>None (top-level category)</SelectItem>
            {availableParents.map((category) => (
              <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
            ))}
          </FormSelect>

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="seoTitle" label="SEO Title (optional)" />
            <FormInput control={form.control} name="order" label="Display Order" type="number" />
          </div>
          <FormTextarea control={form.control} name="seoDescription" label="SEO Description (optional)" />

          <FormSwitch control={form.control} name="isActive" label="Active on storefront" />
        </FieldGroup>
      </form>
    </ReusableModal>
  );
}
