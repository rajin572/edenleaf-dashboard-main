import { useEffect } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { FormInput, FormPassword } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { useUpdateMeMutation } from "@/redux/features/user/userApi";
import { useAuthUser } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { toast } from "sonner";
import { formatDateTime } from "@/utils/dateFormet";
import { bdPhoneOptionalSchema } from "@/utils/phoneValidation";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: bdPhoneOptionalSchema,
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ProfilePage = () => {
  const { user, isLoading } = useAuthUser();

  const [updateMe] = useUpdateMeMutation();
  const [changePassword] = useChangePasswordMutation();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, phone: user.phone ?? "" });
    }
  }, [user, profileForm]);

  const onSaveProfile = async (values: z.infer<typeof profileSchema>) => {
    await tryCatchWrapper(updateMe, { body: values }, { toastLoadingMessage: "Saving profile..." });
  };

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    const res = await tryCatchWrapper(
      changePassword,
      { body: { oldPassword: values.oldPassword, newPassword: values.newPassword } },
      { toastLoadingMessage: "Updating password..." }
    );

    if (res?.success) {
      passwordForm.reset();
      toast.success("Password updated. Use it the next time you sign in.");
    }
  };

  if (isLoading) {
    return (
      <PageWraper title="My Profile" description="Manage your own account.">
        <div className="py-32 flex justify-center">
          <SpinLoader />
        </div>
      </PageWraper>
    );
  }

  return (
    <PageWraper title="My Profile" description="Manage your own account and password.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="font-bold text-base-color">Account</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>{user?.email}</span>
              <Tag theme="blue">{user?.role?.name ?? "—"}</Tag>
              <Tag theme={user?.status === "active" ? "success" : "error"}>
                {user?.status ?? "—"}
              </Tag>
            </div>
            {user?.lastLoginAt && (
              <p className="mt-2 text-xs text-gray-400">
                Last signed in {formatDateTime(user.lastLoginAt)}
              </p>
            )}
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)}>
            <FieldGroup>
              <FormInput control={profileForm.control} name="name" label="Full Name" />
              <FormInput control={profileForm.control} name="phone" label="Phone" />
              <Button type="submit" variant="secondary" className="w-full">
                Save Profile
              </Button>
            </FieldGroup>
          </form>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-base-color mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
            <FieldGroup>
              <FormPassword
                control={passwordForm.control}
                name="oldPassword"
                label="Current Password"
                placeholder="••••••••"
              />
              <FormPassword
                control={passwordForm.control}
                name="newPassword"
                label="New Password"
                placeholder="••••••••"
              />
              <FormPassword
                control={passwordForm.control}
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="••••••••"
              />
              <Button type="submit" variant="secondary" className="w-full">
                Update Password
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </PageWraper>
  );
};

export default ProfilePage;
