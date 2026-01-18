import { ReactNode } from "react";
import { AllImages } from "@/assets/AllImages";

interface AuthLayoutProps {
  subtitle: string;
  cardTitle: string;
  cardDescription: string;
  children: ReactNode;
}

const AuthLayout = ({ subtitle, cardTitle, cardDescription, children }: AuthLayoutProps) => {
  return (
    <div
      className=" min-h-screen flex items-center justify-center w-full"
      style={{ background: "linear-gradient(160deg, #4169E166, #F8F9FB, #6B8CFF66)" }}
    >
      <div className="w-full mx-auto px-4 py-8 max-w-sm sm:max-w-md">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <img src={AllImages.logo} alt="Ednleaf" className="h-10 sm:h-12 w-auto mb-2" />
            <h1 className="text-xl sm:text-2xl font-bold text-base-color">Ednleaf Admin</h1>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>

          <div className="w-full bg-white rounded-xl border border-border shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-base-color">{cardTitle}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">{cardDescription}</p>
            {children}
          </div>

          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Ednleaf. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
