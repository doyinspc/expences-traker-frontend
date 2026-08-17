import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        {/* Right side with background image */}
        <div 
          className="items-center hidden w-full h-full lg:w-1/2 lg:grid bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/bg.jpg')`
          }}
        >
          <div className="relative flex items-center justify-center z-1 w-full h-full bg-gradient-to-br from-black/80 via-black/60 to-black/40">
            <div className="flex flex-col items-center max-w-sm px-8 text-center">
              <Link to="/" className="block mb-6">
                <img
                  width={180}
                  height={40}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                  className="brightness-0 invert"
                />
              </Link>
              
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome Back!
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Sign in to access your dashboard, track expenses, manage budgets, 
                and take control of your financial journey.
              </p>
              
              <div className="mt-8 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-white/80"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-white/40"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-white/40"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}