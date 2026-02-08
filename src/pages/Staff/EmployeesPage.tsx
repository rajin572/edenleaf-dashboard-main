import { useEffect, useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import { FormInput, FormPassword, FormSelect } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { SelectItem } from "@/Components/ui/select";
import { FieldGroup } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, LogOut, ShieldOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { formatDate } from "@/utils/dateFormet";
import { bdPhoneSchema } from "@/utils/phoneValidation";
import type { IStaffListItem } from "@/types";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { usePermission } from "@/hooks/usePermission";
import {
  useGetStaffsQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffRoleMutation,
  useForceLogoutStaffMutation,
} from "@/redux/features/staff/staffApi";
import { useGetRolesQuery } from "@/redux/features/role/roleApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  phone: bdPhoneSchema,
  role: z.string().min(1, "Role is required"),
  password: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

const EmployeesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IStaffListItem | null>(null);
  const [logoutTarget, setLogoutTarget] = useState<IStaffListItem | null>(null);
  const [blockTarget, setBlockTarget] = useState<IStaffListItem | null>(null);

  const canCreate = usePermission("staff.create");
  const canUpdate = usePermission("staff.update");

  const { data: staffRes, isFetching } = useGetStaffsQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, status: status || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const staffs = staffRes?.data?.data ?? [];
  const meta = staffRes?.data?.meta;

  const { data: rolesRes } = useGetRolesQuery();
  const roles = rolesRes?.data ?? [];

  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [updateStaffRole] = useUpdateStaffRoleMutation();
  const [forceLogoutStaff] = useForceLogoutStaffMutation();
  const [updateStaffStatus] = useUpdateStaffStatusMutation();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", email: "", phone: "", role: "", password: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name, email: editing.email, phone: editing.phone ?? "", role: editing.role?._id ?? "", password: "" });
    } else {
      form.reset({ name: "", email: "", phone: "", role: "", password: "" });
    }
  }, [editing, form]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: IStaffListItem) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onSubmit = async (values: StaffFormValues) => {
    if (editing) {
      const res = await tryCatchWrapper(
        updateStaff,
        {
          params: { id: editing._id },
          body: { name: values.name, phone: values.phone, ...(values.password ? { password: values.password } : {}) },
        },
        { toastLoadingMessage: "Updating staff member..." }
      );
      if (!res?.success) return;

      if (values.role !== editing.role._id) {
        await tryCatchWrapper(
          updateStaffRole,
          { params: { id: editing._id }, body: { role: values.role } },
          { toastLoadingMessage: "Updating role..." }
        );
      }
      setModalOpen(false);
      return;
    }

    if (!values.password) {
      form.setError("password", { message: "Password is required for a new staff member" });
      return;
    }

    const res = await tryCatchWrapper(
      createStaff,
      { body: { name: values.name, email: values.email, phone: values.phone, password: values.password, role: values.role } },
      { toastLoadingMessage: "Creating staff account..." }
    );
    if (res?.success) setModalOpen(false);
  };

  const handleForceLogout = async (row: IStaffListItem) => {
    const res = await tryCatchWrapper(
      forceLogoutStaff,
      { params: { id: row._id } },
      { toastLoadingMessage: "Revoking sessions..." }
    );
    if (res?.success) setLogoutTarget(null);
  };

  const handleToggleBlock = async (row: IStaffListItem) => {
    const next = row.status === "active" ? "blocked" : "active";
    const res = await tryCatchWrapper(
      updateStaffStatus,
      { params: { id: row._id }, body: { status: next } },
      { toastLoadingMessage: next === "blocked" ? "Blocking..." : "Activating..." }
    );
    if (res?.success) setBlockTarget(null);
  };

  const columns: Column<IStaffListItem>[] = [
    {
      header: "Staff Member", accessorKey: "name", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">{val}</span>
          <span className="text-xs text-gray-500">{row.email}</span>
        </div>
      ),
    },
    { header: "Role", accessorKey: "role", render: (_val, row) => <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">{row.role?.name ?? "—"}</span> },
    { header: "Last Login", accessorKey: "lastLoginAt", render: (val) => (val ? formatDate(val as string) : "Never") },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "active" ? "success" : "error"}>{val as string}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_val, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Edit" disabled={!canUpdate} onClick={() => openEdit(row)} className="h-8 w-8 text-orange-500 bg-orange-50">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title={row.status === "active" ? "Block" : "Activate"} disabled={!canUpdate || row.role.slug === "super_admin"} onClick={() => setBlockTarget(row)} className="h-8 w-8 text-amber-600 bg-amber-50">
            <ShieldOff className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Force logout" disabled={!canUpdate} onClick={() => setLogoutTarget(row)} className="h-8 w-8 text-red-500 bg-red-50">
            <LogOut className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Admins"
      description="Manage admin & staff accounts and assign them a role."
      actions={canCreate ? <Button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white"><Plus className="mr-2 size-4" /> Add Admin</Button> : undefined}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <ReuseSearchInput className="min-w-64" placeholder="Search staff..." setSearch={setSearch} setPage={setCurrentPage} />
        <ReuseFilterSelect label="Status" options={statusOptions} value={status} onChange={setStatus} allowClear onClear={() => setStatus("")} />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable data={staffs} columns={columns} pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={10} total={meta?.total ?? 0} />
        )}
      </div>

      <ReusableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Admin" : "Add Admin"}
        description={editing ? "Update the staff member's details and role." : "Create a staff account and assign a role."}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput control={form.control} name="name" label="Full Name" placeholder="Jane Doe" />
            <FormInput control={form.control} name="email" label="Email Address" placeholder="name@example.com" disabled={!!editing} />
            <FormInput control={form.control} name="phone" label="Phone" placeholder="01700000000" />
            <FormSelect control={form.control} name="role" label="Role" placeholder="Select a role">
              {roles.map((role) => (
                <SelectItem key={role._id} value={role._id}>{role.name}</SelectItem>
              ))}
            </FormSelect>
            <FormPassword control={form.control} name="password" label={editing ? "New Password (leave blank to keep current)" : "Password"} placeholder="••••••••" />
            <Button type="submit" variant="secondary" className="w-full">{editing ? "Save Changes" : "Create Staff"}</Button>
          </FieldGroup>
        </form>
      </ReusableModal>

      <ConfirmModal
        open={!!logoutTarget}
        onCancel={() => setLogoutTarget(null)}
        currentRecord={logoutTarget}
        onConfirm={handleForceLogout}
        title="Force logout"
        description={`Revoke every active session for ${logoutTarget?.name}. They will need to sign in again.`}
        confirmText="Force logout"
        variant="danger"
      />

      <ConfirmModal
        open={!!blockTarget}
        onCancel={() => setBlockTarget(null)}
        currentRecord={blockTarget}
        onConfirm={handleToggleBlock}
        title={blockTarget?.status === "active" ? "Block staff member" : "Activate staff member"}
        description={blockTarget?.status === "active" ? `${blockTarget?.name} will no longer be able to sign in.` : `${blockTarget?.name} will regain access to the dashboard.`}
        confirmText={blockTarget?.status === "active" ? "Block" : "Activate"}
        variant={blockTarget?.status === "active" ? "danger" : "info"}
      />
    </PageWraper>
  );
};

export default EmployeesPage;
