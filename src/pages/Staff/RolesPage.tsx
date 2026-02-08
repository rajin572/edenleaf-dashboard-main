import { useEffect, useMemo, useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { FormInput, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/Components/ui/field";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type { IRole } from "@/types";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { usePermission } from "@/hooks/usePermission";
import { adminRoutes } from "@/Routes/admin.route";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} from "@/redux/features/role/roleApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const RolesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  /**
   * The permission catalog is keyed by raw backend resource (e.g. "brand"),
   * which includes resources with no wired sidebar page yet and says nothing
   * about which actual nav item(s) a resource gates. Walk the real sidebar
   * config instead, so the "Page Permissions" grid only shows — and labels
   * with — pages that actually exist in the nav, in the same order they
   * appear there. Multiple nav items can share one resource (e.g. Product,
   * Featured Product, New Arrivals and Reviews all gate on "product.view"),
   * so a resource's label lists every page it controls.
   *
   * Computed lazily (not at module scope) because admin.route.tsx imports
   * this page, which imports adminRoutes back from admin.route.tsx — reading
   * it at module-load time hits the circular import before it's initialized.
   */
  const { sidebarResourceOrder, sidebarResourcePages } = useMemo(() => {
    const order: string[] = [];
    const pagesByResource = new Map<string, string[]>();
    adminRoutes.forEach((group) => {
      group.items.forEach((item) => {
        const permission = (item as { permission?: string }).permission;
        if (!permission) return;
        const resource = permission.split(".")[0];
        if (!pagesByResource.has(resource)) {
          pagesByResource.set(resource, []);
          order.push(resource);
        }
        const pages = pagesByResource.get(resource)!;
        if (!pages.includes(item.title)) pages.push(item.title);
      });
    });
    return { sidebarResourceOrder: order, sidebarResourcePages: pagesByResource };
  }, []);

  const canManage = usePermission("staff.manage_roles");

  const { data: rolesRes, isFetching } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: true });
  const roles = rolesRes?.data ?? [];

  const { data: permsRes } = useGetPermissionsQuery();
  const catalog = permsRes?.data ?? {};

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    form.reset(editing ? { name: editing.name, description: editing.description ?? "" } : { name: "", description: "" });
    setSelectedPermissions(new Set(editing?.permissions.map((p) => p._id) ?? []));
  }, [editing, form]);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onSubmit = async (values: RoleFormValues) => {
    if (editing) {
      // System roles can't be renamed — the name input is disabled for them, but
      // still submits its unchanged value. Only send `name` when it actually
      // changed, or the backend rejects the whole update with 403.
      const body = {
        ...(values.name !== editing.name ? { name: values.name } : {}),
        description: values.description,
        permissions: Array.from(selectedPermissions),
      };
      const res = await tryCatchWrapper(updateRole, { params: { id: editing._id }, body }, { toastLoadingMessage: "Updating role..." });
      if (res?.success) setModalOpen(false);
      return;
    }

    const body = { name: values.name, description: values.description, permissions: Array.from(selectedPermissions) };
    const res = await tryCatchWrapper(createRole, { body }, { toastLoadingMessage: "Creating role..." });
    if (res?.success) setModalOpen(false);
  };

  const handleDelete = async (row: IRole) => {
    const res = await tryCatchWrapper(deleteRole, { params: { id: row._id } }, { toastLoadingMessage: "Deleting role..." });
    if (res?.success) setDeleteTarget(null);
  };

  const columns: Column<IRole>[] = [
    {
      header: "Role", accessorKey: "name", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">{val}</span>
          <span className="text-xs text-gray-500">{row.slug}</span>
        </div>
      ),
    },
    { header: "Description", accessorKey: "description", render: (val) => (val as string) || <span className="text-gray-400">—</span> },
    { header: "Permissions", accessorKey: "permissions", render: (_val, row) => (row.slug === "super_admin" ? <span className="font-semibold">All</span> : <span className="font-semibold">{row.permissions?.length ?? 0}</span>) },
    { header: "Type", accessorKey: "isSystem", render: (val) => <Tag theme={val ? "blue" : "success"}>{val ? "System" : "Custom"}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_val, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title={row.slug === "super_admin" ? "Super admin cannot be edited" : "Edit"} disabled={!canManage || row.slug === "super_admin"} onClick={() => { setEditing(row); setModalOpen(true); }} className="h-8 w-8 text-orange-500 bg-orange-50">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title={row.isSystem ? "System roles cannot be deleted" : "Delete"} disabled={!canManage || row.isSystem} onClick={() => setDeleteTarget(row)} className="h-8 w-8 text-red-500 bg-red-50 disabled:opacity-40">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Roles & Permissions"
      description="Create roles and choose exactly which pages each one can access. System roles are seeded and cannot be deleted."
      actions={canManage ? <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-primary hover:bg-primary-dark text-white"><Plus className="mr-2 size-4" /> Add Role</Button> : undefined}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable data={roles} columns={columns} />
        )}
      </div>

      <ReusableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Role" : "Add Role"}
        description={editing?.isSystem ? "System roles cannot be renamed, but you can still adjust their permissions." : "Name the role and choose which pages it can access."}
        maxWidth="sm:max-w-[600px]"
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput control={form.control} name="name" label="Role Name" placeholder="Order Manager" disabled={!!editing?.isSystem} />
            <FormTextarea control={form.control} name="description" label="Description" />

            <div>
              <p className="text-sm font-medium mb-2">Page Permissions</p>
              <div className="space-y-3 rounded-lg border border-border p-3 max-h-64 overflow-y-auto">
                {sidebarResourceOrder
                  .filter((resource) => catalog[resource]?.length)
                  .map((resource) => {
                    const perms = catalog[resource];
                    const pages = sidebarResourcePages.get(resource) ?? [];
                    return (
                      <div key={resource}>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">
                          {pages.join(" / ")}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {perms.map((perm) => {
                            const action = perm.action.split(".")[1] ?? perm.action;
                            return (
                              <label key={perm._id} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                                <Checkbox checked={selectedPermissions.has(perm._id)} onCheckedChange={() => togglePermission(perm._id)} />
                                {action.replace(/_/g, " ")}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <Button type="submit" variant="secondary" className="w-full">{editing ? "Save Changes" : "Create Role"}</Button>
          </FieldGroup>
        </form>
      </ReusableModal>

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        currentRecord={deleteTarget}
        onConfirm={handleDelete}
        title="Delete role"
        description={`Delete the "${deleteTarget?.name}" role. Staff assigned to it will need a new role.`}
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default RolesPage;
