"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Header() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        toast.error("Failed to sign out: " + error.message);
        return;
      }
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const getDashboardUrl = () => {
    if (userProfile?.roles?.name === "admin") {
      return "/admin";
    }
    return "/user";
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Swapify
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            About
          </Link>
          <Link href="#contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center space-x-3">
          {userProfile ? (
            // Authenticated user buttons
            <>
              <Link href={getDashboardUrl()}>
                <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            // Unauthenticated user buttons
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="hidden sm:inline-flex hover:bg-slate-100 dark:hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
