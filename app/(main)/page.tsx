import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getEvents() {
  try {
    const supabase = getSupabaseClient();
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'draft')
      .order('starts_at', { ascending: true })
      .limit(6);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    // Get participant counts
    if (events && events.length > 0) {
      const eventIds = events.map((e: any) => e.id);
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds);

      const participantCounts: Record<string, number> = {};
      if (registrations) {
        registrations.forEach((reg: any) => {
          participantCounts[reg.event_id] = (participantCounts[reg.event_id] || 0) + 1;
        });
      }

      return events.map((event: any) => ({
        ...event,
        event_stats: {
          participants: participantCounts[event.id] || 0
        }
      }));
    }

    return events || [];
  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
}

async function getTeams() {
  try {
    const supabase = getSupabaseClient();
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        game,
        logo_url,
        description,
        recruiting,
        team_members (user_id)
      `)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return teams?.map((team: any) => ({
      ...team,
      memberCount: team.team_members?.length || 0
    })) || [];
  } catch (error) {
    console.error('Error in getTeams:', error);
    return [];
  }
}

async function getStats() {
  try {
    const supabase = getSupabaseClient();
    
    // Get total users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Get total teams
    const { count: teamCount } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true });

    // Get completed events
    const now = new Date().toISOString();
    const { count: completedEventsCount } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .lt('ends_at', now);

    return {
      users: userCount || 0,
      teams: teamCount || 0,
      completedEvents: completedEventsCount || 0
    };
  } catch (error) {
    console.error('Error in getStats:', error);
    return {
      users: 0,
      teams: 0,
      completedEvents: 0
    };
  }
}

export default async function HomePage() {
  const events = await getEvents();
  const teams = await getTeams();
  const stats = await getStats();

  // Get featured event (first upcoming event or most recent)
  const featuredEvent = events.find((e: any) => {
    const startsAt = e.starts_at ? new Date(e.starts_at) : null;
    return startsAt && startsAt > new Date();
  }) || events[0];

  // Other events (exclude featured)
  const otherEvents = events.filter((e: any) => e.id !== featuredEvent?.id).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              minHeight: '100%',
              filter: 'brightness(1.1) contrast(1.05)'
            }}
          >
            <source src="/hero-video-2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 z-10 animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 shadow-lg border border-white/20 animate-fade-in-down">
                🏆 Platform Esports #1 di Indonesia
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl animate-fade-in-up stagger-1">
                <span className="text-white">Wujudkan Impian</span>
                <span className="text-gradient-primary drop-shadow-lg"> Esports</span>
                <span className="text-white"> Anda</span>
              </h1>
              <p className="text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg animate-fade-in-up stagger-2">
                Bergabunglah dengan komunitas esports terbesar di Indonesia. Ikuti turnamen, bentuk tim impian, dan raih prestasi tertinggi dalam dunia gaming kompetitif.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Link href="/events">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                    🎮 Jelajahi Event
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold hover:scale-105">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20 animate-fade-in-up stagger-4">
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary-start">{stats.users > 0 ? `${(stats.users / 1000).toFixed(0)}K+` : '0'}</div>
                  <div className="text-sm text-gray-300">Pengguna Aktif</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary-end">{stats.completedEvents}+</div>
                  <div className="text-sm text-gray-300">Event Selesai</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-gradient-primary bg-clip-text text-transparent">{stats.teams}+</div>
                  <div className="text-sm text-gray-300">Tim Terdaftar</div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 relative animate-fade-in-right">
              <div className="relative h-96 md:h-[500px] w-full animate-float">
                <div className="absolute inset-0 bg-gradient-primary opacity-30 rounded-3xl blur-3xl animate-pulse-slow"></div>
                <Image
                  src="/images/hero-esports.svg"
                  alt="Esports Tournament"
                  fill
                  className="object-contain relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary-start/10 dark:bg-primary-start/20 rounded-full text-primary-start dark:text-primary-start text-sm font-medium mb-4 animate-scale-in">
              🔥 Event Terpopuler
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-primary animate-fade-in-up stagger-1">
              Event Terbaru & Terhangat
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-fade-in-up stagger-2">
              Jangan lewatkan kesempatan emas untuk berkompetisi di turnamen esports terbesar dan meraih hadiah jutaan rupiah!
            </p>
          </div>
          
          {/* Featured Event */}
          {featuredEvent && (
            <div className="mb-12 animate-fade-in-up stagger-3">
              <Card className="overflow-hidden bg-gradient-primary text-white border-0 shadow-2xl card-hover hover-glow">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-8 lg:p-12">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">🏆 FEATURED</span>
                      {(() => {
                        const startsAt = featuredEvent.starts_at ? new Date(featuredEvent.starts_at) : null;
                        const endsAt = featuredEvent.ends_at ? new Date(featuredEvent.ends_at) : null;
                        const now = new Date();
                        const isLive = startsAt && endsAt && now >= startsAt && now <= endsAt;
                        return isLive ? (
                          <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">LIVE</span>
                        ) : null;
                      })()}
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold mb-4">{featuredEvent.title}</h3>
                    <p className="text-lg mb-6 text-blue-100 line-clamp-2">
                      {featuredEvent.description || 'Turnamen esports terbesar dengan hadiah menarik!'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {featuredEvent.starts_at && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{new Date(featuredEvent.starts_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                      {featuredEvent.location && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>{featuredEvent.location}</span>
                        </div>
                      )}
                      {featuredEvent.price_cents && featuredEvent.price_cents > 0 && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>Rp {(featuredEvent.price_cents / 100).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <span>{featuredEvent.event_stats?.participants || 0} Peserta</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Link href={`/events/${featuredEvent.id}`}>
                        <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
                          Daftar Sekarang
                        </Button>
                      </Link>
                      <Link href={`/events/${featuredEvent.id}`}>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-[400px]">
                    <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
                    {featuredEvent.image_url ? (
                      <Image
                        src={featuredEvent.image_url}
                        alt={featuredEvent.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm text-white/90">Tonton Highlight</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Other Events Grid */}
          {otherEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherEvents.map((event: any, index: number) => {
                const startsAt = event.starts_at ? new Date(event.starts_at) : null;
                const dateStr = startsAt ? startsAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
                const now = new Date();
                const endsAt = event.ends_at ? new Date(event.ends_at) : null;
                let status: "upcoming" | "ongoing" | "completed" = "upcoming";
                
                if (startsAt && endsAt) {
                  if (now >= startsAt && now <= endsAt) {
                    status = "ongoing";
                  } else if (now > endsAt) {
                    status = "completed";
                  }
                } else if (startsAt && now >= startsAt) {
                  status = "completed";
                }

                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    {event.image_url && (
                      <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 overflow-hidden">
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                          {event.game || 'Event'}
                        </div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{dateStr}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center text-green-600 font-semibold text-sm">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span>{event.event_stats?.participants || 0} Peserta</span>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button className="w-full group-hover:bg-primary transition-colors">Daftar Event</Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Belum ada event yang tersedia.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/events">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-semibold hover:bg-primary/10 hover:border-primary hover:text-primary">
                🎯 Lihat Semua Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Teams Section */}
      {teams.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                🏆 Komunitas Terbaik
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tim & Komunitas Terdepan
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Bergabunglah dengan komunitas esports terbesar di Indonesia dan temukan tim impianmu untuk berkompetisi di level tertinggi.
              </p>
            </div>

            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tim Esports Unggulan</h3>
                <Link href="/teams">
                  <Button variant="outline" className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600">
                    Lihat Semua Tim
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {teams.map((team: any) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        {team.logo_url ? (
                          <Image
                            src={team.logo_url}
                            alt={team.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-blue-600">{team.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        {team.recruiting && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            REKRUT
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{team.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{team.description || `Tim ${team.game}`}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">👥 {team.memberCount} Anggota</span>
                          <span className="text-primary font-semibold">{team.game}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:60px_60px]"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              🚀 Bergabung Sekarang
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Siap Menjadi
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Esports Legend?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan gamer Indonesia dan mulai perjalanan esports Anda.
              Dari turnamen lokal hingga kompetisi internasional, semuanya dimulai dari sini.
            </p>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Daftar Sekarang - GRATIS
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
