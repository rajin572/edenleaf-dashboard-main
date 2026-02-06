import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, ShieldCheck, Ban } from "lucide-react";
import BlockedContactFormModal from "@/Components/Dashboard/Customers/BlockedContactFormModal";
import { usePermission } from "@/hooks/usePermission";
import { formatDate } from "@/utils/dateFormet";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetBlockedContactsQuery,
  useCreateBlockedContactMutation,
  useUpdateBlockedContactMutation,
  useDeactivateBlockedContactMutation,
} from "@/redux/features/blockedContact/blockedContactApi";
import type { IBlockedContact, IBlockedContactFormValues } from "@/types";

const statusOptions = [
  { value: "true", label: "Blocked" },
  { value: "false", label: "Inactive" },
];

const BlocklistPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IBlockedContact | null>(null);
  const [toggleTarget, setToggleTarget] = useState<IBlockedContact | null>(null);

  const canManage = usePermission("customer.block");

  const { data, isFetching } = useGetBlockedContactsQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, active: activeFilter || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const contacts = data?.data.data ?? [];
  const meta = data?.data.meta;

  const [createBlockedContact] = useCreateBlockedContactMutation();
  const [updateBlockedContact] = useUpdateBlockedContactMutation();
  const [deactivateBlockedContact] = useDeactivateBlockedContactMutation();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: IBlockedContact) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSave = async (values: IBlockedContactFormValues) => {
    if (editing) {
      await tryCatchWrapper(updateBlockedContact, { params: { id: editing._id }, body: values }, { toastLoadingMessage: "Saving..." });
      return;
    }
    await tryCatchWrapper(createBlockedContact, { body: values }, { toastLoadingMessage: "Blocking number..." });
  };

  const handleToggleActive = async (row: IBlockedContact) => {
    const res = row.active
      ? await tryCatchWrapper(deactivateBlockedContact, { params: { id: row._id } }, { toastLoadingMessage: "Deactivating block..." })
      : await tryCatchWrapper(updateBlockedContact, { params: { id: row._id }, body: { active: true } }, { toastLoadingMessage: "Reactivating block..." });
    if (res?.success) setToggleTarget(null);
  };

  const columns: Column<IBlockedContact>[] = [
    { header: "Phone", accessorKey: "phone", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Reason", accessorKey: "reason", width: 300, render: (val) => <span className="text-sm line-clamp-2">{val}</span> },
    // An active block is the "bad for the customer" state, so it reads as
    // error/red — inverted from how "Active" usually reads for an account.
    { header: "Status", accessorKey: "active", render: (val) => <Tag theme={val ? "error" : "success"}>{val ? "Blocked" : "Inactive"}</Tag> },
    { header: "Created By", accessorKey: "createdBy", render: (_val, row) => row.createdBy?.name ?? "—" },
    { header: "Created", accessorKey: "createdAt", render: (val) => formatDate(val) },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Edit" disabled={!canManage} onClick={() => openEdit(row)} className="h-8 w-8 text-orange-500 bg-orange-50">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={row.active ? "Deactivate" : "Reactivate"}
            disabled={!canManage}
            onClick={() => setToggleTarget(row)}
            className={row.active ? "h-8 w-8 text-success bg-success/10" : "h-8 w-8 text-error bg-error/10"}
          >
            {row.active ? <ShieldCheck className="size-4" /> : <Ban className="size-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Blocklist"
      description="Phone numbers blocked from placing new orders."
      actions={canManage ? <Button onClick={openCreate}><Plus className="mr-2 size-4" /> Block a Number</Button> : undefined}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by phone..." className="max-w-md" />
          <ReuseFilterSelect label="Status" options={statusOptions} value={activeFilter} onChange={(v) => { setActiveFilter(v); setCurrentPage(1); }} allowClear onClear={() => setActiveFilter("")} />
        </div>
        {isFetching ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <ReusableTable
            data={contacts}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <BlockedContactFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />

      <ConfirmModal
        open={!!toggleTarget}
        onCancel={() => setToggleTarget(null)}
        currentRecord={toggleTarget}
        onConfirm={handleToggleActive}
        title={toggleTarget?.active ? "Deactivate this block?" : "Reactivate this block?"}
        description={
          toggleTarget?.active
            ? `${toggleTarget?.phone} will be able to place orders again.`
            : `${toggleTarget?.phone} will be rejected at checkout again.`
        }
        confirmText={toggleTarget?.active ? "Deactivate" : "Reactivate"}
        variant={toggleTarget?.active ? "info" : "danger"}
      />
    </PageWraper>
  );
};

export default BlocklistPage;
