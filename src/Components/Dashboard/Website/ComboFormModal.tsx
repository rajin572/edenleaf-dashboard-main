import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea, FormSwitch, FormUpload } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { Trash2 } from "lucide-react";
import { useGetVariantsQuery } from "@/redux/features/product/productVariantApi";
import { formatMoney, fromPoisha, toPoisha } from "@/utils/money";
import type { FileWithPreview } from "@/Components/ui/CustomUi/ReuseForm/FileUpload";
import type { ICombo, IComboFormValues, IProduct } from "@/types";

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9ঀ-৿]+/g, "-").replace(/^-+|-+$/g, "");

const comboSchema = z.object({
  name: z.string().min(1, "Combo name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  components: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1) })).min(2, "Pick at least 2 components for a combo"),
  comboPrice: z.coerce.number().min(0, "Combo price must be 0 or greater"),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
  images: z.custom<FileWithPreview[]>().optional(),
});

type ComboFormInput = z.input<typeof comboSchema>;
type ComboFormOutput = z.output<typeof comboSchema>;

/** Display metadata for each picked component — not part of the submitted
 *  payload (which is just {variantId, quantity}), but needed to render a
 *  human-readable row without re-fetching every variant on every render. */
interface ComponentMeta {
  productName: string;
  variantName: string;
  priceInPoisha: number;
  stock: number;
}

interface ComboFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ICombo | null;
  products: IProduct[];
  onSave: (values: IComboFormValues, image?: File) => void;
}

const emptyValues = (): ComboFormInput => ({
  name: "", slug: "", description: "", components: [], comboPrice: 0, order: 0, isActive: true, images: [],
});

