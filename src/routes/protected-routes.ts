import { UserRole } from "@/types";

export interface RouteConfig {
  path: string;
  label: string;
  roles: UserRole[];
}

const normalizePath = (path: string) => path.toLowerCase();

export const protectedRoutes: RouteConfig[] = [
  {
    path: "/Dashboard/Overview",
    label: "Overview",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Stores",
    label: "Stores",
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    path: "/Dashboard/Orders",
    label: "Orders",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Products",
    label: "Products",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Sell",
    label: "Sell",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Transactions",
    label: "Transactions",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Statistics",
    label: "Statistics",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
];

export const isRouteAllowed = (path: string, role: UserRole): boolean => {
  const route = protectedRoutes.find(
    (r) => normalizePath(r.path) === normalizePath(path),
  );
  if (!route) return false;
  return route.roles.includes(role);
};

