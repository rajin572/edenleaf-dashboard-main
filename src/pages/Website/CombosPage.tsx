import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import ComboFormModal from "@/Components/Dashboard/Website/ComboFormModal";
import { usePermission } from "@/hooks/usePermission";
import { formatMoney } from "@/utils/money";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetCombosQuery,
  useCreateComboMutation,
  useUpdateComboMutation,
  useDeleteComboMutation,
} from "@/redux/features/combo/comboApi";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import type { ICombo, IComboFormValues } from "@/types";

const CombosPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICombo | null>(null);
  const [deleting, setDeleting] = useState<ICombo | null>(null);

  const canCreate = usePermission("combo.create");
  const canUpdate = usePermission("combo.update");
  const canDelete = usePermission("combo.delete");

  const { data, isFetching } = useGetCombosQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const combos = data?.data.data ?? [];
  const meta = data?.data.meta;

  // Feeds the combo builder's product/variant picker.
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 100, status: "published" });
  const products = productsData?.data.data ?? [];

  const [createCombo] = useCreateComboMutation();
  const [updateCombo] = useUpdateComboMutation();
  const [deleteCombo] = useDeleteComboMutation();

  const openAddModal = () => { setEditing(null); setModalOpen(true); };
  const openEditModal = (combo: ICombo) => { setEditing(combo); setModalOpen(true); };

  const handleSave = async (values: IComboFormValues, image?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    if (image) formData.append("image", image);
    const result = editing
      ? await tryCatchWrapper(updateCombo, { body: formData, params: { id: editing._id } }, { toastLoadingMessage: "Saving combo..." })
      : await tryCatchWrapper(createCombo, { body: formData }, { toastLoadingMessage: "Creating combo..." });
    if (result?.success) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await tryCatchWrapper(deleteCombo, { params: { id: deleting._id } }, { toastLoadingMessage: "Deleting combo..." });
    if (res?.success) setDeleting(null);
  };

  const columns: Column<ICombo>[] = [
    {
      header: "Combo Name", accessorKey: "name", render: (val, row) => (
        <div>
          <p className="font-bold">{val}</p>
          <p className="text-xs text-secondbase-color max-w-xs truncate">
            {row.components.map((c) => c.product.name).join(", ")}
          </p>
        </div>
      ),
    },
    { header: "Components", accessorKey: "components", render: (val) => val.length },
    { header: "Combo Price", accessorKey: "comboPriceInPoisha", render: (val) => formatMoney(val) },
    {
      header: "Regular Price", accessorKey: "regularPriceInPoisha", render: (val) => (
        <span className="line-through text-secondbase-color">{formatMoney(val)}</span>
      ),
    },
    {
      header: "Status", accessorKey: "status", render: (val, row) => (
        <div className="flex flex-col gap-1">
          <Tag theme={val === "active" ? "success" : val === "archived" ? "error" : "warning"}>
            {val === "active" ? "Active" : val === "archived" ? "Archived" : "Inactive"}
          </Tag>
          {!row.available && <Tag theme="error">Unavailable</Tag>}
        </div>
      ),
    },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          {canUpdate && row.status !== "archived" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50" onClick={() => openEditModal(row)}>
              <Edit className="size-4" />
            </Button>
          )}
          {canDelete && row.status !== "archived" && (
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
      title="Combo Offers"
      description="Bundle product variants together at a discounted combo price."
      actions={canCreate ? <Button onClick={openAddModal}><Plus className="mr-2 size-4" /> Create Combo</Button> : undefined}
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search combos..." setSearch={setSearch} setPage={setCurrentPage} />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={combos}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <ComboFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} products={products} onSave={handleSave} />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this combo?"
        description="It will be removed from the storefront immediately."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default CombosPage;
