"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const validateEmail = (email: string) => {
    const gmailTypos = ["gmal.com", "gmil.com", "gail.com", "gmai.com", "gmali.com", "gmaill.com", "gamil.com"];
    const domain = email.split("@")[1];

    if (gmailTypos.includes(domain)) {
      return "Apakah maksud anda gmail.com? Silakan periksa kembali email anda.";
    }
    return null;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

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
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              <label className="block text-sm font-medium mb-1 text-white/80">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="Masukkan password kembali"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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

            <div className="flex items-start gap-3 text-sm text-white/70">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent"
                required
              />
              <label htmlFor="terms">
                Saya setuju dengan{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary hover:underline focus:outline-none"
                >
                  syarat dan ketentuan
                </button>{" "}
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

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <Card 
            className="bg-[#050816] border border-white/20 text-white max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">Syarat dan Ketentuan</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">1. Penerimaan Syarat</h3>
                <p className="text-white/80 leading-relaxed">
                  Dengan mendaftar dan menggunakan platform Bagoes Esports, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. 
                  Jika Anda tidak setuju dengan syarat-syarat ini, mohon untuk tidak menggunakan platform ini.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">2. Akun Pengguna</h3>
                <ul className="text-white/80 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda</li>
                  <li>Anda harus berusia minimal 13 tahun untuk membuat akun</li>
                  <li>Setiap pengguna hanya diperbolehkan memiliki satu akun</li>
                  <li>Dilarang membuat akun dengan informasi palsu atau mencuri identitas orang lain</li>
                  <li>Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">3. Perilaku Pengguna</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  Pengguna diharapkan untuk:
                </p>
                <ul className="text-white/80 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Menghormati pengguna lain dan menjaga lingkungan yang positif</li>
                  <li>Tidak melakukan tindakan yang merugikan, mengancam, atau melecehkan pengguna lain</li>
                  <li>Tidak menggunakan platform untuk aktivitas ilegal atau tidak etis</li>
                  <li>Tidak melakukan cheating, hacking, atau manipulasi dalam turnamen</li>
                  <li>Mematuhi aturan fair play dalam setiap kompetisi</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">4. Event dan Turnamen</h3>
                <ul className="text-white/80 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Pendaftaran event dan turnamen mengikat dan tidak dapat dibatalkan kecuali ada ketentuan khusus</li>
                  <li>Hadiah turnamen akan diberikan sesuai dengan ketentuan yang telah ditetapkan</li>
                  <li>Keputusan panitia turnamen bersifat final dan tidak dapat diganggu gugat</li>
                  <li>Peserta yang tidak hadir tanpa pemberitahuan dapat dikenakan sanksi</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">5. Pembayaran dan Refund</h3>
                <ul className="text-white/80 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Semua pembayaran dilakukan melalui metode yang telah ditentukan</li>
                  <li>Kebijakan refund mengikuti ketentuan masing-masing event</li>
                  <li>Pembayaran yang telah dilakukan tidak dapat dikembalikan kecuali event dibatalkan oleh penyelenggara</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">6. Hak Kekayaan Intelektual</h3>
                <p className="text-white/80 leading-relaxed">
                  Semua konten di platform Bagoes Esports, termasuk logo, desain, dan materi lainnya, adalah milik Bagoes Esports 
                  dan dilindungi oleh undang-undang hak cipta. Pengguna tidak diperbolehkan untuk menyalin, memodifikasi, atau 
                  mendistribusikan konten tanpa izin tertulis.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">7. Privasi Data</h3>
                <p className="text-white/80 leading-relaxed">
                  Kami menghormati privasi Anda. Data pribadi yang dikumpulkan akan digunakan sesuai dengan kebijakan privasi kami 
                  dan hanya untuk keperluan operasional platform. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa 
                  persetujuan Anda, kecuali diwajibkan oleh hukum.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">8. Pembatasan Tanggung Jawab</h3>
                <p className="text-white/80 leading-relaxed">
                  Bagoes Esports tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform, termasuk namun tidak 
                  terbatas pada kehilangan data, kerugian finansial, atau kerugian lainnya. Pengguna menggunakan platform ini 
                  dengan risiko sendiri.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">9. Perubahan Ketentuan</h3>
                <p className="text-white/80 leading-relaxed">
                  Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diberitahukan melalui platform atau 
                  email. Penggunaan platform setelah perubahan berarti Anda menyetujui ketentuan yang baru.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">10. Kontak</h3>
                <p className="text-white/80 leading-relaxed">
                  Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui halaman kontak 
                  atau email support@bagoes-esports.com.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/60">
                  Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end">
              <Button
                onClick={() => setShowTermsModal(false)}
                className="bg-primary text-white hover:opacity-90"
              >
                Saya Mengerti
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}