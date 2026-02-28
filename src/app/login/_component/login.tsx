"use client";

import Image from "next/image";
import { useLogin } from "../_hooks/useLogin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2Icon } from "lucide-react";
import { use } from "react";

export default function Login() {
  const { formData, handleChange, handleSubmit, isPending, error, isSuccess } =
    useLogin();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT IMAGE SECTION */}
      <div className="hidden md:flex justify-center items-center bg-brand-gradient">
        <Image
          src="/images/hero.png"
          alt="ratnasmriti-login"
          width={500}
          height={500}
          priority
          className="object-cover mb-20"
        />

        <div className="absolute bottom-8 left-8 max-w-md text-white">
          <p className="text-lg font-medium">
            Ratnasmriti Gems And Jewellers - We Provide the best.
          </p>
          <p className="mt-2 text-sm opacity-80">— Ratnasmriti Jewellers</p>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="flex items-center justify-center bg-black text-white px-6">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome back to Management Portal
            </h1>
            <p className="mt-2 text-gray-400">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Email or Phone</label>
              <Input
                name="email"
                type="email"
                placeholder="admin@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-teal-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" disabled={isPending} className="w-full ">
              {isPending ? "Signing in..." : "Sign In"}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <CheckCircle2Icon />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  Please check your credentials and try again.
                </AlertDescription>
              </Alert>
            )}
            {isSuccess && (
              <Alert className="mt-4 border-green-600 bg-green-950 text-green-400 ">
                <CheckCircle2Icon className="h-5 w-5 !text-green-500" />
                <AlertTitle className="text-green-500">
                  Login Successful
                </AlertTitle>
                <AlertDescription className="text-green-400">
                  You have logged in successfully.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
