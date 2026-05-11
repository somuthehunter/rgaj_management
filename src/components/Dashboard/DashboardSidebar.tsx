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
  User,
  Store,
  Tags,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  LayoutDashboard,
  Wallet,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUser, clearSession } from "@/services/session.service";
import { logoutUser } from "@/services/auth.service";
import { protectedRoutes } from "@/routes/protected-routes";
import { normalizeRole } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import DashboardTourControl from "@/components/Dashboard/DashboardTourControl";

type Props = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const routeIcons = {
  Overview: LayoutDashboard,
  Stores: Store,
  Users: User,
  Orders: ShoppingCart,
  Customers: Users,
  Categories: Tags,
  Inventory: Boxes,
  Products: Package,
  Sell: Wallet,
  Refunds: RotateCcw,
  Transactions: ReceiptText,
  Statistics: BarChart3,
} as const;

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

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Clear client session even if the logout request fails.
    } finally {
      clearSession();
      router.push("/login");
    }
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
      data-tour="sidebar"
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 z-50",
        sidebarWidthClass,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border",
          isExpanded ? "gap-2 px-4 justify-between" : "justify-center px-2",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
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

      <ScrollArea
        className={cn(
          "flex-1",
          isExpanded ? "px-3" : "px-2",
        )}
      >
        <nav className={cn("py-4", isExpanded ? "space-y-1.5" : "space-y-2")}>
          {visibleRoutes.map((route) => {
            const isActive = pathname.toLowerCase() === route.path.toLowerCase();
            const Icon = routeIcons[route.label as keyof typeof routeIcons] ?? Package;

            return (
              <Link
                key={route.path}
                href={route.path}
                data-tour={
                  route.label === "Overview"
                    ? "nav-overview"
                    : route.label === "Sell"
                      ? "nav-sell"
                      : route.label === "Orders"
                        ? "nav-orders"
                        : route.label === "Inventory"
                          ? "nav-inventory"
                          : route.label === "Customers"
                            ? "nav-customers"
                            : route.label === "Refunds"
                              ? "nav-refunds"
                    : route.label === "Products"
                      ? "nav-products"
                      : undefined
                }
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
      </ScrollArea>

      <div
        className={cn(
          "border-t border-sidebar-border p-3 space-y-2",
          !isExpanded && "px-2",
        )}
      >
        {isExpanded && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs truncate">{role}</p>
          </div>
        )}
        <div className={cn(
          "flex items-center",
          isExpanded ? "justify-start" : "justify-center"
        )}>
          <DashboardTourControl compact={!isExpanded} />
        </div>
        <div className={cn(
          "flex items-center",
          isExpanded ? "justify-start" : "justify-center"
        )} data-tour="theme-toggle">
          <ThemeToggle className={isExpanded ? "w-full" : ""} />
        </div>
        <button
          data-tour="logout"
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
        data-tour="sidebar-toggle"
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
