"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { TournamentBracket } from "@/components/ui/tournament-bracket";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournamentId = params.id;
  const { data: session } = useSession();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<any | null>(null);
  const [registeredCount, setRegisteredCount] = useState<number>(0);
  
  // Data dummy untuk fallback UI
  const tournamentDetail = {
    id: tournamentId,
    name: "Turnamen",
    game: "Mobile Legends",
    format: "5v5",
    date: "-",
    time: "-",
    location: "Jakarta",
    prize: "-",
    registrationDeadline: "10 Desember 2023",
    maxTeams: 32,
    registeredTeams: 24,
    description: "Turnamen Mobile Legends terbesar di Indonesia dengan hadiah total Rp 50.000.000. Turnamen ini akan diselenggarakan secara offline di Jakarta dengan format 5v5. Daftarkan tim kamu sekarang juga!",
    rules: [
      "Setiap tim terdiri dari 5 pemain utama dan 1 pemain cadangan",
      "Semua pemain harus berusia minimal 16 tahun",
      "Setiap tim harus hadir 30 menit sebelum jadwal pertandingan",
      "Format pertandingan adalah Best of 3 untuk babak penyisihan dan Best of 5 untuk final",
      "Keputusan panitia bersifat mutlak dan tidak dapat diganggu gugat"
    ],
    schedule: [
      { round: "Babak Penyisihan", date: "15 Desember 2023", time: "14:00 - 18:00 WIB" },
      { round: "Perempat Final", date: "16 Desember 2023", time: "13:00 - 16:00 WIB" },
      { round: "Semi Final", date: "16 Desember 2023", time: "16:30 - 19:00 WIB" },
      { round: "Final", date: "17 Desember 2023", time: "15:00 - 18:00 WIB" }
    ],
    teams: [
      { id: 1, name: "EVOS Legends", logo: "/images/hero-esports.svg", members: 5 },
      { id: 2, name: "RRQ Hoshi", logo: "/images/hero-esports.svg", members: 5 },
      { id: 3, name: "Alter Ego", logo: "/images/hero-esports.svg", members: 5 },
      { id: 4, name: "ONIC Esports", logo: "/images/hero-esports.svg", members: 5 },
      { id: 5, name: "Bigetron Alpha", logo: "/images/hero-esports.svg", members: 5 },
      { id: 6, name: "Aura Fire", logo: "/images/hero-esports.svg", members: 5 },
      { id: 7, name: "Geek Fam ID", logo: "/images/hero-esports.svg", members: 5 },
      { id: 8, name: "Rebellion Zion", logo: "/images/hero-esports.svg", members: 5 }
    ],
    bracket: [
      {
        round: "Perempat Final",
        matches: [
          { match: 1, team1: "EVOS Legends", team2: "Rebellion Zion", score: "2-0", winner: "EVOS Legends" },
          { match: 2, team1: "RRQ Hoshi", team2: "Geek Fam ID", score: "2-1", winner: "RRQ Hoshi" },
          { match: 3, team1: "Alter Ego", team2: "Aura Fire", score: "2-0", winner: "Alter Ego" },
          { match: 4, team1: "ONIC Esports", team2: "Bigetron Alpha", score: "2-1", winner: "ONIC Esports" }
        ]
      },
      {
        round: "Semi Final",
        matches: [
          { match: 5, team1: "EVOS Legends", team2: "RRQ Hoshi", score: "2-1", winner: "EVOS Legends" },
          { match: 6, team1: "Alter Ego", team2: "ONIC Esports", score: "2-0", winner: "Alter Ego" }
        ]
      },
      {
        round: "Final",
        matches: [
          { match: 7, team1: "EVOS Legends", team2: "Alter Ego", score: "3-1", winner: "EVOS Legends" }
        ]
      }
    ],
    image: "/images/hero-esports.svg",
    organizer: "ESports Hub Indonesia",
    contact: "tournament@esportshub.id",
    sponsors: ["ESports Hub", "Mobile Legends", "ROG"]
  };

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState("overview");

  // Cek status registrasi pengguna
  useEffect(() => {
    if (session) {
      checkRegistrationStatus();
    }
  }, [session, tournamentId]);

  // Fetch event data dari API dan hitung jumlah registrasi via Supabase
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const response = await fetch(`/api/events/${tournamentId}`);
        if (response.ok) {
          const { event } = await response.json();
          setEvent(event);
        }

        // Ambil jumlah peserta terdaftar
        const { count } = await supabase
          .from('event_registrations')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', tournamentId)
          .eq('status', 'registered');
        setRegisteredCount(count || 0);
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      }
    };

    fetchTournamentData();
  }, [tournamentId]);

  // Fungsi untuk memeriksa status registrasi
  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`/api/events/${tournamentId}/register`, {
        method: 'GET',
      });
      const data = await response.json();
      setIsRegistered(data.registered);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  // Fungsi untuk mendaftar turnamen
  const registerForTournament = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${tournamentId}/register`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsRegistered(true);
        alert('Berhasil mendaftar turnamen!');
      } else {
        const error = await response.json();
        alert(`Gagal mendaftar: ${error.error}`);
      }
    } catch (error) {
      console.error('Error registering for tournament:', error);
      alert('Terjadi kesalahan saat mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membatalkan pendaftaran
  const unregisterFromTournament = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${tournamentId}/register`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIsRegistered(false);
        alert('Pendaftaran dibatalkan!');
      } else {
        const error = await response.json();
        alert(`Gagal membatalkan: ${error.error}`);
      }
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      alert('Terjadi kesalahan saat membatalkan pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Turnamen */}
      <div className="relative rounded-lg overflow-hidden h-64 mb-8">
        <Image 
          src={event?.image_url || tournamentDetail.image} 
          alt={event?.title || tournamentDetail.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{event?.title || tournamentDetail.name}</h1>
          <div className="flex items-center text-white">
            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm mr-3">{(event as any)?.game || tournamentDetail.game}</span>
            <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
              {event?.starts_at ? new Date(event.starts_at).toLocaleDateString('id-ID') : tournamentDetail.date}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'teams' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('teams')}
        >
          Tim Peserta
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'bracket' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('bracket')}
        >
          Bracket
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('schedule')}
        >
          Jadwal
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'rules' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('rules')}
        >
          Peraturan
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 col-span-2">
                <h2 className="text-xl font-bold mb-4">Deskripsi Turnamen</h2>
                <p className="text-gray-700 mb-6">{event?.description || tournamentDetail.description}</p>
                
                <h3 className="text-lg font-semibold mb-3">Informasi Turnamen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-1">Game:</p>
                    <p className="font-medium">{(event as any)?.game || tournamentDetail.game}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Lokasi:</p>
                    <p className="font-medium">{event?.location || tournamentDetail.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Tanggal:</p>
                    <p className="font-medium">{event?.starts_at ? new Date(event.starts_at).toLocaleDateString('id-ID') : tournamentDetail.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Waktu:</p>
                    <p className="font-medium">{event?.starts_at ? new Date(event.starts_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : tournamentDetail.time}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Biaya Pendaftaran:</p>
                    <p className="font-medium">{(event as any)?.price_cents ? `Rp ${(((event as any).price_cents)/100).toLocaleString('id-ID')}` : 'Gratis'}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Informasi Pendaftaran</h2>
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Batas Pendaftaran:</p>
                  <p className="font-medium">{tournamentDetail.registrationDeadline}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Slot Tim:</p>
                  <p className="font-medium">{registeredCount} / {event?.max_participants || tournamentDetail.maxTeams}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(((event?.max_participants ? (registeredCount / event.max_participants) : 0) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Penyelenggara:</p>
                  <p className="font-medium">{tournamentDetail.organizer}</p>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-1">Kontak:</p>
                  <p className="font-medium">{tournamentDetail.contact}</p>
                </div>
                {!session ? (
                  <Link href="/auth/signin" className="block w-full">
                    <span className="w-full inline-block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      Login untuk Mendaftar
                    </span>
                  </Link>
                ) : isRegistered ? (
                  <button 
                    onClick={unregisterFromTournament}
                    disabled={isLoading}
                    className="w-full text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-70"
                  >
                    {isLoading ? 'Memproses...' : 'Batalkan Pendaftaran'}
                  </button>
                ) : (
                  <button 
                    onClick={registerForTournament}
                    disabled={isLoading}
                    className="w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                  >
                    {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                  </button>
                )}
              </Card>
            </div>

            <Card className="p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Sponsor</h2>
              <div className="flex flex-wrap gap-4">
                {tournamentDetail.sponsors.map((sponsor, index) => (
                  <div key={index} className="bg-gray-100 px-4 py-2 rounded-lg">
                    {sponsor}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tim Peserta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tournamentDetail.teams.map((team) => (
                <Card key={team.id} className="p-4">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 mr-3">
                      <Image 
                        src={team.logo} 
                        alt={team.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.members} anggota</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bracket Tab */}
        {activeTab === 'bracket' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Bracket Turnamen</h2>
            <TournamentBracket bracket={tournamentDetail.bracket} />
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Jadwal Turnamen</h2>
            <div className="space-y-4">
              {tournamentDetail.schedule.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{item.round}</h3>
                      <p className="text-gray-600">{item.date}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Peraturan Turnamen</h2>
            <Card className="p-6">
              <ul className="list-disc pl-5 space-y-2">
                {tournamentDetail.rules.map((rule, index) => (
                  <li key={index} className="text-gray-700">{rule}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Link href="/tournaments" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Daftar Turnamen
        </Link>
      </div>
    </div>
  );
}