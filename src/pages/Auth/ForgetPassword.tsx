"use client";
import AuthLayout from "@/Components/Shared/AuthLayout";
import { Button } from "@/Components/ui/button";
import { FormInput } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/Components/ui/field";
import useUserData from "@/hooks/useUserData";
import { useForgetPasswordMutation } from "@/redux/features/auth/authApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBrandCookie, removeBrandCookie } from "@/utils/brandCookies";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";


const forgetPassSchema = z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
});

const ForgotPassword = () => {
    const form = useForm({
        resolver: zodResolver(forgetPassSchema),
        defaultValues: {
            email: "",
        },
    });

    const router = useNavigate();
    const userExist = useUserData();
    const [forgetPassword] = useForgetPasswordMutation();

    useEffect(() => {
        if (userExist?.role === "admin") {
            router("/", { replace: true });
        }
    }, [router, userExist]);

    const onFinish = async (_data: z.infer<typeof forgetPassSchema>) => {
        const res = await tryCatchWrapper(
            forgetPassword,
            { body: _data },
            { toastLoadingMessage: "Sending OTP..." }
        );

        if (res?.success) {
            form.reset();
            // Clear any stale reset token, then carry the email to the OTP step —
            // /auth/verify-forgot-otp needs it alongside the code.
            removeBrandCookie("forgetOtpMatchToken");
            setBrandCookie("forgetEmail", JSON.stringify(_data.email), {
                path: "/",
                expires: 1,
            });
            router("/forgot-password/otp-verify");
        }
    };
    return (
        <AuthLayout
            subtitle="Reset your password"
            cardTitle="Forgot Password?"
            cardDescription="Enter your email address and we will send you a verification code"
        >
            <form onSubmit={form.handleSubmit(onFinish)}>
                <FieldGroup>
                    <FormInput
                        prefix={<MdOutlineEmail size={18} />}
                        control={form.control}
                        name="email"
                        label="Email Address"
                        placeholder="admin@dashboard.com"
                        inputClassName="bg-primary-color! border-base-color/30!"
                    />
                    <Button variant="secondary" className="w-full" type="submit">
                        Send OTP Code
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
export default ForgotPassword;
