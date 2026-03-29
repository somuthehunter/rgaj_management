"use client";

import { useMutation } from "@tanstack/react-query";
import {
  extractAuthSession,
  loginUser,
  LoginPayload,
} from "@/services/auth.service";
import { useState } from "react";
import { loginSchema } from "@/schemas/auth.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setSession } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/routes/protected-routes";

type ApiErrorPayload = {
  message?: string;
  error?: {
    message?: string;
  };
};

const getErrorMessage = (error: unknown) => {
  const err = error as Error & { data?: unknown };
  const payload = err?.data as ApiErrorPayload | undefined;
  return (
    payload?.error?.message ||
    payload?.message ||
    err?.message ||
    "Login failed. Please try again."
  );
};

export function useLogin() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: (data: LoginPayload) => loginUser(data),

    onSuccess: (res: any) => {
      const { user, accessToken, refreshToken } = extractAuthSession(res);
      const role = normalizeRole(user?.role);

      if (!user || !accessToken) {
        toast.error("Login succeeded but the session payload was incomplete.");
        return;
      }

      if (!role) {
        toast.error("Unsupported user role received from server.");
        return;
      }

      setSession(user, accessToken, refreshToken);

      toast.success("Login successful.");
      router.replace(getDefaultRouteForRole(role));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message || "Please enter valid credentials.";
      toast.error(firstError);
      return;
    }

    mutation.mutate(parsed.data);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isPending: mutation.isPending,
  };
}
