import { useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import ProductPickerModal from "@/Components/Dashboard/Website/ProductPickerModal";
import { usePermission } from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { useGetProductsQuery, useSetFeaturedPlacementMutation } from "@/redux/features/product/productApi";
import type { IProduct } from "@/types";

const FeaturedProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  const canUpdate = usePermission("product.update");

  const { data: featuredData, isFetching } = useGetProductsQuery(
    { page: 1, limit: 100, isFeatured: true, sort: "featuredOrder" },
    { refetchOnMountOrArgChange: true }
  );
  const featured = featuredData?.data.data ?? [];

  const { data: catalogData } = useGetProductsQuery({ page: 1, limit: 100, status: "published" });
  const availableProducts = (catalogData?.data.data ?? []).filter((p) => !p.isFeatured);

  const [setFeaturedPlacement] = useSetFeaturedPlacementMutation();

  const handleAdd = async (ids: string[]) => {
    const maxOrder = featured.reduce((max, p) => Math.max(max, p.featuredOrder), -1);
    const results = await Promise.all(
      ids.map((id, i) =>
        tryCatchWrapper(
          setFeaturedPlacement,
          { params: { id }, body: { enabled: true, order: maxOrder + 1 + i } },
          { showToast: false }
        )
      )
    );
    if (results.every((r) => r?.success)) {
      toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} added to Featured`);
    } else {
      toast.error("Some products could not be added to Featured");
    }
  };

  const handleRemove = (product: IProduct) => {
    tryCatchWrapper(
      setFeaturedPlacement,
      { params: { id: product._id }, body: { enabled: false } },
      { toastLoadingMessage: "Removing from Featured..." }
    );
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= featured.length) return;
    const a = featured[index];
    const b = featured[target];
    await Promise.all([
      tryCatchWrapper(setFeaturedPlacement, { params: { id: a._id }, body: { enabled: true, order: b.featuredOrder } }, { showToast: false }),
      tryCatchWrapper(setFeaturedPlacement, { params: { id: b._id }, body: { enabled: true, order: a.featuredOrder } }, { showToast: false }),
    ]);
  };

  const columns: Column<IProduct>[] = [
    {
      header: "Order", accessorKey: "featuredOrder", width: 100, render: (_val, _row, index) => (
        <div className="flex items-center gap-1">
          <span className="w-4 text-secondbase-color">{index + 1}</span>
          {canUpdate && (
            <div className="flex flex-col">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-25 text-secondbase-color hover:text-base-color">
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" disabled={index === featured.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-25 text-secondbase-color hover:text-base-color">
                <ArrowDown className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Product", accessorKey: "name", render: (_val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.image} alt={row.name} className="size-10 rounded-md border border-border object-cover" />
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-secondbase-color">{formatMoney(row.priceInPoisha)}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Actions", accessorKey: "_id", render: (_val, row) => (
        canUpdate ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => handleRemove(row)}>
            <X className="size-4" />
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <PageWraper
      title="Featured Products"
      description="Manually curated products shown in the homepage featured row and /collections/featured-products."
      actions={canUpdate ? <Button onClick={() => setPickerOpen(true)}><Plus className="mr-2 size-4" /> Add Product</Button> : undefined}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={featured}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={featured.length}
          />
        )}
      </div>

      <ProductPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Add to Featured Products"
        description="Select one or more published products to show in the featured row."
        availableProducts={availableProducts}
        onAdd={handleAdd}
      />
    </PageWraper>
  );
};

export default FeaturedProductsPage;
