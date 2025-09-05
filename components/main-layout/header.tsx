import { Separator } from "@radix-ui/react-separator";

import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../breadcrumb";
import { RiScanLine } from "@remixicon/react";
import Link from "next/link";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { UserRoles } from "@/types/types";

export default function Header({ title, url }: { title: string; url: string }) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.roles?.name === UserRoles.ADMIN;
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger className="-ms-4" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                <RiScanLine size={22} aria-hidden="true" />
                <span className="sr-only">Dashboard</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Link href={url}>{title}</Link>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Global quick link - only show for users, not admins */}
      {!isAdmin && (
        <div className="px-3">
          <Link
            href="/user/browse"
            className="inline-flex items-center rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </header>
  );
}