export default function ComboFormModal({ open, onOpenChange, editing, products, onSave }: ComboFormModalProps) {
  const [componentMeta, setComponentMeta] = useState<Record<string, ComponentMeta>>({});
  const [pickerProductId, setPickerProductId] = useState("");
  const [pickerVariantId, setPickerVariantId] = useState("");
  const [pickerQuantity, setPickerQuantity] = useState(1);

  const form = useForm<ComboFormInput, unknown, ComboFormOutput>({
    resolver: zodResolver(comboSchema),
    defaultValues: emptyValues(),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "components" });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        components: editing.components.map((c) => ({ variantId: c.variantId, quantity: c.quantity })),
        comboPrice: fromPoisha(editing.comboPriceInPoisha),
        order: editing.order,
        isActive: editing.status === "active",
        images: [],
      });
      const meta: Record<string, ComponentMeta> = {};
      editing.components.forEach((c) => {
        meta[c.variantId] = {
          productName: c.product.name,
          variantName: c.variant.name,
          priceInPoisha: c.variant.priceInPoisha,
          stock: c.variant.stock,
        };
      });
      setComponentMeta(meta);
    } else {
      form.reset(emptyValues());
      setComponentMeta({});
    }
    setPickerProductId("");
    setPickerVariantId("");
    setPickerQuantity(1);
  }, [open, editing, form]);

  // Auto-derive the slug while creating a new combo; once a combo exists,
  // editing its name must never silently change a live combo URL.
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!editing) form.setValue("slug", slugify(nameValue ?? ""));
  }, [nameValue, editing, form]);

  const { data: variantsRes } = useGetVariantsQuery(pickerProductId, { skip: !pickerProductId });
  const pickerVariants = variantsRes?.data ?? [];
  const pickedVariantIds = fields.map((f) => f.variantId);

  const components = form.watch("components");
  const regularPriceInPoisha = useMemo(
    () => components.reduce((sum, c) => sum + (componentMeta[c.variantId]?.priceInPoisha ?? 0) * c.quantity, 0),
    [components, componentMeta]
  );

  const handleAddComponent = () => {
    const variant = pickerVariants.find((v) => v._id === pickerVariantId);
    if (!variant || pickedVariantIds.includes(pickerVariantId)) return;
    const product = products.find((p) => p._id === pickerProductId);
    append({ variantId: variant._id, quantity: pickerQuantity });
    setComponentMeta((prev) => ({
      ...prev,
      [variant._id]: {
        productName: product?.name ?? "",
        variantName: variant.name,
        priceInPoisha: variant.priceInPoisha,
        stock: variant.stock,
      },
    }));
    setPickerVariantId("");
    setPickerQuantity(1);
  };

  const onSubmit = (values: ComboFormOutput) => {
    const { images, isActive, comboPrice, ...rest } = values;
    const comboPriceInPoisha = toPoisha(comboPrice);
    if (comboPriceInPoisha > regularPriceInPoisha) {
      form.setError("comboPrice", { message: "Combo price cannot exceed the regular component total" });
      return;
    }
    const payload: IComboFormValues = {
      ...rest,
      comboPriceInPoisha,
      status: isActive ? "active" : "inactive",
    };
    onSave(payload, images?.[0]?.file);
    onOpenChange(false);
  };

  const comboPriceValue = Number(form.watch("comboPrice")) || 0;
  const priceExceedsRegular = toPoisha(comboPriceValue) > regularPriceInPoisha && regularPriceInPoisha > 0;

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Combo" : "Create Combo"}
      description="Bundle two or more product variants together at a discounted combo price."
      maxWidth="sm:max-w-[700px]"
      footer={
        <Button type="submit" form="combo-form">
          {editing ? "Save Changes" : "Create Combo"}
        </Button>
      }
    >
      <form id="combo-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          {editing?.image && (
            <div>
              <FieldLabel className="text-sm font-medium mb-1.5">Current Image</FieldLabel>
              <img src={editing.image} alt={editing.name} className="w-24 h-24 object-cover rounded-lg border border-border" />
            </div>
          )}
          <FormUpload control={form.control} name="images" label={editing ? "Replace Image (optional)" : "Combo Image (optional)"} maxFiles={1} />

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="name" label="Combo Name" placeholder="e.g. মধু ও ঘি কম্বো প্যাক" />
            <FormInput control={form.control} name="slug" label="Slug" />
          </div>

          <FormTextarea control={form.control} name="description" label="Description (optional)" />

          <div>
            <p className="text-sm font-medium mb-2">Components</p>
            <div className="rounded-lg border border-border p-3 space-y-3">
              {fields.length > 0 && (
                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const meta = componentMeta[field.variantId];
                    return (
                      <div key={field.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {meta?.productName ?? "—"}{meta?.variantName && meta.variantName !== "Default" ? ` — ${meta.variantName}` : ""}
                          </p>
                          <p className="text-xs text-secondbase-color">
                            {meta ? formatMoney(meta.priceInPoisha) : ""} × {field.quantity} = {meta ? formatMoney(meta.priceInPoisha * field.quantity) : ""}
                          </p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 bg-red-50 shrink-0" onClick={() => {
                          remove(index);
                          setComponentMeta((prev) => {
                            const next = { ...prev };
                            delete next[field.variantId];
                            return next;
                          });
                        }}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {form.formState.errors.components?.message && (
                <p className="text-xs text-destructive">{form.formState.errors.components.message}</p>
              )}

              <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-end border-t border-border pt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={pickerProductId}
                    onChange={(e) => { setPickerProductId(e.target.value); setPickerVariantId(""); }}
                    className="w-full h-9 px-2 border border-input rounded-md text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Variant</label>
                  <select
                    value={pickerVariantId}
                    onChange={(e) => setPickerVariantId(e.target.value)}
                    disabled={!pickerProductId}
                    className="w-full h-9 px-2 border border-input rounded-md text-sm disabled:opacity-50"
                  >
                    <option value="">Select variant</option>
                    {pickerVariants.filter((v) => !pickedVariantIds.includes(v._id)).map((v) => (
                      <option key={v._id} value={v._id}>{v.name} — {formatMoney(v.priceInPoisha)} (stock {v.stock})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={pickerQuantity}
                    onChange={(e) => setPickerQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full h-9 px-2 border border-input rounded-md text-sm"
                  />
                </div>
                <Button type="button" size="sm" disabled={!pickerVariantId} onClick={handleAddComponent}>Add</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
            <span className="text-secondbase-color">Regular Price (sum of components)</span>
            <span className="font-bold line-through text-secondbase-color">{formatMoney(regularPriceInPoisha)}</span>
          </div>

          <div>
            <FormInput control={form.control} name="comboPrice" label="Combo Price (৳)" type="number" />
            {priceExceedsRegular && (
              <p className="text-xs text-destructive mt-1">Combo price cannot exceed the regular component total.</p>
            )}
          </div>

          <FormInput control={form.control} name="order" label="Display Order" type="number" />

          <FormSwitch control={form.control} name="isActive" label="Active on storefront" />
        </FieldGroup>
      </form>
    </ReusableModal>
  );
}
