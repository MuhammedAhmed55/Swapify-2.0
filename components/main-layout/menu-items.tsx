import { UserRoles } from "@/types/types";
import {
  RiScanLine,
  RiMessage2Line,
  RiSettings3Line,
  RiTeamLine,
  RiContactsLine,
} from "@remixicon/react";

export const getNavData = (user: { roles?: string }) => {
  const isAdmin =
    user.roles === UserRoles.ADMIN || user.roles?.includes(UserRoles.ADMIN);
  const isManager =
    user.roles === UserRoles.MANAGER || user.roles?.includes(UserRoles.MANAGER);

  const dashboardUrl = isAdmin ? "/admin" : "/user";

  const userSectionItems = [
    {
      title: "Overview",
      url: "/user",
      icon: RiScanLine,
      isActive: false,
    },
    {
      title: "My Products",
      url: "/user/my-products",
      icon: RiContactsLine,
      isActive: false,
    },
    {
      title: "Swap",
      url: "/user/swap",
      icon: RiMessage2Line,
      isActive: false,
    },
    {
      title: "Shoutouts",
      url: "/user/shoutouts",
      icon: RiMessage2Line,
      isActive: false,
    },
  ];

  const adminSectionItems = [
    {
      title: "Overview",
      url: "/admin",
      icon: RiScanLine,
      isActive: false,
    },
    {
      title: "Product Review",
      url: "/admin/product-review",
      icon: RiContactsLine,
      isActive: false,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: RiSettings3Line,
      isActive: false,
    },
  ];

  const navMain = [
    {
      title: "Sections",
      url: "#",
      items: isAdmin ? adminSectionItems : userSectionItems,
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
  return {
    navMain: isAdmin ? adminNavMain : navMain,
  };
};
