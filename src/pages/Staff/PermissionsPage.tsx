import { useEffect, useMemo, useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { ShieldCheck } from "lucide-react";
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRoleMutation,
} from "@/redux/features/role/roleApi";
import { usePermission } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";

const PermissionsPage = () => {
  const [roleId, setRoleId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const canManage = usePermission("staff.manage_permissions");

  const { data: rolesRes, isFetching: rolesLoading } = useGetRolesQuery();
  const { data: permsRes, isFetching: permsLoading } = useGetPermissionsQuery();
  const [updateRole] = useUpdateRoleMutation();

  const roles = useMemo(() => rolesRes?.data ?? [], [rolesRes]);
  const catalog = permsRes?.data ?? {};

  const activeRole = roles.find((r) => r._id === roleId);
  // super_admin implicitly holds everything, so there is nothing to edit.
  const isSuperAdmin = activeRole?.slug === "super_admin";
  const readOnly = !canManage || isSuperAdmin;

  // Default to the first non-super-admin role once roles arrive.
  useEffect(() => {
    if (!roleId && roles.length > 0) {
      const first = roles.find((r) => r.slug !== "super_admin") ?? roles[0];
      setRoleId(first._id);
    }
  }, [roles, roleId]);

  // Re-seed the checkboxes whenever the selected role changes.
  useEffect(() => {
    setSelected(new Set(activeRole?.permissions?.map((p) => p._id) ?? []));
  }, [activeRole]);

  const toggle = (permissionId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  };

  const toggleResource = (permissionIds: string[], allOn: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      permissionIds.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const handleSave = async () => {
    if (!activeRole) return;
    await tryCatchWrapper(
      updateRole,
      { params: { id: activeRole._id }, body: { permissions: Array.from(selected) } },
      { toastLoadingMessage: "Saving permissions..." }
    );
  };

  const resources = Object.keys(catalog).sort();
  const isLoading = rolesLoading || permsLoading;

  return (
    <PageWraper
      title="Permissions"
      description="Grant or revoke permissions per role. The backend enforces the same set independently."
      actions={
        <Button
          onClick={handleSave}
          disabled={readOnly}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <ShieldCheck className="mr-2 size-4" /> Save Permissions
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <ReuseFilterSelect
          label="Role"
          className="min-w-64"
          options={roles.map((r) => ({ value: r._id, label: r.name }))}
          value={roleId}
          onChange={setRoleId}
          placeholder="Select a role"
        />
      </div>

      {isSuperAdmin && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The super admin role implicitly holds every permission and cannot be edited.
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-3 pr-4 font-semibold w-48">Resource</th>
                  <th className="py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => {
                  const perms = catalog[resource] ?? [];
                  const ids = perms.map((p) => p._id);
                  const allOn = ids.length > 0 && ids.every((id) => selected.has(id));

                  return (
                    <tr key={resource} className="border-b border-gray-50 align-top">
                      <td className="py-4 pr-4">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => toggleResource(ids, allOn)}
                          className="font-semibold capitalize text-left hover:text-primary disabled:hover:text-inherit disabled:cursor-not-allowed"
                          title={readOnly ? "" : allOn ? "Clear all" : "Select all"}
                        >
                          {resource.replace(/_/g, " ")}
                        </button>
                        <div className="text-xs text-gray-400">
                          {ids.filter((id) => selected.has(id)).length}/{ids.length}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                          {perms.map((perm) => {
                            const action = perm.action.split(".")[1] ?? perm.action;
                            return (
                              <label
                                key={perm._id}
                                className={`flex items-center gap-2 ${
                                  readOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                                }`}
                              >
                                <Checkbox
                                  checked={isSuperAdmin ? true : selected.has(perm._id)}
                                  disabled={readOnly}
                                  onCheckedChange={() => toggle(perm._id)}
                                />
                                <span className="capitalize">{action.replace(/_/g, " ")}</span>
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWraper>
  );
};

export default PermissionsPage;
