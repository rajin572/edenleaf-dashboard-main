"use client";
import { useState } from "react";
import OTPInput from "react-otp-input";
import { Link, useNavigate } from "react-router-dom";
import { getBrandCookie, setBrandCookie } from "@/utils/brandCookies";
import AuthLayout from "@/Components/Shared/AuthLayout";
import { Button } from "@/Components/ui/button";
import {
  useVerifyForgotOtpMutation,
  useResendOtpMutation,
} from "@/redux/features/auth/authApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { toast } from "sonner";

// The backend issues 6-digit codes (auth.service generateOtp).
const OTP_LENGTH = 6;

const OTPVerify = () => {
  const router = useNavigate();
  const [otp, setOtp] = useState("");

  const forgottenEmail: string =
    JSON.parse(getBrandCookie("forgetEmail") || "null") ?? "";

  const [otpMatch] = useVerifyForgotOtpMutation();
  const [resendOtp] = useResendOtpMutation();

  const handleOTPSubmit = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter the full ${OTP_LENGTH}-digit code.`);
      return;
    }

    if (!forgottenEmail) {
      toast.error("Your reset session expired. Please start again.");
      router("/forgot-password");
      return;
    }

    const res = await tryCatchWrapper(
      otpMatch,
      { body: { email: forgottenEmail, otp } },
      { toastLoadingMessage: "Verifying OTP..." }
    );

    if (res?.success) {
      setOtp("");
      // The reset token gates the update-password step.
      setBrandCookie("forgetOtpMatchToken", res.data?.resetToken ?? "", {
        path: "/",
        expires: 1,
      });
      router("/update-password");
    }
  };

  const handleResendOtp = async () => {
    if (!forgottenEmail) {
      toast.error("Your reset session expired. Please start again.");
      router("/forgot-password");
      return;
    }

    await tryCatchWrapper(
      resendOtp,
      { body: { emailOrPhone: forgottenEmail, type: "forgot" } },
      { toastLoadingMessage: "Resending OTP..." }
    );
  };

  return (
    <AuthLayout
      subtitle="Reset your password"
      cardTitle="Enter OTP Code"
      cardDescription={`Enter the ${OTP_LENGTH}-digit code sent to your email`}
    >
      <div className="text-center">
        <p className="text-sm text-gray-500">We sent a {OTP_LENGTH}-digit code to:</p>
        <p className="text-sm font-bold text-base-color mt-1">{forgottenEmail}</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-base-color text-center mb-3">Enter OTP Code</p>
        <div className="flex justify-center">
          <OTPInput
            inputStyle="!w-[42px] h-[42px] sm:!w-[52px] sm:!h-[52px] text-lg !bg-primary-color border !border-base-color/30 rounded-lg !mr-2 last:!mr-0 !text-base-color"
            value={otp}
            onChange={setOtp}
            numInputs={OTP_LENGTH}
            renderInput={(props) => <input {...props} inputMode="numeric" required />}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        Didn&apos;t receive the code?{" "}
        <span
          onClick={handleResendOtp}
          className="text-secondary-color font-semibold cursor-pointer hover:underline"
        >
          Resend OTP
        </span>
      </p>

      <Button onClick={handleOTPSubmit} variant="secondary" className="w-full mt-5" type="button">
        Verify OTP
      </Button>

      <Link
        to="/forgot-password"
        className="flex items-center justify-center text-sm font-medium text-base-color hover:text-secondary-color transition-colors mt-4"
      >
        Change Email
      </Link>
    </AuthLayout>
  );
};
export default OTPVerify;
