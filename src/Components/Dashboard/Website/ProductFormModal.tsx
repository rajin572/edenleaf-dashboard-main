import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea, FormSelect, FormUpload } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { SelectGroup, SelectItem, SelectLabel } from "@/Components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import VariantManagerPanel from "./VariantManagerPanel";
import type { FileWithPreview } from "@/Components/ui/CustomUi/ReuseForm/FileUpload";
import type { ICategory, IProduct, IProductFormValues } from "@/types";

const variantSchema = z
  .object({
    name: z.string().trim().optional(),
    sku: z.string().min(1, "SKU is required"),
    price: z.coerce.number().min(0, "Price must be 0 or greater"),
    comparePrice: z.coerce.number().min(0, "Must be 0 or greater").optional(),
    costPrice: z.coerce.number().min(0, "Must be 0 or greater").optional(),
    stock: z.coerce.number().int().min(0, "Stock must be 0 or greater"),
    unit: z.string().min(1, "Unit is required (e.g. 500g)"),
  })
  .refine((v) => v.comparePrice === undefined || v.comparePrice >= v.price, {
    message: "Compare price cannot be lower than price",
    path: ["comparePrice"],
  });

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  status: z.enum(["published", "draft"]),
  // Only used on create — editing an existing product's variants goes through
  // the separate /products/:id/variants sub-resource (VariantManagerPanel),
  // since PATCH /products/:id's own schema doesn't accept a variants field.
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  defaultVariantIndex: z.number().int().min(0),
  images: z.custom<FileWithPreview[]>().optional(),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IProduct | null;
  categories: ICategory[];
  /** Pre-selects a category when creating a product from a category row's "Add Product" action. */
  presetCategoryId?: string | null;
  onSave: (values: IProductFormValues, files: File[]) => void;
}

const emptyVariant = () => ({
  name: "", sku: "", price: 0, comparePrice: undefined, costPrice: undefined, stock: 0, unit: "",
});

const emptyValues = (categoryId = ""): ProductFormInput => ({
  name: "", categoryId, description: "", status: "draft",
  variants: [emptyVariant()], defaultVariantIndex: 0, images: [],
});

export default function ProductFormModal({ open, onOpenChange, editing, categories, presetCategoryId, onSave }: ProductFormModalProps) {
  const canViewCost = usePermission("product.view_cost");

  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues(),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            name: editing.name,
            categoryId: editing.categoryId,
            description: editing.description ?? "",
            status: editing.status === "published" ? "published" : "draft",
            // Not editable here once a product exists — see VariantManagerPanel.
            variants: [emptyVariant()],
            defaultVariantIndex: 0,
            images: [],
          }
          : emptyValues(presetCategoryId ?? "")
      );
    }
  }, [open, editing, presetCategoryId, form]);

  const defaultVariantIndex = form.watch("defaultVariantIndex");

  const handleRemoveVariant = (index: number) => {
    if (fields.length <= 1) return;
    remove(index);
    const current = form.getValues("defaultVariantIndex");
    if (current === index) form.setValue("defaultVariantIndex", 0);
    else if (current > index) form.setValue("defaultVariantIndex", current - 1);
  };

  const onSubmit = (values: ProductFormOutput) => {
    const { images, defaultVariantIndex: defaultIndex, variants, ...rest } = values;
    const payload: IProductFormValues = {
      ...rest,
      // Editing an existing product must NOT send a `variants` key at all —
      // PATCH /products/:id's schema is `.strict()` with no `variants` field
      // (variant edits go through VariantManagerPanel's own sub-resource
      // calls instead); sending even `variants: []` 400s as an unrecognized key.
      ...(editing ? {} : {
        variants: variants.map((v, i) => ({
          name: v.name || undefined,
          sku: v.sku,
          priceInPoisha: Math.round(v.price * 100),
          comparePriceInPoisha: v.comparePrice !== undefined ? Math.round(v.comparePrice * 100) : undefined,
          costPriceInPoisha: v.costPrice !== undefined ? Math.round(v.costPrice * 100) : undefined,
          stock: v.stock,
          unit: v.unit,
          isDefault: i === defaultIndex,
        })),
      }),
    };
    onSave(payload, images?.map((f) => f.file) ?? []);
    onOpenChange(false);
  };

  const topLevel = categories.filter((c) => c.parentId === null);

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Product" : "Add Product"}
      description="Products can belong directly to a category, or to one of its sub-categories."
      maxWidth="sm:max-w-[760px]"
      footer={
        <Button type="submit" form="product-form">
          {editing ? "Save Changes" : "Add Product"}
        </Button>
      }
    >
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          {editing && editing.images.length > 0 && (
            <div>
              <FieldLabel className="text-sm font-medium mb-1.5">Current Images</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {editing.images.map((url) => (
                  <img key={url} src={url} alt={editing.name} className="w-20 h-20 object-cover rounded-lg border border-border" />
                ))}
              </div>
            </div>
          )}

          <FormUpload control={form.control} name="images" label={editing ? "Add / Replace Images (optional)" : "Product Images"} maxFiles={10} />

          <FormInput control={form.control} name="name" label="Product Name" placeholder="e.g. Premium Sundarbans Honey" />

          <FormSelect control={form.control} name="categoryId" label="Category" placeholder="Select a category or sub-category">
            {topLevel.map((cat) => {
              const children = categories.filter((c) => c.parentId === cat._id);
              return (
                <SelectGroup key={cat._id}>
                  <SelectLabel>{cat.name}</SelectLabel>
                  <SelectItem value={cat._id}>{cat.name} (General)</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child._id} value={child._id}>— {child.name}</SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
          </FormSelect>

          <FormTextarea control={form.control} name="description" label="Description (optional)" />

          <FormSelect control={form.control} name="status" label="Status" placeholder="Select status">
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </FormSelect>

          {editing ? (
            <VariantManagerPanel productId={editing._id} canViewCost={canViewCost} />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-sm font-medium">Variants</FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant())}>
                  <Plus className="mr-1.5 size-4" /> Add Variant
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="defaultVariantIndex"
                          checked={defaultVariantIndex === index}
                          onChange={() => form.setValue("defaultVariantIndex", index)}
                        />
                        Default variant
                      </label>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 bg-red-50" onClick={() => handleRemoveVariant(index)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput control={form.control} name={`variants.${index}.name`} label="Variant Name (optional)" placeholder="e.g. 500g" />
                      <FormInput control={form.control} name={`variants.${index}.sku`} label="SKU" placeholder="e.g. HONEY-01" />
                    </div>
                    <div className={`grid gap-3 ${canViewCost ? "grid-cols-3" : "grid-cols-2"}`}>
                      <FormInput control={form.control} name={`variants.${index}.price`} label="Price (৳)" type="number" />
                      <FormInput control={form.control} name={`variants.${index}.comparePrice`} label="Compare Price (optional)" type="number" />
                      {canViewCost && (
                        <FormInput control={form.control} name={`variants.${index}.costPrice`} label="Cost Price (optional)" type="number" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput control={form.control} name={`variants.${index}.stock`} label="Stock" type="number" />
                      <FormInput control={form.control} name={`variants.${index}.unit`} label="Unit" placeholder="e.g. 500g" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FieldGroup>
      </form>
    </ReusableModal>
  );
}
