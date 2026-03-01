import { UserRole } from "@/types";

export interface RouteConfig {
  path: string;
  label: string;
  roles: UserRole[];
}

export const protectedRoutes: RouteConfig[] = [
  {
    path: "/Dashboard/Overview",
    label: "Overview",
    roles: [UserRole.ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Stores",
    label: "Stores",
    roles: [UserRole.ADMIN],
  },
  {
    path: "/Dashboard/Orders",
    label: "Orders",
    roles: [UserRole.ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Products",
    label: "Products",
    roles: [UserRole.ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Sell",
    label: "Sell",
    roles: [UserRole.ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Transactions",
    label: "Transactions",
    roles: [UserRole.ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Statistics",
    label: "Statistics",
    roles: [UserRole.ADMIN, UserRole.STORE_ADMIN],
  },
];

export const isRouteAllowed = (
  path: string,
  role: UserRole
): boolean => {
  const route = protectedRoutes.find((r) => r.path === path);
  if (!route) return false;
  return route.roles.includes(role);
};