"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LogoImg from "@/public/logo.png";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have a valid session/token from the reset link
    const checkSession = async () => {
      // First, check if there's a hash in the URL (Supabase redirects with hash)
      const hash = window.location.hash;
      
      if (hash) {
        // Extract access_token and type from hash
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && type === 'recovery') {
          // Set the session using the tokens from hash
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (session && !error) {
            setIsValidToken(true);
            // Clean up the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        }
      }
      
      // Fallback: check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Gagal mereset password.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat mereset password.");
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 md:p-8">
        <Card className="bg-[#050816]/80 border border-white/5 m-4 md:m-6 p-6 md:p-8 text-white shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/70">Memverifikasi token...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 md:p-8">
        <Card className="bg-[#050816]/80 border border-white/5 m-4 md:m-6 p-6 md:p-8 text-white shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Link Tidak Valid</h2>
            <p className="text-white/70 mb-6">
              Link reset password tidak valid atau sudah kedaluwarsa. Silakan request link reset password baru.
            </p>
            <Button
              onClick={() => router.push("/forgot-password")}
              className="bg-primary text-white hover:opacity-90"
            >
              Request Link Baru
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="bg-[#050816]/80 border border-white/5 m-4 md:m-6 p-6 md:p-8 text-white shadow-lg">
          <div className="mb-6">
            <div className="flex justify-center mb-6">
              <Image
                src={LogoImg}
                alt="Bagoes Esports"
                className="h-20 w-auto drop-shadow-2xl"
                priority
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
              <p className="text-sm text-white/70">
                Masukkan password baru Anda
              </p>
            </div>
          </div>

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded mb-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Password berhasil direset!</p>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Mengalihkan ke halaman login...
                  </p>
                </div>
              </div>
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
                <label className="block text-sm font-medium mb-1 text-white/80">Password Baru</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="Minimal 6 karakter"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
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

              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Konfirmasi Password Baru</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="Masukkan password kembali"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                disabled={isLoading}
              >
                {isLoading ? "Mereset Password..." : "Reset Password"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-white">Memuat...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

