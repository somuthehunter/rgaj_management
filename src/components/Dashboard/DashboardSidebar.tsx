"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Package,
  ShoppingCart,
  Users,
  Store,
  Tags,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  LayoutDashboard,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, clearSession } from "@/services/session.service";
import { protectedRoutes } from "@/routes/protected-routes";
import { UserRole } from "@/types";

type Props = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const routeIcons = {
  Overview: LayoutDashboard,
  Stores: Store,
  Orders: ShoppingCart,
  Customers: Users,
  Categories: Tags,
  Inventory: Boxes,
  Products: Package,
  Sell: Wallet,
  Transactions: ReceiptText,
  Statistics: BarChart3,
} as const;

const normalizeRole = (role?: string): UserRole | null => {
  if (!role) return null;
  const upperRole = role.toUpperCase();
  if (upperRole === UserRole.SUPER_ADMIN || upperRole === "ADMIN") return UserRole.SUPER_ADMIN; //leter change
  if (upperRole === UserRole.STORE_ADMIN) return UserRole.STORE_ADMIN;
  return null;
};

const DashboardSidebar = ({ collapsed, setCollapsed }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncViewport = (event?: MediaQueryListEvent) => {
      const matches = event ? event.matches : mediaQuery.matches;
      setIsMobile(matches);
      setMobileExpanded(false);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  if (!mounted) return null;

  const user = getUser();
  if (!user) return null;

  const role = normalizeRole(user.role);
  if (!role) return null;

  const visibleRoutes = protectedRoutes.filter((route) =>
    route.roles.includes(role),
  );

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const isExpanded = isMobile ? mobileExpanded : !collapsed;
  const sidebarWidthClass = isMobile
    ? isExpanded
      ? "w-screen"
      : "w-16"
    : collapsed
      ? "w-16"
      : "w-60";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-black flex flex-col border-r border-border transition-all duration-300 z-50",
        sidebarWidthClass,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border",
          isExpanded ? "gap-2 px-4 justify-between" : "justify-center px-2",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-white" />
          </div>
          {isExpanded && (
            <span className="font-semibold text-sm tracking-tight truncate">
              RGAJ Inventory
            </span>
          )}
        </div>

        {isMobile && isExpanded && (
          <button
            onClick={() => setMobileExpanded(false)}
            className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 py-4 overflow-y-auto",
          isExpanded ? "px-3 space-y-1.5" : "px-2 space-y-2",
        )}
      >
        {visibleRoutes.map((route) => {
          const isActive = pathname.toLowerCase() === route.path.toLowerCase();
          const Icon = routeIcons[route.label as keyof typeof routeIcons] ?? Package;

          return (
            <Link
              key={route.path}
              href={route.path}
              onClick={() => {
                if (isMobile) {
                  setMobileExpanded(false);
                }
              }}
              className={cn(
                "rounded-lg text-sm transition-all duration-200",
                isExpanded
                  ? "flex items-center gap-3 px-3 py-2.5"
                  : "flex items-center justify-center p-3",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted",
              )}
              aria-label={route.label}
              title={!isExpanded ? route.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isExpanded && <span>{route.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-border p-3 space-y-2",
          !isExpanded && "px-2",
        )}
      >
        {isExpanded && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs truncate">{role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors w-full",
            isExpanded
              ? "flex items-center gap-3 px-3 py-2"
              : "flex items-center justify-center p-3",
          )}
          aria-label="Logout"
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={() => {
          if (isMobile) {
            setMobileExpanded((previous) => !previous);
            return;
          }

          setCollapsed(!collapsed);
        }}
        className={cn(
          "absolute top-20 h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center",
          isMobile
            ? "right-[-10px]"
            : "right-[-12px]",
        )}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
