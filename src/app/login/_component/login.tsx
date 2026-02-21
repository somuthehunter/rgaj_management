import Image from "next/image";

export default function Login() {
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
          <p className="mt-2 text-sm opacity-80">
            — Ratnasmriti Jewellers
          </p>
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
              Enter your credentials to access your  dashboard
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email or Phone</label>
              <input
                type="email"
                placeholder="admin@gmail.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="text-right">
              <a
                href="#"
                className="text-sm text-teal-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-black py-3 rounded-lg font-medium transition"
            >
              Sign In
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}