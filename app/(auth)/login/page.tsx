"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Mail, Lock, LogIn, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
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
  
  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulasi proses login dengan provider
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Selamat Datang</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Masuk untuk mengelola event dan komunitas esports kamu</p>
        </div>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Login berhasil! Mengalihkan...
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Masukkan password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:opacity-90"
            disabled={isLoading}
          >
            <span className="inline-flex items-center justify-center">
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? "Memproses..." : "Masuk"}
            </span>
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Atau masuk dengan</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Mail className="h-4 w-4 mr-2" /> Google
            </button>
            <button type="button" className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Github className="h-4 w-4 mr-2" /> GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Daftar di sini
          </Link>
        </p>
      </Card>
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