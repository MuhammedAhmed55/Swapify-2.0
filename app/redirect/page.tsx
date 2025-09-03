"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRoles } from "@/types/types";

export default function RedirectPage() {
  const router = useRouter();
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // If not logged in, send to login
    if (!userProfile?.id) {
      router.replace("/auth/login");
      return;
    }

    const role = userProfile?.roles?.name || "";
    if (role === UserRoles.ADMIN) {
      router.replace("/admin");
    } else {
      router.replace("/user");
    }
  }, [loading, userProfile, router]);

  return null;
}
