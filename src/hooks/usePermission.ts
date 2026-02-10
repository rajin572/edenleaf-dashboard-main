import { useGetMeQuery } from "@/redux/features/auth/authApi";
import useUserData from "./useUserData";

/**
 * The access token carries only { userId, role, email } — never permissions.
 * The resolved set comes from GET /auth/me so a role change takes effect
 * without needing the user to sign in again.
 */
export const useAuthUser = () => {
  const tokenUser = useUserData();
  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !tokenUser,
  });

  const user = data?.data;

  return {
    user,
    role: user?.role?.slug ?? tokenUser?.role,
    permissions: user?.resolvedPermissions ?? [],
    isSuperAdmin: (user?.role?.slug ?? tokenUser?.role) === "super_admin",
    // First load only. Background refetches keep the previous permissions on screen:
    // gating on `isFetching` made PermissionGuard unmount the page on every refetch,
    // and the remount refetched again — an infinite request loop once /auth/me failed.
    isLoading: !!tokenUser && isLoading,
    isAuthenticated: !!tokenUser,
  };
};

/**
 * True when the signed-in user holds every permission passed.
 * super_admin implicitly holds everything, matching the backend middleware.
 */
export const usePermission = (...required: string[]) => {
  const { permissions, isSuperAdmin, isLoading } = useAuthUser();

  if (isSuperAdmin) return true;
  if (isLoading || required.length === 0) return required.length === 0;

  return required.every((perm) => permissions.includes(perm));
};

export default usePermission;
