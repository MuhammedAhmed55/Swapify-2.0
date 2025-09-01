"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Session, WeakPassword } from "@supabase/supabase-js";
import { authService, AuthSignupData } from "@/modules/auth";

import { usersService } from "@/modules/users";
import { User } from "@/types/types";
import Cookies from "js-cookie";
import { Settings, settingsService } from "@/modules/settings";
import Loader from "@/components/loader";
import { supabase } from "@/lib/supabase-auth-client";
import { checkAuthentication } from "@/utils/check-authentication";
import { getWhatsAppProfile } from "@/lib/actions/whatsapp-actions";
import { checkWahaWhatsAppStatus } from "@/lib/actions/wahapro-actions";
import { LogOut, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthContextType = {
  user: User | null;
  userProfile: User | null;
  session: Session | null;
  loading: boolean;
  settings: Settings | null;
  signUp: (
    data: AuthSignupData
  ) => Promise<{ user: User | null; session: Session | null } | { user: User }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User; session: Session; weakPassword?: WeakPassword }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setUserProfile: (userProfile: any | null) => void;
  setSettings: (settings: Settings | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth protection configuration
const DEFAULT_AUTH_ROUTE = "/auth/login";
const DEFAULT_PROTECTED_ROUTE = "/";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Define public routes that don't require authentication
  const PUBLIC_ROUTES = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/accept-invite",
  ];

  // Define routes that authenticated users should be redirected from (e.g., login page)
  const AUTH_ROUTES = ["/auth/login", "/auth/sign-up"];

  // Function to get user data from Supabase and user_profile table
  const fetchUserData = async () => {
    try {
      const { user, status } = await checkAuthentication();

      if (user) {
        checkRouteAccess(window.location.pathname, user);

        setUser(user);
        setSession(user as unknown as Session);

        // Fetch user profile data from user_profile table
        const userData = await usersService.getUserById(user.id);
        console.log("🚀 ~ fetchUserData ~ userData:", userData);
        if (userData) {
          setUserProfile(userData);
        }
      } else {
        if (user) {
          signOut();
        }
        setUser(null);
        setUserProfile(null);
        setSettings(null);
      }
    } catch (error) {
      // console.log("Error fetching user data:", error);
      setUser(null);
      setUserProfile(null);
      setSettings(null);
      signOut();
    }
    setLoading(false);
  };

 

  

  const fetchSettings = async () => {
    const settingsData = await settingsService.getSettingsById();
    if (settingsData) {
      setSettings(settingsData);
    }
  };

  // Handle auth state and routing
  useEffect(() => {
    fetchUserData();
    fetchSettings();
  }, []);

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = async () => {
      try {
        const fetchedSettings = await settingsService.getSettingsById();
        setSettings(fetchedSettings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    window.addEventListener("settings-update", handleSettingsUpdate);
    return () => {
      window.removeEventListener("settings-update", handleSettingsUpdate);
    };
  }, []);

  const checkRouteAccess = (path: string, userData: User | null) => {
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    // Case 1: Unauthenticated user trying to access protected route
    if (!userData && !isPublicRoute) {
      // Redirect to login
      window.location.href = "/auth/login";
    }

    // Case 2: Authenticated user trying to access auth routes (login, signup)
    if (userData && AUTH_ROUTES.some((route) => path.startsWith(route))) {
      window.location.href = "/";
    }
  };

  const signUp = async (data: AuthSignupData) => {
    try {
      const result = await authService.signUp(data);

      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);

      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setSettings(null);
      window.location.href = "/auth/login";
    } catch (error) {
      setLoading(false);
      console.error("Sign out error:", error);
      throw error;
    }
  };

  // Show loading state or nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (userProfile?.is_active === false) {
    return (
      <div className="h-[calc(100vh-100px)] flex justify-center items-center ">
        <div className="text-center mt-6 lg:w-[40%]">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Your account has been banned by the admin. You do not have
            permission to access this platform. Please contact your
            administrator if you believe this is an error.
          </p>
          <div className="flex justify-center w-full">
            <Button
              variant={"outline"}
              className="w-max mt-5"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    settings,
    signUp,
    setUserProfile,
    signIn,
    signOut,
    setUser,
    setSettings,
    };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext) as AuthContextType;
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
