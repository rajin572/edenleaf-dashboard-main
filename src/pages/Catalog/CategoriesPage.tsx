import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, FolderPlus, PackagePlus, ChevronDown, ChevronRight, Folder, CornerDownRight } from "lucide-react";
import CategoryFormModal from "@/Components/Dashboard/Website/CategoryFormModal";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import type { ICategory, ICategoryFormValues } from "@/types";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/features/category/categoryApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { usePermission } from "@/hooks/usePermission";

type Row = ICategory & { depth: number; hasChildren: boolean };

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICategory | null>(null);
  const [presetParentId, setPresetParentId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ICategory | null>(null);

  const canCreate = usePermission("category.create");
  const canUpdate = usePermission("category.update");
  const canDelete = usePermission("category.delete");

  // Categories are a small, admin-curated list — one page covers the whole
  // tree so parent/child rows never straddle a page boundary.
  const { data, isFetching } = useGetCategoriesQuery(
    { page: 1, limit: 100, searchTerm: search || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const categories = data?.data.data ?? [];

  // Categories are a small, admin-curated list, so one broad batch of
  // products (same {limit: 100} compromise ManualOrdersPage/CombosPage use
  // for their own product pickers) is enough to count real products per
  // category without an N+1 query per row.
  const { data: productsRes } = useGetProductsQuery({ limit: 100 });
  const products = productsRes?.data.data ?? [];

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    setExpanded(new Set(categories.filter((c) => c.parentId === null).map((c) => c._id)));
    // Only re-seed which roots are expanded once, when the data first arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const productCount = (categoryId: string) => products.filter((p) => p.categoryId === categoryId).length;

  const openAddModal = () => {
    setEditing(null);
    setPresetParentId(null);
    setModalOpen(true);
  };

  const openAddSubcategoryModal = (parent: ICategory) => {
    setEditing(null);
    setPresetParentId(parent._id);
    setModalOpen(true);
  };

  const openEditModal = (category: ICategory) => {
    setEditing(category);
    setPresetParentId(null);
    setModalOpen(true);
  };

  const goAddProduct = (category: ICategory) => {
    navigate("/admin/products", { state: { openCreateFor: category._id } });
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async (values: ICategoryFormValues, image?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    if (image) formData.append("image", image);

    const result = editing
      ? await tryCatchWrapper(updateCategory, { body: formData, params: { id: editing._id } }, { toastLoadingMessage: "Saving category..." })
      : await tryCatchWrapper(createCategory, { body: formData }, { toastLoadingMessage: values.parentId ? "Creating sub-category..." : "Creating category..." });

    if (result?.success) {
      if (values.parentId) setExpanded((prev) => new Set(prev).add(values.parentId as string));
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const result = await tryCatchWrapper(deleteCategory, { params: { id: deleting._id } }, { toastLoadingMessage: "Deleting category..." });
    if (result?.success) setDeleting(null);
  };

  const rows = useMemo<Row[]>(() => {
    const term = search.trim().toLowerCase();
    const roots = categories
      .filter((c) => c.parentId === null)
      .filter((c) => !term || c.name.toLowerCase().includes(term) || categories.some((s) => s.parentId === c._id && s.name.toLowerCase().includes(term)))
      .sort((a, b) => a.order - b.order);

    const result: Row[] = [];
    for (const root of roots) {
      const children = categories
        .filter((c) => c.parentId === root._id)
        .filter((c) => !term || c.name.toLowerCase().includes(term) || root.name.toLowerCase().includes(term))
        .sort((a, b) => a.order - b.order);
      result.push({ ...root, depth: 0, hasChildren: children.length > 0 });
      if (expanded.has(root._id) || term) {
        for (const child of children) result.push({ ...child, depth: 1, hasChildren: false });
      }
    }
    return result;
  }, [categories, expanded, search]);

  const columns: Column<Row>[] = [
    {
      header: "Category Name",
      accessorKey: "name",
      width: 300,
      render: (val, row) => (
        <div className="flex items-center gap-1.5" style={{ paddingLeft: row.depth * 24 }}>
          {row.depth === 0 && row.hasChildren ? (
            <button type="button" onClick={() => toggleExpanded(row._id)} className="text-secondbase-color hover:text-base-color">
              {expanded.has(row._id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          ) : row.depth === 0 ? (
            <span className="w-4" />
          ) : (
            <CornerDownRight className="size-3.5 text-secondbase-color" />
          )}
          {row.depth === 0 ? <Folder className="size-4 text-secondary-color" /> : null}
          <span className={row.depth === 0 ? "font-bold" : "font-medium text-sm"}>{val}</span>
        </div>
      ),
    },
    { header: "Slug", accessorKey: "slug", render: (val) => <span className="text-secondbase-color">/{val}</span> },
    {
      header: "Products",
      accessorKey: "_id",
      render: (_, row) => {
        const count = productCount(row._id);
        return (
          <button
            type="button"
            onClick={() => navigate("/admin/products", { state: { filterCategoryId: row._id } })}
            className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
          >
            {count} product{count === 1 ? "" : "s"}
          </button>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (val) => {
        const status = val as ICategory["status"];
        if (status === "archived") return <Tag theme="warning">Archived</Tag>;
        return <Tag theme={status === "active" ? "success" : "error"}>{status === "active" ? "Active" : "Inactive"}</Tag>;
      },
    },
    {
      header: "Actions",
      accessorKey: "_id",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-color bg-secondary-color/10" title="Add product here" onClick={() => goAddProduct(row)}>
            <PackagePlus className="size-4" />
          </Button>
          {row.depth === 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 bg-purple-50" title="Add sub-category" disabled={!canCreate} onClick={() => openAddSubcategoryModal(row)}>
              <FolderPlus className="size-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50" disabled={!canUpdate} onClick={() => openEditModal(row)}>
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" disabled={!canDelete} onClick={() => setDeleting(row)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Categories"
      description="Organize products into categories and sub-categories. Products can be added directly under a category or under one of its sub-categories."
      actions={
        canCreate ? (
          <Button onClick={openAddModal}>
            <Plus className="mr-2 size-4" /> Create Category
          </Button>
        ) : undefined
      }
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search categories or sub-categories..." setSearch={setSearch} setPage={setCurrentPage} />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={rows}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={20}
            total={rows.length}
          />
        )}
      </div>

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        presetParentId={presetParentId}
        parentOptions={categories.filter((c) => c.parentId === null)}
        onSave={handleSave}
      />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this category?"
        description="Its sub-categories will be removed too. Existing products keep their historical data."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default CategoriesPage;
