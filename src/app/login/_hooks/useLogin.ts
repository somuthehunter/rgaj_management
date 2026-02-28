"use client";

import { useMutation } from "@tanstack/react-query";
import { loginUser, LoginPayload } from "@/services/auth.service";
import { useState } from "react";
import { loginSchema } from "@/schemas/auth.schema";

export function useLogin() {
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: (data: LoginPayload) => loginUser(data),
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
      console.log(parsed.error.flatten());
      return;
    }

    mutation.mutate(parsed.data);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}