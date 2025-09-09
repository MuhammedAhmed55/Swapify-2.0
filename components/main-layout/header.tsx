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
import NotificationsDropdown from "@/components/notification-dropdown";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";

export default function Header({ title, url }: { title: string; url: string }) {
  const { userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
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
      <div className="flex items-center gap-3 pr-3">
        {/* Notification Dropdown */}
        <NotificationsDropdown />

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Laptop className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => setTheme("light")}> 
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Global quick link - only show for users, not admins */}
        {!isAdmin && (
          <Button asChild size="sm" className="rounded-md px-3">
            <Link href="/user/browse">Browse Products</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
