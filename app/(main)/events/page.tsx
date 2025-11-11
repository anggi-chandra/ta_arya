"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy, Video, Filter, Edit, Users, GitBranch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type EventType = "turnamen" | "kompetisi" | "workshop" | "event";
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
  price_cents?: number;
}

export default function EventsPage() {
  const [filterGame, setFilterGame] = useState<string>("Semua");
  const [filterLocation, setFilterLocation] = useState<string>("Semua");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch events and tournaments data
  const { data: eventsData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        // Fetch events (without status filter to get all events)
        const eventsResponse = await fetch('/api/events', { 
          credentials: 'include' 
        });
        
        if (!eventsResponse.ok) {
          const errorData = await eventsResponse.json().catch(() => ({}));
          console.error('Error fetching events:', eventsResponse.status, errorData);
          throw new Error(errorData.error || `Failed to fetch events: ${eventsResponse.statusText}`);
        }
        
        const eventsData = await eventsResponse.json();
        const events = eventsData.events || eventsData || [];
        
        // Try to fetch tournaments (optional, don't fail if error)
        let tournaments: any[] = [];
        try {
          const tournamentsResponse = await fetch('/api/tournaments', { 
            credentials: 'include' 
          });
          if (tournamentsResponse.ok) {
            const tournamentsData = await tournamentsResponse.json();
            tournaments = tournamentsData.tournaments || tournamentsData || [];
          }
        } catch (tournamentsError) {
          console.warn('Error fetching tournaments (non-critical):', tournamentsError);
        }
        
        // Determine status based on database status field or dates
        const now = new Date();
        
        // Combine and normalize data
        const combinedEvents = [
          ...events
            .filter((e: any) => {
              // Filter out draft events from public view
              // Only show draft events if explicitly needed (for admin preview)
              return e.status !== 'draft';
            })
            .map((e: any) => {
              const startsAt = e.starts_at ? new Date(e.starts_at) : null;
              const endsAt = e.ends_at ? new Date(e.ends_at) : null;
              
              // Use database status as priority, fallback to date-based calculation
              let status: EventStatus = 'upcoming';
              
              // If database has status field, use it (map database status to EventStatus)
              if (e.status) {
                const dbStatus = e.status.toLowerCase();
                if (dbStatus === 'ongoing') {
                  status = 'ongoing';
                } else if (dbStatus === 'completed') {
                  status = 'completed';
                } else if (dbStatus === 'cancelled') {
                  // Cancelled events can be treated as completed for display
                  status = 'completed';
                } else if (dbStatus === 'upcoming') {
                  status = 'upcoming';
                } else {
                  // For any other status, determine based on dates
                  if (startsAt && endsAt) {
                    if (now >= startsAt && now <= endsAt) {
                      status = 'ongoing';
                    } else if (now > endsAt) {
                      status = 'completed';
                    } else {
                      status = 'upcoming';
                    }
                  } else if (startsAt) {
                    if (now >= startsAt) {
                      status = 'completed';
                    } else {
                      status = 'upcoming';
                    }
                  }
                }
              } else {
                // No status in database, determine based on dates
                if (startsAt && endsAt) {
                  if (now >= startsAt && now <= endsAt) {
                    status = 'ongoing';
                  } else if (now > endsAt) {
                    status = 'completed';
                  } else {
                    status = 'upcoming';
                  }
                } else if (startsAt) {
                  if (now >= startsAt) {
                    status = 'completed';
                  } else {
                    status = 'upcoming';
                  }
                }
              }
              
              return {
                ...e,
                type: 'event' as EventType,
                status,
                game: e.game || 'General',
                location: e.location || 'TBA',
                date: startsAt ? startsAt.toISOString().split('T')[0] : '',
                time: startsAt ? startsAt.toTimeString().slice(0, 5) : '',
                prizePool: e.price_cents ? `Rp ${(e.price_cents / 100).toLocaleString('id-ID')}` : undefined,
                maxParticipants: e.max_participants,
                participants: e.event_stats?.participants || 0,
                image: e.image_url || '/images/hero-esports.svg',
                liveUrl: e.live_url
              };
            }),
          ...tournaments.map((t: any) => {
            const startsAt = t.starts_at ? new Date(t.starts_at) : null;
            const endsAt = t.ends_at ? new Date(t.ends_at) : null;
            
            // Determine status
            let status: EventStatus = t.status || 'upcoming';
            if (startsAt && endsAt) {
              if (now >= startsAt && now <= endsAt) {
                status = 'ongoing';
              } else if (now > endsAt) {
                status = 'completed';
              }
            }
            
            return {
              ...t,
              type: 'turnamen' as EventType,
              status,
              game: t.game || 'General',
              location: t.location || 'TBA',
              date: startsAt ? startsAt.toISOString().split('T')[0] : '',
              time: startsAt ? startsAt.toTimeString().slice(0, 5) : '',
              prizePool: t.prize_pool ? `Rp ${t.prize_pool.toLocaleString('id-ID')}` : undefined,
              maxParticipants: t.max_participants,
              participants: t.event_stats?.participants || 0,
              image: t.banner_url || '/images/hero-esports.svg'
            };
          })
        ];
        
        console.log('Fetched events:', { 
          eventsCount: events.length, 
          tournamentsCount: tournaments.length, 
          total: combinedEvents.length,
          upcoming: combinedEvents.filter(e => e.status === 'upcoming').length,
          ongoing: combinedEvents.filter(e => e.status === 'ongoing').length,
          completed: combinedEvents.filter(e => e.status === 'completed').length
        });
        
        // Log events with status='ongoing' from database
        const ongoingFromDB = events.filter((e: any) => e.status === 'ongoing');
        if (ongoingFromDB.length > 0) {
          console.log('Events with status=ongoing from database:', ongoingFromDB.map((e: any) => ({
            id: e.id,
            title: e.title,
            status: e.status,
            starts_at: e.starts_at,
            ends_at: e.ends_at
          })));
        }
        
        return combinedEvents;
      } catch (err: any) {
        console.error('Error in fetchEvents queryFn:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  // Check if user is admin
  useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          setIsAdmin(user.roles?.includes('admin') || user.role === 'admin');
        }
      } catch (error) {
        console.warn('Error checking user role:', error);
      }
    }
  });

  const resetFilters = () => {
    setFilterGame("Semua");
    setFilterLocation("Semua");
    setFilterType("Semua");
  };

  const games = useMemo(
    () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.game).filter(Boolean)))],
    [eventsData]
  );
  const locations = useMemo(
    () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.location).filter(Boolean)))],
    [eventsData]
  );
  const types = useMemo(
    () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.type).filter(Boolean)))],
    [eventsData]
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
        <Card className="p-6 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex flex-col gap-2">
            <p className="text-red-600 dark:text-red-400 font-medium">Gagal memuat data event</p>
            <p className="text-red-500 dark:text-red-300 text-sm">
              {(error as Error).message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}
            </p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline self-start"
            >
              Coba lagi
            </button>
          </div>
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
        {!isLoading && !error && ongoingEvents.length === 0 ? (
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
                    <Link href={`/events/${e.id}/tickets`}>
                      <Button variant="outline">Beli Tiket</Button>
                    </Link>
                    <Link href={`/events/${e.id}`}>
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
        {!isLoading && !error && upcomingEvents.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-600 dark:text-gray-400">
              {eventsData.length === 0 
                ? 'Tidak ada event. Buat event pertama Anda melalui admin panel.'
                : 'Tidak ada event yang akan datang sesuai filter.'}
            </p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{e.description}</p>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{e.date} • {e.time} WIB</div>
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{e.location}</div>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/events/${e.id}/tickets`}>
                      <Button size="sm" className="">Beli Tiket</Button>
                    </Link>
                    <Link href={`/events/${e.id}`}>
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
        {!isLoading && !error && completedEvents.length === 0 ? (
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

                {/* Tombol Aksi */}
                <div className="flex gap-3 mt-4">
                  <Link href={`/events/${e.id}`}>
                    <Button size="sm" variant="outline">Lihat Detail</Button>
                  </Link>
                  {e.bracket && (
                    <Link href={`/events/${e.id}/bracket`}>
                      <Button size="sm" variant="ghost">Lihat Bracket</Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
