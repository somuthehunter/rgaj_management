"use client";

import { useMutation } from "@tanstack/react-query";
import { loginUser, LoginPayload } from "@/services/auth.service";
import { useState } from "react";
import { loginSchema } from "@/schemas/auth.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      const { user, accessToken } = res.data;

      // store session
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);

      toast.success("Login successful.");
      router.push("/Dashboard");
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
