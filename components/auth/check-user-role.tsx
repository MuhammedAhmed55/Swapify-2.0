"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { checkRoutePermission } from "@/components/auth/check-route-access";
import { User } from "@/types/types";
import { checkAuthentication } from "@/utils/check-authentication";
import { useAuth } from "@/context/AuthContext";
import Loader from "../loader";

export interface WithUserRole {
  user?: User | null;
  organizations?: any;
}

interface CheckUserRoleProps {
  children:
    | React.ReactElement<WithUserRole>
    | ((props: WithUserRole) => React.ReactElement);
}

export default function CheckUserRole({ children }: CheckUserRoleProps) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { signOut, userProfile } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        let res = await checkAuthentication();

        if (
          res.user?.id &&
          (pathname === "/auth/sign-up" || pathname === "/auth/login")
        ) {
          window.location.href = "/";
          return;
        }

        if (!res?.user?.id) {
          window.location.href = "/auth/login";
          setLoading(false);
          return;
        }

        let isAuthorized = await checkRoutePermission(userProfile, pathname);

        // Enforce route permissions
        if (!isAuthorized) {
          // Redirect to dashboard if not authorized for this route
          window.location.href = "/";
          return;
        }

        setLoading(false);
      } catch (error) {
        handleLogout();
        console.error("Authentication check failed:", error);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen justify-center items-center flex">
        <Loader />
      </div>
    );
  }

  // Handle both function children and element children
  if (typeof children === "function") {
    return children({ user: userProfile });
  }

  // Clone the children and pass the userRole as a prop
  const childrenWithRole = React.Children.map(children, (child) => {
    if (React.isValidElement<WithUserRole>(child)) {
      return React.cloneElement(child, {
        user: userProfile,
      } as WithUserRole);
    }
    return child;
  });

  return <>{childrenWithRole}</>;
}
