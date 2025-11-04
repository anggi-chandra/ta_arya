"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Gamepad2, Star, TrendingUp, Shield } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { EventCard } from "@/components/ui/event-card";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-black">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs mb-4">
              🏆 Platform Manajemen Esports Terdepan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Kelola Tim, Event, dan Turnamen dengan Mudah
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed">
              Bangun komunitas esports Anda, atur kompetisi, dan raih prestasi dengan dashboard yang lengkap dan modern.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-6 py-2.5">
                  Jelajahi Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-900 py-14">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tim Terdaftar</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">1,200+</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Event Diselenggarakan</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">5,000+</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pemain Aktif</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400">98%</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Kepuasan Pengguna</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <main className="flex-grow mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-black dark:text-zinc-50">Fitur Unggulan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola ekosistem esports dalam satu platform terintegrasi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="ml-3 font-semibold">Manajemen Tim</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Buat, kelola, dan atur peran anggota tim dengan sistem hierarki yang fleksibel.
              </p>
            </Card>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="ml-3 font-semibold">Event & Kompetisi</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Jadwalkan event, atur pendaftaran otomatis, dan publikasi informasi real-time.
              </p>
            </Card>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="ml-3 font-semibold">Prestasi & Leaderboard</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Pantau pencapaian tim dan peringkat turnamen dengan analitik mendalam.
              </p>
            </Card>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Gamepad2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="ml-3 font-semibold">Komunitas & Forum</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Diskusi, berbagi strategi, dan bangun jejaring esports yang solid.
              </p>
            </Card>
          </div>
        </section>

        {/* Events Preview */}
        <section className="py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium mb-3">
              Event Populer
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black dark:text-zinc-50">Jangan Lewatkan Event Terkini</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Ikuti kompetisi terbaru, daftar cepat, dan raih prestasi bersama komunitas esports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EventCard
              id="ev-1"
              title="Turnamen Mobile Legends - Season Qualifier"
              description="Babak kualifikasi untuk menentukan tim terbaik menuju grand final."
              image="/public/window.svg"
              date="12 Des 2025"
              location="Jakarta"
              participants={32}
              maxParticipants={64}
              price={0}
            />
            <EventCard
              id="ev-2"
              title="Valorant Community Cup"
              description="Kompetisi komunitas untuk semua level pemain dengan sistem Swiss."
              image="/public/globe.svg"
              date="20 Des 2025"
              location="Bandung"
              participants={48}
              maxParticipants={48}
              price={25000}
            />
            <EventCard
              id="ev-3"
              title="PUBG Mobile Duo Showdown"
              description="Format duo dengan map erangel dan hadiah menarik untuk pemenang."
              image="/public/next.svg"
              date="05 Jan 2026"
              location="Online"
              participants={80}
              maxParticipants={100}
              price={0}
            />
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/events">
              <Button variant="outline" className="px-6 py-2.5">Lihat Semua Event</Button>
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-zinc-50">Mengapa Memilih EsportsHub?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Platform terpercaya dengan teknologi terdepan untuk komunitas esports Indonesia
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mudah Digunakan</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interface yang intuitif dan user-friendly untuk semua kalangan
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performa Tinggi</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Teknologi cloud terdepan untuk pengalaman yang cepat dan stabil
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keamanan Terjamin</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enkripsi end-to-end dan perlindungan data tingkat enterprise
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Siap Memulai Perjalanan Esports Anda?
          </h3>
          <p className="text-white/90 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pemain dan tim yang sudah merasakan kemudahan mengelola esports dengan EsportsHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90 px-7 py-3">
                Daftar Gratis Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-7 py-3">
                Sudah Punya Akun? Login
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
