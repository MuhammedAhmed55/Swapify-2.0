"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { requestPasswordReset } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { settings } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordReset(email, "user");
      toast.success(
        "If your email exists in our system, a reset link has been sent."
      );
    } catch (err) {
      console.log("🚀 ~ handleSubmit ~ err:", err);
      toast.error("Something went wrong, so please try again later.");
    } finally {
      setIsLoading(false);
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
                    : settings?.logo_url) ||
                  generateNameAvatar("Daxow Agent Portal")
                }
                alt="logo"
                width={50}
                height={50}
                unoptimized
                style={{
                  width:
                    settings?.logo_setting === "horizontal" ? "60%" : "30%",
                }}
                className={cn(
                  `w-[${settings?.logo_setting === "horizontal" ? "60%" : "30%"}] h-full object-cover rounded-md transition-opacity duration-300`,
                  isImageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoadingComplete={() => setIsImageLoading(false)}
                priority
              />
            </div>
          ) : null}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your email to receive a password reset link.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
              {message}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                placeholder="hi@yourcompany.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 p-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-slate-900 dark:text-white hover:underline cursor-pointer font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
