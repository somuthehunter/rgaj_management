"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../_hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { formData, handleChange, handleSubmit, submitLogin, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden items-center justify-center bg-brand-gradient md:flex">
        <Image
          src="/images/hero.png"
          alt="ratnasmriti-login"
          width={500}
          height={500}
          priority
          className="mb-20 object-cover"
        />

        <div className="absolute bottom-8 left-8 max-w-md text-white">
          <p className="text-lg font-medium">
            Ratnasmriti Gems And Jewellers - We Provide the best.
          </p>
          <p className="mt-2 text-sm opacity-80">Ratnasmriti Jewellers</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome back to Management Portal
            </h1>
            <p className="mt-2 text-gray-400">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            method="post"
            action="/login"
          >
            <div>
              <label className="mb-1 block text-sm">Email *</label>
              <Input
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                inputMode="email"
                required
                className="text-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Password *</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="pr-10 text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-teal-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
