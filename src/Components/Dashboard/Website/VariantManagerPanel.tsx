import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Plus, Pencil, Archive, Star } from "lucide-react";
import { FormInput } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { usePermission } from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useArchiveVariantMutation,
} from "@/redux/features/product/productVariantApi";
import type { IProductVariant } from "@/types";

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

type VariantFormInput = z.input<typeof variantSchema>;
type VariantFormOutput = z.output<typeof variantSchema>;

const emptyValues = (): VariantFormInput => ({
  name: "", sku: "", price: 0, comparePrice: undefined, costPrice: undefined, stock: 0, unit: "",
});

interface VariantEditRowProps {
  productId: string;
  variant: IProductVariant | null;
  canViewCost: boolean;
  onDone: () => void;
}

function VariantEditRow({ productId, variant, canViewCost, onDone }: VariantEditRowProps) {
  const [createVariant] = useCreateVariantMutation();
  const [updateVariant] = useUpdateVariantMutation();

  const form = useForm<VariantFormInput, unknown, VariantFormOutput>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant
      ? {
        name: variant.name, sku: variant.sku, price: variant.priceInPoisha / 100,
        comparePrice: variant.comparePriceInPoisha !== undefined ? variant.comparePriceInPoisha / 100 : undefined,
        costPrice: variant.costPriceInPoisha !== undefined ? variant.costPriceInPoisha / 100 : undefined,
        stock: variant.stock, unit: variant.unit,
      }
      : emptyValues(),
  });

  const onSubmit = async (values: VariantFormOutput) => {
    const base = {
      name: values.name || undefined,
      sku: values.sku,
      priceInPoisha: Math.round(values.price * 100),
      comparePriceInPoisha: values.comparePrice !== undefined ? Math.round(values.comparePrice * 100) : undefined,
      costPriceInPoisha: values.costPrice !== undefined ? Math.round(values.costPrice * 100) : undefined,
      unit: values.unit,
    };
    // PATCH .../variants/:variantId is `.strict()` with no `stock` field —
    // stock only ever moves through /inventory/adjustments, for an audit
    // trail. Sending it here 400s as an unrecognized key, so it's only
    // included on create (where the schema does allow an initial value).
    const res = variant
      ? await tryCatchWrapper(updateVariant, { params: { productId, variantId: variant._id }, body: base }, { toastLoadingMessage: "Saving variant..." })
      : await tryCatchWrapper(createVariant, { params: { productId }, body: { ...base, stock: values.stock } }, { toastLoadingMessage: "Adding variant..." });
    if (res?.success) onDone();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FormInput control={form.control} name="name" label="Variant Name (optional)" placeholder="e.g. 500g" />
          <FormInput control={form.control} name="sku" label="SKU" placeholder="e.g. HONEY-01" />
        </div>
        <div className={`grid gap-3 ${canViewCost ? "grid-cols-3" : "grid-cols-2"}`}>
          <FormInput control={form.control} name="price" label="Price (৳)" type="number" />
          <FormInput control={form.control} name="comparePrice" label="Compare Price (optional)" type="number" />
          {canViewCost && <FormInput control={form.control} name="costPrice" label="Cost Price (optional)" type="number" />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormInput control={form.control} name="stock" label="Stock" type="number" disabled={!!variant} />
            {variant && <p className="text-xs text-secondbase-color mt-1">Adjust stock from Inventory → Stock, not here.</p>}
          </div>
          <FormInput control={form.control} name="unit" label="Unit" placeholder="e.g. 500g" />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
          <Button type="submit" size="sm">{variant ? "Save Variant" : "Add Variant"}</Button>
        </div>
      </FieldGroup>
    </form>
  );
}

interface VariantManagerPanelProps {
  productId: string;
  canViewCost: boolean;
}

export default function VariantManagerPanel({ productId, canViewCost }: VariantManagerPanelProps) {
  const canUpdate = usePermission("product.update");
  const { data, isFetching } = useGetVariantsQuery(productId);
  const variants = data?.data ?? [];

  const [updateVariant] = useUpdateVariantMutation();
  const [archiveVariant] = useArchiveVariantMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // If the row being edited got archived elsewhere (another tab), fall back cleanly.
  useEffect(() => {
    if (editingId && !variants.some((v) => v._id === editingId)) setEditingId(null);
  }, [variants, editingId]);

  const handleSetDefault = (variant: IProductVariant) => {
    if (variant.isDefault) return;
    tryCatchWrapper(
      updateVariant,
      { params: { productId, variantId: variant._id }, body: { isDefault: true } },
      { toastLoadingMessage: "Setting default variant..." }
    );
  };

  const handleToggleActive = (variant: IProductVariant) => {
    const status = variant.status === "active" ? "inactive" : "active";
    tryCatchWrapper(
      updateVariant,
      { params: { productId, variantId: variant._id }, body: { status } },
      { toastLoadingMessage: status === "active" ? "Activating variant..." : "Deactivating variant..." }
    );
  };

  const handleArchive = (variant: IProductVariant) => {
    tryCatchWrapper(
      archiveVariant,
      { params: { productId, variantId: variant._id } },
      { toastLoadingMessage: "Archiving variant..." }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel className="text-sm font-medium">Variants</FieldLabel>
        {canUpdate && !addOpen && !editingId && (
          <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Add Variant
          </Button>
        )}
      </div>

      {isFetching ? (
        <div className="py-6 flex justify-center"><SpinLoader /></div>
      ) : (
        <div className="space-y-2">
          {variants.map((variant) =>
            editingId === variant._id ? (
              <VariantEditRow key={variant._id} productId={productId} variant={variant} canViewCost={canViewCost} onDone={() => setEditingId(null)} />
            ) : (
              <div key={variant._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{variant.name}</span>
                    {variant.isDefault && <Tag theme="blue">Default</Tag>}
                    <Tag theme={variant.status === "active" ? "success" : "warning"}>{variant.status === "active" ? "Active" : "Inactive"}</Tag>
                  </div>
                  <p className="text-xs text-secondbase-color">
                    {variant.sku} · {formatMoney(variant.priceInPoisha)} · Stock {variant.stock}
                    {canViewCost && variant.costPriceInPoisha !== undefined ? ` · Cost ${formatMoney(variant.costPriceInPoisha)}` : ""}
                  </p>
                </div>
                {canUpdate && (
                  <div className="flex gap-1">
                    {!variant.isDefault && (
                      <Button type="button" variant="ghost" size="icon" title="Set as default" className="h-8 w-8" onClick={() => handleSetDefault(variant)}>
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="icon" title="Edit" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setEditingId(variant._id)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleToggleActive(variant)}>
                      {variant.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title="Archive" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => handleArchive(variant)}>
                      <Archive className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
          {addOpen && (
            <VariantEditRow productId={productId} variant={null} canViewCost={canViewCost} onDone={() => setAddOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
}
