"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, clearSession } from "@/services/session.service";
import { protectedRoutes } from "@/routes/protected-routes";
import { UserRole } from "@/types";

type Props = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

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

  useEffect(() => {
    setMounted(true);
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-black flex flex-col border-r border-border transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Package className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight">
            RGAJ Inventory
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleRoutes.map((route) => {
          const isActive = pathname.toLowerCase() === route.path.toLowerCase();

          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted",
              )}
            >
              <span>{route.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs truncate">{role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
