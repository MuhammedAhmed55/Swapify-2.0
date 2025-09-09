"use client";
import { useEffect, useId } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Settings } from "@/modules/settings";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { authService } from "@/modules/auth";
import { toast } from "sonner";

export default function Login() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerificationLoading, setIsEmailVerificationLoading] =
    useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { signIn, settings } = useAuth();

  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailVerificationNeeded(false);

    try {
      const result = await signIn(email, password);

      // If we get here, login was successful
      window.location.href = "/redirect";
    } catch (error: any) {
      setIsLoading(false);

      // Handle specific error cases
      if (error.message?.includes("Email not confirmed")) {
        setEmailVerificationNeeded(true);
        setError(
          "Email not confirmed. Please verify your email or resend the verification link."
        );
      } else if (error.message?.includes("Invalid login credentials")) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred during login"
        );
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsEmailVerificationLoading(true);
      // Since there's no direct method in authService for this,
      // we'll need to use the signUp method which triggers email verification
      await authService.resendVerificationEmail(email);
      toast.success("Verification email sent. Please check your inbox.");
      setEmailVerificationNeeded(false);
      setError(null);
    } catch (error: any) {
      // If the error indicates user already exists, that's expected

      setError(
        error instanceof Error
          ? error.message
          : "Failed to resend verification email"
      );
    } finally {
      setIsEmailVerificationLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-2">
          {(
            settings?.logo_setting === "horizontal"
              ? settings?.logo_horizontal_url
              : settings?.logo_url
          ) ? (
            <div
              className="flex shrink-0 items-center justify-center rounded-md  border-sidebar-border relative"
              aria-hidden="true"
            >
              <Image
                src={
                  (settings?.logo_setting === "horizontal"
                    ? settings?.logo_horizontal_url
                    : settings?.logo_url) || generateNameAvatar("Whatsapp")
                }
                alt="logo"
                width={50}
                height={50}
                unoptimized
                className={cn(
                  `w-[${settings?.logo_setting === "horizontal" ? "60%" : "30%"}] h-full object-cover rounded-md transition-opacity duration-300`,
                  isImageLoading ? "opacity-0" : "opacity-100"
                )}
                style={{
                  width:
                    settings?.logo_setting === "horizontal" ? "60%" : "30%",
                }}
                onLoadingComplete={() => setIsImageLoading(false)}
                priority
              />
            </div>
          ) : null}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your credentials to login to your account.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor={`${id}-email`} className="text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id={`${id}-email`}
                placeholder="hi@yourcompany.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
              />
            </div>
            <div>
              <Label htmlFor={`${id}-password`} className="text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Input
                id={`${id}-password`}
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${id}-remember`}
                className="border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <Label
                htmlFor={`${id}-remember`}
                className="text-slate-600 dark:text-slate-400 font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm underline hover:no-underline text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {emailVerificationNeeded && (
              <Button
                type="button"
                onClick={handleResendVerification}
                className="w-full p-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isEmailVerificationLoading}
              >
                {isEmailVerificationLoading
                  ? "Sending..."
                  : "Resend Verification Email"}
              </Button>
            )}
            <Button
              type="submit"
              className="w-full p-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-slate-900 dark:text-white hover:underline cursor-pointer font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
