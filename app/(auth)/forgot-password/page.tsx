"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LogoImg from "@/public/logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email harus diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || "Gagal mengirim email reset password.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat mengirim email reset password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="bg-[#050816]/80 border border-white/5 m-4 md:m-6 p-6 md:p-8 text-white shadow-lg">
          <div className="mb-6">
            <Link href="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>
            
            <div className="flex justify-center mb-6">
              <Image
                src={LogoImg}
                alt="Bagoes Esports"
                className="h-20 w-auto drop-shadow-2xl"
                priority
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Lupa Password?</h2>
              <p className="text-sm text-white/70">
                Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.
              </p>
            </div>
          </div>

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded mb-4 text-sm">
              <p className="font-semibold mb-1">Email terkirim!</p>
              <p>
                Kami telah mengirimkan link reset password ke <strong>{email}</strong>. 
                Silakan cek inbox email Anda dan ikuti instruksi untuk mereset password.
              </p>
              <p className="mt-2 text-xs text-emerald-200/80">
                Jika email tidak muncul dalam beberapa menit, cek folder spam Anda.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {!success && (
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                disabled={isLoading}
              >
                {isLoading ? "Mengirim..." : "Kirim Link Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-white/60">
            <p>
              Ingat password Anda?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

