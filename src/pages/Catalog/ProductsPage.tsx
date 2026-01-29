import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, X, Star, Sparkles } from "lucide-react";
import ProductFormModal from "@/Components/Dashboard/Website/ProductFormModal";
import { usePermission } from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSetFeaturedPlacementMutation,
  useSetNewArrivalPlacementMutation,
} from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import type { IProduct, IProductFormValues } from "@/types";

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { openCreateFor?: string; filterCategoryId?: string } | null;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(navState?.filterCategoryId ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<IProduct | null>(null);

  const canCreate = usePermission("product.create");
  const canUpdate = usePermission("product.update");
  const canDelete = usePermission("product.delete");

  const { data: categoryData } = useGetCategoriesQuery({ page: 1, limit: 100 });
  const categories = categoryData?.data.data ?? [];

  const { data, isFetching } = useGetProductsQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, categoryId: categoryFilter || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const products = data?.data.data ?? [];
  const meta = data?.data.meta;

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [setFeaturedPlacement] = useSetFeaturedPlacementMutation();
  const [setNewArrivalPlacement] = useSetNewArrivalPlacementMutation();

  // Cheap one-row lookups for the next curated-order slot, so this page's
  // quick star/sparkle toggle appends to the end of FeaturedProductsPage's/
  // NewArrivalsPage's own ordering instead of always inserting at position 0.
  const { data: maxFeaturedData } = useGetProductsQuery({ page: 1, limit: 1, isFeatured: true, sort: "-featuredOrder" });
  const nextFeaturedOrder = (maxFeaturedData?.data.data[0]?.featuredOrder ?? -1) + 1;
  const { data: maxNewArrivalData } = useGetProductsQuery({ page: 1, limit: 1, isNewArrival: true, sort: "-newArrivalOrder" });
  const nextNewArrivalOrder = (maxNewArrivalData?.data.data[0]?.newArrivalOrder ?? -1) + 1;

  // Arrived from Categories page "Add Product" — open the create modal
  // pre-scoped to that category, then clear the nav state so a refresh/back
  // doesn't keep reopening it.
  useEffect(() => {
    if (navState?.openCreateFor) {
      setEditing(null);
      setPresetCategoryId(navState.openCreateFor);
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryLabel = (categoryId: string) => {
    const cat = categories.find((c) => c._id === categoryId);
    if (!cat) return "—";
    if (!cat.parentId) return cat.name;
    const parent = categories.find((c) => c._id === cat.parentId);
    return parent ? `${parent.name} / ${cat.name}` : cat.name;
  };

  const openAddModal = () => {
    setEditing(null);
    setPresetCategoryId(null);
    setModalOpen(true);
  };

  const openEditModal = (product: IProduct) => {
    setEditing(product);
    setPresetCategoryId(null);
    setModalOpen(true);
  };

  const handleSave = async (values: IProductFormValues, files: File[]) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    files.forEach((file) => formData.append("images", file));
    const result = editing
      ? await tryCatchWrapper(updateProduct, { body: formData, params: { id: editing._id } }, { toastLoadingMessage: "Saving product..." })
      : await tryCatchWrapper(createProduct, { body: formData }, { toastLoadingMessage: "Creating product..." });
    if (result?.success) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await tryCatchWrapper(deleteProduct, { params: { id: deleting._id } }, { toastLoadingMessage: "Deleting product..." });
    if (res?.success) setDeleting(null);
  };

  const handleToggleFeatured = (product: IProduct) => {
    if (!product.isFeatured && product.status !== "published") return;
    tryCatchWrapper(
      setFeaturedPlacement,
      { params: { id: product._id }, body: product.isFeatured ? { enabled: false } : { enabled: true, order: nextFeaturedOrder } },
      { toastLoadingMessage: product.isFeatured ? "Removing from Featured..." : "Marking as Featured..." }
    );
  };

  const handleToggleNewArrival = (product: IProduct) => {
    if (!product.isNewArrival && product.status !== "published") return;
    tryCatchWrapper(
      setNewArrivalPlacement,
      { params: { id: product._id }, body: product.isNewArrival ? { enabled: false } : { enabled: true, order: nextNewArrivalOrder } },
      { toastLoadingMessage: product.isNewArrival ? "Removing from New Arrivals..." : "Marking as New Arrival..." }
    );
  };

  const columns: Column<IProduct>[] = [
    {
      header: "Product Name", accessorKey: "name", width: 260, render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.image || "https://placehold.co/80x80.png?text=Product"} alt={val} className="size-10 rounded-md border border-border object-cover" />
          <div className="flex flex-col">
            <span className="font-bold">{val}</span>
            <span className="text-xs text-secondbase-color">{row.variants.length} variant{row.variants.length === 1 ? "" : "s"}</span>
          </div>
        </div>
      ),
    },
    { header: "SKU", accessorKey: "sku" },
    { header: "Category", accessorKey: "categoryId", render: (val) => categoryLabel(val) },
    {
      header: "Price", accessorKey: "minPriceInPoisha", render: (_val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">
            {row.minPriceInPoisha === row.maxPriceInPoisha ? formatMoney(row.minPriceInPoisha) : `${formatMoney(row.minPriceInPoisha)} – ${formatMoney(row.maxPriceInPoisha)}`}
          </span>
          {!!row.comparePriceInPoisha && row.comparePriceInPoisha > row.priceInPoisha && (
            <span className="text-xs text-secondbase-color line-through">{formatMoney(row.comparePriceInPoisha)}</span>
          )}
        </div>
      ),
    },
    {
      header: "Stock", accessorKey: "totalStock", render: (val) => (
        <span className={val > 0 ? (val < 20 ? "text-warning font-bold" : "text-success font-bold") : "text-error font-bold"}>{val}</span>
      ),
    },
    {
      header: "Status", accessorKey: "status", render: (val, row) => {
        if (row.totalStock === 0) return <Tag theme="error">Out of Stock</Tag>;
        return <Tag theme={val === "published" ? "success" : val === "archived" ? "error" : "warning"}>{val === "published" ? "Published" : val === "archived" ? "Archived" : "Draft"}</Tag>;
      },
    },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          {canUpdate && (
            <>
              <Button
                variant="ghost" size="icon" title={row.isFeatured ? "Remove from Featured" : row.status !== "published" ? "Only published products can be featured" : "Mark as Featured"}
                disabled={!row.isFeatured && row.status !== "published"}
                onClick={() => handleToggleFeatured(row)}
                className={`h-8 w-8 disabled:opacity-30 ${row.isFeatured ? "text-amber-500 bg-amber-50" : "text-gray-400 bg-gray-50"}`}
              >
                <Star className="size-4" />
              </Button>
              <Button
                variant="ghost" size="icon" title={row.isNewArrival ? "Remove from New Arrivals" : row.status !== "published" ? "Only published products can be featured" : "Mark as New Arrival"}
                disabled={!row.isNewArrival && row.status !== "published"}
                onClick={() => handleToggleNewArrival(row)}
                className={`h-8 w-8 disabled:opacity-30 ${row.isNewArrival ? "text-purple-500 bg-purple-50" : "text-gray-400 bg-gray-50"}`}
              >
                <Sparkles className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => openEditModal(row)}>
                <Edit className="size-4" />
              </Button>
            </>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setDeleting(row)}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Products"
      description="Manage your product catalog, pricing, and inventory."
      actions={canCreate ? <Button onClick={openAddModal}><Plus className="mr-2 size-4" /> Add Product</Button> : undefined}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search products by name or SKU..." className="max-w-md" />
          <div className="flex items-center gap-2">
            <ReuseFilterSelect
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
              placeholder="All Categories"
              options={categories.map((c) => ({ label: c.parentId ? `— ${c.name}` : c.name, value: c._id }))}
            />
            {categoryFilter && (
              <Button variant="ghost" size="sm" onClick={() => setCategoryFilter("")} className="text-secondbase-color">
                <X className="mr-1 size-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={products}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        categories={categories}
        presetCategoryId={presetCategoryId}
        onSave={handleSave}
      />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this product?"
        description="It will be removed from the storefront immediately."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default ProductsPage;
