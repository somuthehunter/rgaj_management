"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { getDefaultRouteForRole, isRouteAllowed } from "@/routes/protected-routes";
import { extractProfileUser, getProfile } from "@/services/auth.service";
import { clearSession, getUser, setSession } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      const user = getUser();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!user || !token) {
        clearSession();
        if (!cancelled) {
          setRedirectTo("/login");
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const res = await getProfile();
        const profile = extractProfileUser(res);
        const role = normalizeRole(profile?.role ?? user.role);

        if (!profile?.id || !profile?.name || !profile?.email || !role) {
          throw new Error("Invalid profile payload.");
        }

        setSession(profile, token);

        if (!isRouteAllowed(pathname, role)) {
          if (!cancelled) {
            setRedirectTo(getDefaultRouteForRole(role));
          }
          return;
        }

        if (!cancelled) {
          setRedirectTo(null);
        }
      } catch {
        clearSession();
        if (!cancelled) {
          setRedirectTo("/login");
        }
        return;
      } finally {
        if (!cancelled) setIsCheckingAuth(false);
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  if (isCheckingAuth || redirectTo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`min-h-screen p-4 transition-all duration-300 sm:p-6 ${
          collapsed ? "ml-16 md:ml-16" : "ml-16 md:ml-60"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
