"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy, Video, Filter, Edit, Users, GitBranch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type EventType = "turnamen" | "kompetisi" | "workshop";
type EventStatus = "upcoming" | "ongoing" | "completed";

interface EventItem {
  id: string;
  title: string;
  game: string;
  description: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  location: string;
  type: EventType;
  status: EventStatus;
  prizePool?: string;
  image?: string;
  participants?: number;
  maxParticipants?: number;
  liveUrl?: string;
  winners?: { team: string; prize?: string }[];
  bracket?: any[];
  prize_pool?: number;
  max_participants?: number;
  starts_at?: string;
  ends_at?: string;
  image_url?: string;
  event_stats?: { participants?: number } | null;
}

// Fetch events from API
async function fetchEvents() {
  const res = await fetch('/api/events', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat events');
  return res.json();
}

// Fetch tournaments from API  
async function fetchTournaments() {
  const res = await fetch('/api/tournaments', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat tournaments');
  return res.json();
}

const eventsData: EventItem[] = [
  {
    id: "mlbb-champ-2025",
    title: "MLBB National Championship 2025",
    game: "Mobile Legends",
    description: "Turnamen nasional resmi MLBB untuk mencari juara Indonesia.",
    date: "2025-12-05",
    time: "13:00",
    location: "Jakarta",
    type: "turnamen",
    status: "upcoming",
    prizePool: "Rp 300.000.000",
    image: "/images/hero-esports.svg",
    participants: 64,
    maxParticipants: 128,
  },
  {
    id: "valo-indo-open",
    title: "Valorant Indonesia Open",
    game: "Valorant",
    description: "Open qualifier untuk tim Valorant seluruh Indonesia.",
    date: "2025-11-20",
    time: "19:00",
    location: "Bandung",
    type: "kompetisi",
    status: "ongoing",
    prizePool: "Rp 150.000.000",
    liveUrl: "https://twitch.tv/esportsindo",
    image: "/images/hero-esports.svg",
    participants: 32,
    maxParticipants: 32,
  },
  {
    id: "pubgm-pro-league-s6",
    title: "PUBGM Pro League S6",
    game: "PUBG Mobile",
    description: "Liga profesional PUBG Mobile Indonesia Season 6.",
    date: "2025-11-28",
    time: "18:00",
    location: "Surabaya",
    type: "turnamen",
    status: "upcoming",
    prizePool: "Rp 500.000.000",
    image: "/images/hero-esports.svg",
    participants: 20,
    maxParticipants: 20,
  },
  {
    id: "creator-workshop-ff",
    title: "Free Fire Creator Workshop",
    game: "Free Fire",
    description: "Workshop konten kreator dan strategi kompetitif Free Fire.",
    date: "2025-10-10",
    time: "10:00",
    location: "Online",
    type: "workshop",
    status: "completed",
    image: "/images/hero-esports.svg",
    winners: [
      { team: "Top Content Award - @NandoFF" },
      { team: "Strategy MVP - Team Phoenix" },
    ],
  },
  {
    id: "dota2-kompetitif-series",
    title: "DOTA 2 Kompetitif Series",
    game: "DOTA 2",
    description: "Kompetisi komunitas DOTA 2 untuk tim semi-pro.",
    date: "2025-09-20",
    time: "17:00",
    location: "Yogyakarta",
    type: "kompetisi",
    status: "completed",
    prizePool: "Rp 50.000.000",
    image: "/images/hero-esports.svg",
    winners: [
      { team: "Juara 1 - ONIC Beta", prize: "Rp 25.000.000" },
      { team: "Juara 2 - RRQ Academy", prize: "Rp 15.000.000" },
      { team: "Juara 3 - EVOS Young", prize: "Rp 10.000.000" },
    ],
  },
];

export default function EventsPage() {
  const [filterGame, setFilterGame] = useState<string>("Semua");
  const [filterLocation, setFilterLocation] = useState<string>("Semua");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch events and tournaments data
  const { data: eventsData = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const [eventsRes, tournamentsRes] = await Promise.all([
        fetch('/api/events', { credentials: 'include' }).then(res => res.json()),
        fetch('/api/tournaments', { credentials: 'include' }).then(res => res.json())
      ]);
      
      const events = eventsRes.events || eventsRes || [];
      const tournaments = tournamentsRes.tournaments || tournamentsRes || [];
      
      // Combine and normalize data
      const combinedEvents = [
        ...events.map((e: any) => ({
          ...e,
          type: 'event',
          status: e.status || 'upcoming',
          game: e.game || 'General',
          date: e.starts_at ? new Date(e.starts_at).toISOString().split('T')[0] : '',
          time: e.starts_at ? new Date(e.starts_at).toTimeString().slice(0, 5) : '',
          prizePool: e.prize_pool ? `Rp ${e.prize_pool.toLocaleString()}` : undefined,
          maxParticipants: e.max_participants,
          participants: e.event_stats?.participants || 0,
          image: e.image_url || '/images/hero-esports.svg'
        })),
        ...tournaments.map((t: any) => ({
          ...t,
          type: 'turnamen',
          status: t.status || 'upcoming',
          game: t.game || 'General',
          date: t.starts_at ? new Date(t.starts_at).toISOString().split('T')[0] : '',
          time: t.starts_at ? new Date(t.starts_at).toTimeString().slice(0, 5) : '',
          prizePool: t.prize_pool ? `Rp ${t.prize_pool.toLocaleString()}` : undefined,
          maxParticipants: t.max_participants,
          participants: t.event_stats?.participants || 0,
          image: t.image_url || '/images/hero-esports.svg'
        }))
      ];
      
      return combinedEvents;
    }
  });

  // Check if user is admin
  useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        setIsAdmin(user.role === 'admin');
      }
    }
  });

  const resetFilters = () => {
    setFilterGame("Semua");
    setFilterLocation("Semua");
    setFilterType("Semua");
  };

  const games = useMemo(
    () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.game)))],
    []
  );
  const locations = useMemo(
    () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.location)))],
    []
  );
  const types = useMemo(
    () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.type)))],
    []
  );

  const matchesFilter = (e: EventItem) => {
    const gameOk = filterGame === "Semua" || e.game === filterGame;
    const locationOk = filterLocation === "Semua" || e.location === filterLocation;
    const typeOk = filterType === "Semua" || e.type === filterType;
    return gameOk && locationOk && typeOk;
  };

  const ongoingEvents = eventsData.filter((e) => e.status === "ongoing" && matchesFilter(e));
  const upcomingEvents = eventsData.filter((e) => e.status === "upcoming" && matchesFilter(e));
  const completedEvents = eventsData.filter((e) => e.status === "completed" && matchesFilter(e));

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Event Esports</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/admin/events">
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Event
              </Button>
            </Link>
          )}
          <Link href="/dashboard/events">
            <Button variant="outline">Kelola Event</Button>
          </Link>
        </div>
      </div>

      {/* Filter Event */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filter Event</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Game</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
            >
              {games.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Lokasi</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Jenis</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" onClick={resetFilters} className="w-full">
              Reset Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6 mb-8">
          <p className="text-gray-600 dark:text-gray-400">Memuat data event...</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 mb-8">
          <p className="text-red-500">Gagal memuat data event. Silakan coba lagi.</p>
        </Card>
      )}

      {/* Event yang Sedang Berlangsung */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Event yang Sedang Berlangsung</h2>
          {ongoingEvents.length > 0 && (
            <Link href="/events">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          )}
        </div>
        {ongoingEvents.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-600 dark:text-gray-400">
              Saat ini tidak ada event yang sedang berlangsung.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ongoingEvents.map((e) => (
              <Card key={e.id} className="overflow-hidden shadow-sm hover:shadow-md">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-80 mb-1">{e.game} • {e.type.toUpperCase()}</div>
                      <h3 className="text-xl font-bold">{e.title}</h3>
                    </div>
                    {e.prizePool && (
                      <div className="px-3 py-1 bg-white/20 rounded-md text-sm">Prize Pool: {e.prizePool}</div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{e.date} • {e.time} WIB</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{e.location}</span>
                    </div>
                    {e.prizePool && (
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>{e.prizePool}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {e.liveUrl && (
                      <Link href={e.liveUrl} target="_blank">
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Video className="h-4 w-4 mr-2" /> Tonton Live
                        </Button>
                      </Link>
                    )}
                    <Link href={`/register?for=event&id=${e.id}`}>
                      <Button variant="outline">Daftar Event</Button>
                    </Link>
                    <Link href={`/events`}>
                      <Button variant="ghost">Lihat Detail</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Daftar Event Terbaru */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Daftar Event Terbaru</h2>
          {upcomingEvents.length > 0 && (
            <Link href="/tournaments">
              <Button variant="outline">Lihat Turnamen</Button>
            </Link>
          )}
        </div>
        {upcomingEvents.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-600 dark:text-gray-400">Tidak ada event yang akan datang sesuai filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((e) => (
              <Card key={e.id} className="overflow-hidden group h-full shadow-sm hover:shadow-md">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {e.game}
                    </span>
                    {e.prizePool && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                        {e.prizePool}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{e.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{e.description}</p>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{e.date} • {e.time} WIB</div>
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{e.location}</div>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/register?for=event&id=${e.id}`}>
                      <Button size="sm" className="">Daftar</Button>
                    </Link>
                    <Link href={`/events`}>
                      <Button size="sm" variant="outline">Detail</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Pendaftaran Event */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pendaftaran Event</h2>
        <Card className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Pilih kategori pendaftaran sesuai kebutuhan Anda. Untuk info lebih lanjut, kunjungi halaman pendaftaran.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Turnamen Kompetitif</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Untuk tim profesional dan semi-pro.</p>
              <Link href="/register?for=event&type=kompetitif">
                <Button className="w-full">Daftar Kompetitif</Button>
              </Link>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Turnamen Kasual</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Untuk pemain komunitas dan fun match.</p>
              <Link href="/register?for=event&type=kasual">
                <Button className="w-full" variant="outline">Daftar Kasual</Button>
              </Link>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Workshop</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Pelatihan dan seminar esports.</p>
              <Link href="/register?for=event&type=workshop">
                <Button className="w-full" variant="ghost">Daftar Workshop</Button>
              </Link>
            </Card>
          </div>
        </Card>
      </section>

      {/* Hasil Event */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Hasil Event</h2>
          {completedEvents.length > 0 && (
            <Link href="/blog">
              <Button variant="outline">Baca Highlight</Button>
            </Link>
          )}
        </div>
        {completedEvents.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-600 dark:text-gray-400">Belum ada hasil event.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedEvents.map((e) => (
              <Card key={e.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{e.game} • {e.type.toUpperCase()}</div>
                    <h3 className="text-xl font-bold mb-2">{e.title}</h3>
                  </div>
                  {e.prizePool && (
                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-sm font-semibold">
                      Prize Pool {e.prizePool}
                    </div>
                  )}
                </div>
                
                {/* Detail Event */}
                <div className="space-y-3 mb-6 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                    <span>{e.date} • {e.time} WIB</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-green-500" />
                    <span>{e.location}</span>
                  </div>
                  {e.maxParticipants && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-3 text-purple-500" />
                      <span>Max {e.maxParticipants} peserta</span>
                    </div>
                  )}
                  {e.bracket && (
                    <div className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-3 text-orange-500" />
                      <span>Format: {e.bracket}</span>
                    </div>
                  )}
                </div>

                {/* Pemenang */}
                {e.winners && e.winners.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                      Pemenang
                    </h4>
                    <div className="space-y-2">
                      {e.winners.map((w: { team: string; prize?: string }, i: number) => (
                        <div key={`${e.id}-winner-${i}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-xs font-bold text-yellow-700 dark:text-yellow-300 mr-3">
                              {i + 1}
                            </span>
                            <span className="font-medium">{w.team}</span>
                          </div>
                          {w.prize && (
                            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                              {w.prize}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tombol Aksi */}
                <div className="flex gap-3 mt-4">
                  <Link href={`/events/${e.id}`}>
                    <Button size="sm" variant="outline">Lihat Detail</Button>
                  </Link>
                  <Link href={`/events/${e.id}/bracket`}>
                    <Button size="sm" variant="ghost">Lihat Bracket</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}