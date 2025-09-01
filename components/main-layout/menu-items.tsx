import { UserRoles } from "@/types/types";
import {
  RiScanLine,
  RiMessage2Line,
  RiSettings3Line,
  RiTeamLine,
  RiContactsLine,
} from "@remixicon/react";

export const getNavData = (user: { roles?: string }) => {
  const navMain = [
    {
      title: "Sections",
      url: "#",
      items: [
        // {
        //   title: "Dashboard",
        //   url: "/",
        //   icon: RiScanLine,
        //   isActive: false,
        // },
        {
          title: "Dashboard",
          url: "/",
          icon: RiMessage2Line,
          isActive: false,
          resource: "users",
        },
      
      ],
    },
  ];

  const adminNavMain = [
    ...navMain,
    {
      title: "Other",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: RiSettings3Line,
        },
      ],
    },
    {
      title: "Admin Area",
      url: "#",
      items: [
        {
          title: "Users",
          url: "/users",
          icon: RiTeamLine,
          isActive: false,
          resource: "users",
        },
      ],
    },
  ];

  const isAdmin =
    user.roles === UserRoles.ADMIN || user.roles?.includes(UserRoles.ADMIN);
  const isManager =
    user.roles === UserRoles.MANAGER || user.roles?.includes(UserRoles.MANAGER);

  return {
    navMain: isAdmin ? adminNavMain : navMain,
  };
};
