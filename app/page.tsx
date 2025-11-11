"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Gamepad2, Star, TrendingUp, Shield } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { EventCard } from "@/components/ui/event-card";
import Footer from "@/components/ui/footer";

interface Event {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  max_participants?: number;
  price_cents?: number;
  game?: string;
  event_stats?: {
    participants?: number;
  } | null;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch('/api/events?status=upcoming&limit=3');
        if (!response.ok) {
          throw new Error('Gagal memuat events');
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.error('Error playing video:', err);
      });
    }
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-black">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden text-white min-h-[500px] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              minHeight: '100%',
              pointerEvents: 'none'
            }}
            onError={(e) => {
              console.error('Video error:', e);
            }}
          >
            <source src="/hero-video-2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Fallback gradient jika video gagal dimuat */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 video-fallback hidden"></div>
          {/* Overlay untuk meningkatkan kontras teks */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Memuat events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Belum ada event yang tersedia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => {
                // Format date
                const eventDate = event.starts_at 
                  ? new Date(event.starts_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'TBA';

                // Get participants count
                const participants = event.event_stats?.participants || 0;
                const maxParticipants = event.max_participants || 0;

                // Get price
                const price = event.price_cents ? event.price_cents / 100 : 0;

                // Get image URL
                const imageUrl = event.image_url || '/images/hero-esports.svg';

                // Determine status
                const now = new Date();
                const startsAt = event.starts_at ? new Date(event.starts_at) : null;
                const endsAt = event.ends_at ? new Date(event.ends_at) : null;
                let status: "upcoming" | "ongoing" | "completed" = "upcoming";
                if (startsAt && endsAt) {
                  if (now >= startsAt && now <= endsAt) {
                    status = "ongoing";
                  } else if (now > endsAt) {
                    status = "completed";
                  }
                } else if (startsAt && now >= startsAt) {
                  status = "ongoing";
                }

                return (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description || ''}
                    game={event.game || 'General'}
                    image={imageUrl}
                    date={eventDate}
                    location={event.location || 'TBA'}
                    participants={participants}
                    maxParticipants={maxParticipants}
                    price={price}
                    status={status}
                  />
                );
              })}
            </div>
          )}

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
