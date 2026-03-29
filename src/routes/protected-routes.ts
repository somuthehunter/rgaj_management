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
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN, UserRole.CASHIER],
  },
  {
    path: "/Dashboard/Stores",
    label: "Stores",
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    path: "/Dashboard/Users",
    label: "Users",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Orders",
    label: "Orders",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN, UserRole.CASHIER],
  },
  {
    path: "/Dashboard/Customers",
    label: "Customers",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN, UserRole.CASHIER],
  },
  {
    path: "/Dashboard/Categories",
    label: "Categories",
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN],
  },
  {
    path: "/Dashboard/Inventory",
    label: "Inventory",
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
    roles: [UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN, UserRole.CASHIER],
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

export const getDefaultRouteForRole = (role: UserRole): string => {
  const preferredRoutes: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "/Dashboard/Overview",
    [UserRole.STORE_ADMIN]: "/Dashboard/Overview",
    [UserRole.CASHIER]: "/Dashboard/Sell",
  };

  return preferredRoutes[role];
};

