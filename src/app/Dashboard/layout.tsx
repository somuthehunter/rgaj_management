"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { getDefaultRouteForRole, isRouteAllowed } from "@/routes/protected-routes";
import { extractProfileUser, getProfile } from "@/services/auth.service";
import {
  clearSession,
  getAccessToken,
  getLastSessionValidation,
  getUser,
  markSessionValidated,
  setSession,
} from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";

const SESSION_VALIDATION_TTL_MS = 5 * 60 * 1000;

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
      const token = getAccessToken();

      if (!user || !token) {
        clearSession();
        if (!cancelled) {
          setRedirectTo("/login");
          setIsCheckingAuth(false);
        }
        return;
      }

      const role = normalizeRole(user.role);
      if (!role) {
        clearSession();
        if (!cancelled) {
          setRedirectTo("/login");
          setIsCheckingAuth(false);
        }
        return;
      }

      if (!isRouteAllowed(pathname, role)) {
        if (!cancelled) {
          setRedirectTo(getDefaultRouteForRole(role));
          setIsCheckingAuth(false);
        }
        return;
      }

      const lastValidation = getLastSessionValidation();
      if (
        lastValidation &&
        Date.now() - lastValidation < SESSION_VALIDATION_TTL_MS
      ) {
        if (!cancelled) {
          setRedirectTo(null);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const res = await getProfile();
        const profile = extractProfileUser(res);
        const normalizedRole = normalizeRole(profile?.role ?? user.role);

        if (!profile?.id || !profile?.name || !profile?.email || !normalizedRole) {
          throw new Error("Invalid profile payload.");
        }

        setSession(profile, token);
        markSessionValidated();

        if (!isRouteAllowed(pathname, normalizedRole)) {
          if (!cancelled) {
            setRedirectTo(getDefaultRouteForRole(normalizedRole));
          }
          return;
        }

        if (!cancelled) {
          setRedirectTo(null);
        }
      } catch (error) {
        const status =
          error instanceof Error && "status" in error
            ? Number((error as Error & { status?: number }).status)
            : null;

        if (status === 401 || status === 403) {
          clearSession();
          if (!cancelled) {
            setRedirectTo("/login");
          }
          return;
        }

        markSessionValidated();
        if (!cancelled) {
          setRedirectTo(null);
        }
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
