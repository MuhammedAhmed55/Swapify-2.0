"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Settings, settingsService } from "@/modules/settings";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { toast } from "sonner";
import { resetPassword } from "@/lib/actions/auth-actions";
import { useAuth } from "@/context/AuthContext";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { settings } = useAuth();

  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, password, "user");
      toast.success("Password reset successful. You may now log in.");
      setPassword("");
      setConfirm("");
      setPasswordMessage({
        type: "success",
        text: "Password reset successful. You may now log in.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
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
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your new password below.
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
          {passwordMessage && (
            <div
              className={cn(
                "p-3 rounded-md text-sm border",
                passwordMessage.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
              )}
            >
              {passwordMessage.text}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                New Password
              </Label>
              <Input
                id="password"
                placeholder="Enter your new password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="confirm" className="text-slate-700 dark:text-slate-300">
                Confirm Password
              </Label>
              <Input
                id="confirm"
                placeholder="Confirm your new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Back to{" "}
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
