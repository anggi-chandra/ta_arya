"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LogoImg from "@/public/logo.png";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setIsLoading(false);
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/login`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Gagal mendaftarkan akun.");
        setIsLoading(false);
        return;
      }

      // Initialize profile and default role immediately so admin can see the user
      try {
        const userId = signUpData?.user?.id;
        await fetch('/api/auth/register/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email, full_name: fullName }),
        });
      } catch (e) {
        // Silent failure – non-blocking for registration
        console.warn('Failed to initialize profile after sign up');
      }

      setSuccess("Registrasi berhasil. Silakan cek email untuk verifikasi sebelum login.");
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat registrasi.");
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, fullName]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary-navy via-[#11133d] to-primary-red p-8 md:p-12 flex flex-col justify-between text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <Image
              src={LogoImg}
              alt="Bagoes Esports"
              className="h-28 w-auto drop-shadow-2xl"
              priority
            />
            <div className="max-w-md">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-2">
                Mulai perjalanan esports kamu
              </p>
              <h1 className="text-4xl font-black leading-snug">
                Build your <span className="text-primary">team legacy</span>
              </h1>
              <p className="mt-3 text-white/85 text-base max-w-md">
                Daftarkan diri untuk mengelola event, mengikuti turnamen, dan
                bekerjasama dengan pemain terbaik di jaringan Bagoes Esports.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                "Buat profil tim dan undang anggota",
                "Kelola tiket & pesanan event secara realtime",
                "Pantau statistik komunitas dalam satu dashboard",
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
          <div className="relative z-10 mt-8 text-sm text-white/75">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-white font-semibold underline">
              Masuk sekarang
            </Link>
          </div>
        </div>

        <Card className="bg-[#050816]/80 border border-white/5 m-4 md:m-6 p-6 md:p-8 text-white shadow-lg">
          <div className="mb-6 text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Registrasi
            </p>
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-sm text-white/70">
              Bergabung dengan ekosistem esports profesional
            </p>
          </div>
        
        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">Nama Lengkap</label>
            <div className="relative">
              <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="Nama lengkap anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="Masukkan password kembali"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-sm text-white/70">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent"
              required
            />
            <label htmlFor="terms">
              Saya setuju dengan{" "}
              <Link href="/terms" className="text-primary hover:underline">
                syarat dan ketentuan
              </Link>{" "}
              serta kebijakan privasi Bagoes Esports.
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
        </Card>
      </div>
    </div>
  );
}