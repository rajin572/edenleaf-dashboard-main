"use client";
import AuthLayout from "@/Components/Shared/AuthLayout";
import { Button } from "@/Components/ui/button";
import { FormPassword } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldError, FieldGroup } from "@/Components/ui/field";
import useUserData from "@/hooks/useUserData";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { getBrandCookie, removeBrandCookie } from "@/utils/brandCookies";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdPassword } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";


const changePassSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
});

const UpdatePassword = () => {
    const form = useForm({
        resolver: zodResolver(changePassSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });


    const { watch } = form;
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    // Show error if passwords don't match
    const confirmPasswordError = password !== confirmPassword;

    const router = useNavigate();
    const userExist = useUserData();
    const [resetPassword] = useResetPasswordMutation();

    useEffect(() => {
        if (userExist?.role === "admin") {
            router("/", { replace: true });
        }
    }, [router, userExist]);

    const onFinish = async (_data: z.infer<typeof changePassSchema>) => {
        if (_data.password !== _data.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        const resetToken = getBrandCookie("forgetOtpMatchToken");
        if (!resetToken) {
            toast.error("Your reset session expired. Please start again.");
            router("/forgot-password");
            return;
        }

        const res = await tryCatchWrapper(
            resetPassword,
            { body: { resetToken, newPassword: _data.password } },
            { toastLoadingMessage: "Resetting password..." }
        );

        if (res?.success) {
            form.reset();
            removeBrandCookie("forgetOtpMatchToken");
            removeBrandCookie("forgetEmail");
            router("/sign-in");
        }
    };
    return (
        <AuthLayout
            subtitle="Reset your password"
            cardTitle="Reset password"
            cardDescription="Choose a strong password to protect your account."
        >
            <form onSubmit={form.handleSubmit(onFinish)}>
                <FieldGroup>
                    <FormPassword
                        prefix={<MdPassword size={18} />}
                        control={form.control}
                        name="password"
                        label="New Password"
                        placeholder="Enter your password"
                        inputClassName="bg-primary-color! border-base-color/30!"
                    />
                    <FormPassword
                        prefix={<MdPassword size={18} />}
                        control={form.control}
                        name="confirmPassword"
                        label="Confirm New Password"
                        placeholder="Enter your password"
                        inputClassName="bg-primary-color! border-base-color/30!"
                    />
                    {confirmPasswordError && (
                        <FieldError errors={[{ message: "Passwords don't match" }]} />
                    )}
                    <Button variant="secondary" className="w-full" type="submit">
                        Reset Password
                    </Button>
                </FieldGroup>
            </form>

            <Link
                to="/sign-in"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-base-color transition-colors mt-6"
            >
                <FaArrowLeftLong className="size-3.5" />
                Back to Login
            </Link>
        </AuthLayout>
    );
};
export default UpdatePassword;
