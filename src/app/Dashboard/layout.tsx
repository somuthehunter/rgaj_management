"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { isRouteAllowed } from "@/routes/protected-routes";
import { UserRole } from "@/types";

const normalizeRole = (role?: string): UserRole | null => {
  if (!role) return null;
  const upperRole = role.toUpperCase();
  if (upperRole === UserRole.SUPER_ADMIN || upperRole === "ADMIN") return UserRole.SUPER_ADMIN; //leter change
  if (upperRole === UserRole.STORE_ADMIN) return UserRole.STORE_ADMIN;
  return null;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    let user: { role?: string } | null = null;
    try {
      user = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    const role = normalizeRole(user?.role);

    if (!role) {
      router.replace("/login");
      return;
    }

    if (!isRouteAllowed(pathname, role)) {
      router.replace("/Dashboard/Overview");
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`min-h-screen p-6 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
