"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Settings } from "@/modules/settings";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/modules/auth";
import { toast } from "sonner";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";

export default function SignUp() {
  const id = useId();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const router = useRouter();
  const { settings, signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [userExists, setUserExists] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUserExists(false);

    try {
      // Prepare signup data in the format expected by AuthContext
      const signupData = {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      const result = await signUp(signupData);

      router.push("/auth/verify?email=" + formData.email);
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes("User already registered")) {
        setUserExists(true);
        toast.error(
          "An account with this email already exists. Please login instead."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred during registration"
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <>
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
              Create an account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              We just need a few details to get you started.
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
                <Label
                  htmlFor={`${id}-firstName`}
                  className="text-slate-700 dark:text-slate-300"
                >
                  First Name
                </Label>
                <Input
                  id={`${id}-firstName`}
                  name="firstName"
                  placeholder="John"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
                />
              </div>
              <div>
                <Label
                  htmlFor={`${id}-lastName`}
                  className="text-slate-700 dark:text-slate-300"
                >
                  Last Name
                </Label>
                <Input
                  id={`${id}-lastName`}
                  name="lastName"
                  placeholder="Doe"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
                />
              </div>
              <div>
                <Label htmlFor={`${id}-email`} className="text-slate-700 dark:text-slate-300">
                  Email
                </Label>
                <Input
                  id={`${id}-email`}
                  name="email"
                  placeholder="hi@yourcompany.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
                />
              </div>
              <div>
                <Label
                  htmlFor={`${id}-password`}
                  className="text-slate-700 dark:text-slate-300"
                >
                  Password
                </Label>
                <Input
                  id={`${id}-password`}
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>

            <div className="space-y-2 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                By signing up you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-slate-900 dark:text-white underline hover:no-underline cursor-pointer font-medium"
                >
                  Terms
                </Link>
                .
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-slate-900 dark:text-white hover:underline cursor-pointer font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
