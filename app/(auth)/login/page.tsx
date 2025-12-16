"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn, Github, Linkedin, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Save or remove email based on remember me
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        // Pass remember me preference to NextAuth
        callbackUrl: callbackUrl || "/dashboard",
      });

      if (result?.error) {
        setError("Email atau password salah.");
        setIsLoading(false);
        return;
      }

      // Ambil role user untuk menentukan redirect
      const res = await fetch("/api/auth/me");
      const data = await res.json().catch(() => ({}));

      setIsLoading(false);
      setSuccess(true);

      // Jika ada callbackUrl, redirect ke sana
      if (callbackUrl) {
        router.push(callbackUrl);
        return;
      }

      // Jika tidak ada callbackUrl, redirect berdasarkan role
      const roles: string[] = data?.roles || [];
      if (roles.includes("admin") || roles.includes("moderator")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login.");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn(provider, {
        callbackUrl: callbackUrl || "/dashboard",
        redirect: true,
      });
      
      // Jika redirect: true, kode ini tidak akan dieksekusi
      // Tapi jika ada error, kita bisa handle di sini
      if (result?.error) {
        setError(`Gagal login dengan ${provider}. Silakan coba lagi.`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(`Terjadi kesalahan saat login dengan ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Left highlight */}
        <div className="relative bg-gradient-to-br from-primary-navy via-[#11133d] to-primary-red p-8 md:p-12 flex flex-col justify-between text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <Image
              src="/logo.png"
              alt="Bagoes Esports"
              width={200}
              height={200}
              className="h-32 w-auto drop-shadow-2xl"
              priority
            />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-2">
                Bagoes Esports
              </p>
              <h1 className="text-4xl font-black leading-snug">
                Welcome Back to{" "}
                <span className="text-primary">Bagoes Esports</span>
              </h1>
              <p className="mt-3 text-white/80 text-base max-w-md">
                Track your stats, manage tournaments, dan bangun komunitas
                profesional dengan warna khas Bagoes Esports.
              </p>
            </div>
            <div className="space-y-4">
              {[
                "Pantau performa tim dan event",
                "Kelola tiket & bracket turnamen",
                "Terhubung dengan komunitas esports",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/85"
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-10">
            <p className="text-white/80 text-sm mb-2">Belum punya akun?</p>
            <Link href="/register">
              <Button className="bg-white text-primary hover:bg-gray-100 w-full font-semibold">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>

        {/* Right form */}
        <Card className="bg-[#050816]/80 border border-white/5 m-4 md:m-6 p-6 md:p-8 text-white shadow-lg">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-3">
              Masuk Dashboard
            </p>
            <h2 className="text-3xl font-bold">Sign In</h2>
            <p className="text-sm text-white/70 mt-1">
              Tidak punya akun?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register now
              </Link>
            </p>
          </div>

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded mb-4 text-sm">
              Login berhasil! Mengalihkan...
            </div>
          )}

          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1 text-white/80">Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="nama@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white/80">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="Masukkan password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/60">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-transparent cursor-pointer" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              disabled={isLoading}
            >
              <span className="inline-flex items-center justify-center">
                <LogIn className="h-4 w-4 mr-2" />
                {isLoading ? "Memproses..." : "Sign In"}
              </span>
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs text-white/60">
                <span className="px-3 bg-[#050816]">atau gunakan akun sosial</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => handleSocialLogin("google")}
              >
                <Mail className="h-4 w-4 mr-2" /> Google
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Memuat...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}