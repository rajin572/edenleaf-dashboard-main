import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Eye, Download, Edit, ShieldOff } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import { FormInput } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/Components/ui/field";
import CustomerProfileSheet from "@/Components/Dashboard/Customers/CustomerProfileSheet";
import { usePermission } from "@/hooks/usePermission";
import { formatDate } from "@/utils/dateFormet";
import { bdPhoneSchema } from "@/utils/phoneValidation";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useGetCustomersQuery, useUpdateCustomerMutation } from "@/redux/features/customer/customerApi";
import type { ICustomer } from "@/types";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
  { value: "archived", label: "Archived" },
];

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: bdPhoneSchema,
});

type EditFormValues = z.infer<typeof editSchema>;

const CustomersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [blockTarget, setBlockTarget] = useState<ICustomer | null>(null);

  const canUpdate = usePermission("customer.update");

  const { data, isFetching } = useGetCustomersQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, status: status || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const customers = data?.data.data ?? [];
  const meta = data?.data.meta;

  const [updateCustomer] = useUpdateCustomerMutation();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (editing) form.reset({ name: editing.name, phone: editing.phone ?? "" });
  }, [editing, form]);

  const onSubmitEdit = async (values: EditFormValues) => {
    if (!editing) return;
    const res = await tryCatchWrapper(
      updateCustomer,
      { params: { id: editing._id }, body: values },
      { toastLoadingMessage: "Saving customer..." }
    );
    if (res?.success) setEditing(null);
  };

  const handleToggleBlock = async (row: ICustomer) => {
    const next = row.status === "active" ? "blocked" : "active";
    const res = await tryCatchWrapper(
      updateCustomer,
      { params: { id: row._id }, body: { status: next } },
      { toastLoadingMessage: next === "blocked" ? "Blocking..." : "Activating..." }
    );
    if (res?.success) setBlockTarget(null);
  };

  const columns: Column<ICustomer>[] = [
    {
      header: "Customer Name", accessorKey: "name", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-base-color">{val}</span>
          <span className="text-xs text-text-muted">{row._id}</span>
        </div>
      ),
    },
    {
      header: "Contact", accessorKey: "phone", render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-sm">{val || "—"}</span>
          <span className="text-xs text-text-muted">{row.email}</span>
        </div>
      ),
    },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "active" ? "success" : val === "blocked" ? "error" : "warning"}>{val}</Tag> },
    { header: "Joined", accessorKey: "createdAt", render: (val) => (val ? formatDate(val) : "—") },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setViewingId(row._id)}>
            <Eye className="mr-2 size-4" /> Profile
          </Button>
          <Button variant="ghost" size="icon" title="Edit" disabled={!canUpdate} onClick={() => setEditing(row)} className="h-8 w-8 text-orange-500 bg-orange-50">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title={row.status === "active" ? "Block" : "Activate"} disabled={!canUpdate} onClick={() => setBlockTarget(row)} className="h-8 w-8 text-amber-600 bg-amber-50">
            <ShieldOff className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Customers"
      description="Manage customer accounts, view order history and lifetime value."
      actions={<Button variant="outline" onClick={() => toast.info("CSV export will be available once reporting is wired to the API.")}><Download className="mr-2 size-4" /> Export CSV</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by name, phone or email..." className="max-w-md" />
          <ReuseFilterSelect label="Status" options={statusOptions} value={status} onChange={(v) => { setStatus(v); setCurrentPage(1); }} allowClear onClear={() => setStatus("")} />
        </div>
        {isFetching ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <ReusableTable
            data={customers}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <CustomerProfileSheet open={!!viewingId} onOpenChange={(o) => !o && setViewingId(null)} customerId={viewingId} />

      <ReusableModal
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit Customer"
        description="Update the customer's name and phone number."
      >
        <form onSubmit={form.handleSubmit(onSubmitEdit)}>
          <FieldGroup>
            <FormInput control={form.control} name="name" label="Full Name" placeholder="Jane Doe" />
            <FormInput control={form.control} name="phone" label="Phone" placeholder="01700000000" />
            <Button type="submit" variant="secondary" className="w-full">Save Changes</Button>
          </FieldGroup>
        </form>
      </ReusableModal>

      <ConfirmModal
        open={!!blockTarget}
        onCancel={() => setBlockTarget(null)}
        currentRecord={blockTarget}
        onConfirm={handleToggleBlock}
        title={blockTarget?.status === "active" ? "Block this customer?" : "Activate this customer?"}
        description={
          blockTarget?.status === "active"
            ? `${blockTarget?.name} will be signed out of every active session and won't be able to sign in again until reactivated.`
            : `${blockTarget?.name} will regain access to their account.`
        }
        confirmText={blockTarget?.status === "active" ? "Block" : "Activate"}
        variant={blockTarget?.status === "active" ? "danger" : "info"}
      />
    </PageWraper>
  );
};

export default CustomersPage;
