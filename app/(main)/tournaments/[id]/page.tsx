"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { TournamentBracket, BracketRound } from "@/components/ui/tournament-bracket";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

type TournamentParticipant = {
  team_id: string;
  status: string;
  seed?: number | null;
  checked_in_at?: string | null;
  registered_at?: string | null;
  team?: {
    id: string;
    name: string | null;
    logo_url?: string | null;
    game?: string | null;
  } | null;
};

type TournamentMatchResponse = {
  id: string;
  round: number;
  match_number: number;
  status: string;
  score_team1: number | null;
  score_team2: number | null;
  team1?: {
    id: string;
    name: string | null;
  } | null;
  team2?: {
    id: string;
    name: string | null;
  } | null;
  winner?: {
    id: string;
    name: string | null;
  } | null;
};

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tournament, setTournament] = useState<any | null>(null);
  const [registeredCount, setRegisteredCount] = useState<number>(0);
  const [isLoadingTournament, setIsLoadingTournament] = useState(true);
  const [organizer, setOrganizer] = useState<any | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [bracketRounds, setBracketRounds] = useState<BracketRound[]>([]);
  const [isLoadingBracket, setIsLoadingBracket] = useState(true);
  
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

  const getRoundLabel = (round: number) => {
    const roundLabels: Record<number, string> = {
      1: "Babak 1",
      2: "Babak 2",
      3: "Perempat Final",
      4: "Semi Final",
      5: "Final",
    };
    return roundLabels[round] || `Round ${round}`;
  };

  const transformMatchesToBracket = (matches: TournamentMatchResponse[]): BracketRound[] => {
    if (!matches || matches.length === 0) return [];

    const grouped = new Map<number, BracketRound["matches"]>();

    matches.forEach((match) => {
      const roundMatches = grouped.get(match.round) || [];
      roundMatches.push({
        match: match.match_number,
        team1: match.team1?.name || "TBD",
        team2: match.team2?.name || "TBD",
        score:
          match.score_team1 !== null && match.score_team2 !== null
            ? `${match.score_team1}-${match.score_team2}`
            : "-",
        winner:
          match.winner?.name ||
          (match.status === "completed" ? "Menunggu konfirmasi" : "Belum dimainkan"),
      });
      grouped.set(match.round, roundMatches);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([round, matchesInRound]) => ({
        round: getRoundLabel(round),
        matches: matchesInRound.slice().sort((a, b) => a.match - b.match),
      }));
  };

  const participantStatusConfig: Record<
    string,
    { label: string; classes: string }
  > = {
    registered: {
      label: "Terdaftar",
      classes: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    checked_in: {
      label: "Check-in",
      classes: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    eliminated: {
      label: "Tersingkir",
      classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    withdrawn: {
      label: "Mengundurkan diri",
      classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
  };

  const getParticipantStatusChip = (status: string) => {
    return (
      participantStatusConfig[status] || {
        label: status || "Tidak diketahui",
        classes: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      }
    );
  };

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState("overview");

  // Helper function untuk format currency
  const formatCurrency = (amount: number, currency?: string) => {
    if (!currency || currency === 'IDR') {
      return `${amount.toLocaleString('id-ID')} IDR`;
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US')}`;
    } else {
      return `${amount.toLocaleString('id-ID')} ${currency}`;
    }
  };

  const fetchTournamentData = useCallback(async () => {
    if (!tournamentId) {
      console.error('Tournament ID is missing');
      setIsLoadingTournament(false);
      return;
    }

    try {
      setIsLoadingTournament(true);
      const timestamp = Date.now();
      const response = await fetch(`/api/tournaments/${tournamentId}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching tournament:', errorData.error || 'Failed to fetch tournament');
        console.error('Response status:', response.status);
        setTournament(null);
        setIsLoadingTournament(false);
        return;
      }

      const data = await response.json();
      const tournamentData = data.tournament;

      if (!tournamentData) {
        console.error('Tournament data is null in response');
        setTournament(null);
        setIsLoadingTournament(false);
        return;
      }

      setTournament(tournamentData);

      if (tournamentData.registeredCount !== undefined) {
        setRegisteredCount(tournamentData.registeredCount);
      } else {
        setRegisteredCount(0);
      }

      if (tournamentData.organizer) {
        setOrganizer(tournamentData.organizer);
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      setTournament(null);
    } finally {
      setIsLoadingTournament(false);
    }
  }, [tournamentId]);

  const fetchParticipants = useCallback(async () => {
    if (!tournamentId) return;
    setIsLoadingParticipants(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }

      const data = await response.json();
      const participantList: TournamentParticipant[] = data.participants || [];
      setParticipants(participantList);
      setRegisteredCount(participantList.length);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [tournamentId]);

  const fetchBracketMatches = useCallback(async () => {
    if (!tournamentId) return;
    setIsLoadingBracket(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bracket matches');
      }

      const data = await response.json();
      const matches: TournamentMatchResponse[] = data.matches || [];
      setBracketRounds(transformMatchesToBracket(matches));
    } catch (error) {
      console.error('Error fetching bracket matches:', error);
      setBracketRounds([]);
    } finally {
      setIsLoadingBracket(false);
    }
  }, [tournamentId]);

  // Fungsi untuk memeriksa status registrasi
  const checkRegistrationStatus = useCallback(async () => {
    if (!session?.user || !tournamentId) return;
    
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register/status`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsRegistered(data.isRegistered || false);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsRegistered(false);
    }
  }, [session?.user, tournamentId]);

  // Check registration status using API
  useEffect(() => {
    if (session?.user && tournamentId) {
      checkRegistrationStatus();
    }
  }, [session, tournamentId, checkRegistrationStatus]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  useEffect(() => {
    fetchParticipants();
    fetchBracketMatches();
  }, [fetchParticipants, fetchBracketMatches]);

  // Fungsi untuk mendaftar turnamen
  const registerForTournament = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      // First, check if user has teams
      const teamsRes = await fetch('/api/teams/my-teams', {
        credentials: 'include'
      });

      if (!teamsRes.ok) {
        throw new Error('Gagal memuat daftar tim');
      }

      const teamsData = await teamsRes.json();
      const userTeams = teamsData.teams || [];

      if (userTeams.length === 0) {
        alert('Untuk mendaftar turnamen, Anda perlu memiliki tim. Silakan buat tim terlebih dahulu.');
        router.push('/teams');
        return;
      }

      // If user has multiple teams, let them choose (for now, use first team)
      // TODO: Implement team selection UI
      const selectedTeam = userTeams.find((t: any) => t.role === 'owner' || t.role === 'captain') || userTeams[0];

      // Register team for tournament
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          team_id: selectedTeam.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mendaftar tournament');
      }

      const data = await res.json();
      setIsRegistered(true);
      await fetchTournamentData();
      await fetchParticipants();
      
      alert(data.message || 'Tim berhasil mendaftar untuk tournament!');
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      alert(error.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membatalkan pendaftaran
  const unregisterFromTournament = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal membatalkan pendaftaran');
      }

      const data = await res.json();
      setIsRegistered(false);
      await fetchTournamentData();
      await fetchParticipants();
      
      alert(data.message || 'Pendaftaran berhasil dibatalkan!');
    } catch (error: any) {
      console.error('Error unregistering from tournament:', error);
      alert(error.message || 'Terjadi kesalahan saat membatalkan pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTournament) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Memuat detail turnamen...</p>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Turnamen tidak ditemukan.</p>
          <Link href="/tournaments" className="text-blue-600 hover:underline mt-4 inline-block">
            Kembali ke Daftar Turnamen
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Turnamen */}
      <div className="relative rounded-lg overflow-hidden h-64 mb-8">
        <Image 
          src={tournament.banner_url || tournamentDetail.image} 
          alt={tournament.title || tournamentDetail.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{tournament.title || tournamentDetail.name}</h1>
          <div className="flex items-center text-white flex-wrap gap-2">
            {tournament.game && (
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">{tournament.game}</span>
            )}
            {tournament.tournament_type && (
              <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                {tournament.tournament_type.replace('_', ' ')}
              </span>
            )}
            {tournament.format && (
              <span className="bg-orange-600 px-3 py-1 rounded-full text-sm">{tournament.format}</span>
            )}
            {tournament.starts_at && (
              <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                {new Date(tournament.starts_at).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            )}
            {tournament.status && (
              <span className={`px-3 py-1 rounded-full text-sm ${
                tournament.status === 'upcoming' ? 'bg-yellow-600' :
                tournament.status === 'ongoing' ? 'bg-green-600' :
                tournament.status === 'completed' ? 'bg-gray-600' :
                'bg-red-600'
              }`}>
                {tournament.status === 'upcoming' ? 'Akan Datang' :
                 tournament.status === 'ongoing' ? 'Berlangsung' :
                 tournament.status === 'completed' ? 'Selesai' :
                 'Dibatalkan'}
              </span>
            )}
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
                <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                  {tournament.description || 'Tidak ada deskripsi tersedia.'}
                </p>
                
                <h3 className="text-lg font-semibold mb-3">Informasi Turnamen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Game:</p>
                    <p className="font-medium">{tournament.game || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Tipe Turnamen:</p>
                    <p className="font-medium">
                      {tournament.tournament_type 
                        ? tournament.tournament_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Format:</p>
                    <p className="font-medium">{tournament.format || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Lokasi:</p>
                    <p className="font-medium">{tournament.location || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Tanggal & Waktu Mulai:</p>
                    <p className="font-medium">
                      {tournament.starts_at 
                        ? `${new Date(tournament.starts_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            weekday: 'long'
                          })} pukul ${new Date(tournament.starts_at).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })} WIB`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Tanggal & Waktu Selesai:</p>
                    <p className="font-medium">
                      {tournament.ends_at 
                        ? `${new Date(tournament.ends_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            weekday: 'long'
                          })} pukul ${new Date(tournament.ends_at).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })} WIB`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Entry Fee:</p>
                    <p className="font-medium">
                      {tournament.entry_fee && tournament.entry_fee > 0 
                        ? formatCurrency(tournament.entry_fee, tournament.currency)
                        : 'Gratis'}
                    </p>
                  </div>
                  {tournament.prize_pool !== undefined && tournament.prize_pool !== null && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Prize Pool:</p>
                      <p className="font-medium text-yellow-600">
                        {typeof tournament.prize_pool === 'number' 
                          ? formatCurrency(tournament.prize_pool, tournament.currency)
                          : tournament.prize_pool}
                      </p>
                    </div>
                  )}
                  {tournament.status && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Status:</p>
                      <p className="font-medium">
                        <span className={`px-2 py-1 rounded text-sm ${
                          tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          tournament.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          tournament.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {tournament.status === 'upcoming' ? 'Akan Datang' :
                           tournament.status === 'ongoing' ? 'Berlangsung' :
                           tournament.status === 'completed' ? 'Selesai' :
                           'Dibatalkan'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Informasi Pendaftaran</h2>
                {tournament.registration_deadline && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Batas Pendaftaran:</p>
                    <p className="font-medium">
                      {new Date(tournament.registration_deadline).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        weekday: 'long'
                      })} pukul {new Date(tournament.registration_deadline).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })} WIB
                    </p>
                    {/* Pendaftaran ditutup hanya jika turnamen sudah dimulai */}
                    {tournament.starts_at && new Date(tournament.starts_at) <= new Date() && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        Pendaftaran sudah ditutup
                      </p>
                    )}
                    {/* Tampilkan peringatan jika deadline sudah lewat tapi turnamen belum dimulai */}
                    {tournament.registration_deadline && 
                     new Date(tournament.registration_deadline) < new Date() && 
                     tournament.starts_at && 
                     new Date(tournament.starts_at) > new Date() && (
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                        Batas pendaftaran sudah lewat, namun pendaftaran masih dibuka hingga turnamen dimulai
                      </p>
                    )}
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Slot Tim:</p>
                  <p className="font-medium">{registeredCount} / {tournament.max_participants || 0}</p>
                  {tournament.max_participants && tournament.max_participants > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(((registeredCount / tournament.max_participants) * 100), 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                {tournament.currency && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Mata Uang:</p>
                    <p className="font-medium">{tournament.currency}</p>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Entry Fee:</p>
                  <p className="font-medium">
                    {tournament.entry_fee && tournament.entry_fee > 0 
                      ? formatCurrency(tournament.entry_fee, tournament.currency)
                      : 'Gratis'}
                  </p>
                </div>
                {tournament.prize_pool !== undefined && tournament.prize_pool !== null && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Prize Pool:</p>
                    <p className="font-medium text-yellow-600">
                      {typeof tournament.prize_pool === 'number' 
                        ? formatCurrency(tournament.prize_pool, tournament.currency)
                        : tournament.prize_pool}
                    </p>
                  </div>
                )}
                {tournament.status && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Status Turnamen:</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded text-sm ${
                        tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        tournament.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        tournament.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tournament.status === 'upcoming' ? 'Akan Datang' :
                         tournament.status === 'ongoing' ? 'Berlangsung' :
                         tournament.status === 'completed' ? 'Selesai' :
                         'Dibatalkan'}
                      </span>
                    </p>
                  </div>
                )}
                {/* Tombol pendaftaran hanya muncul jika:
                    1. turnamen belum dimulai (starts_at > sekarang) - ini yang utama
                    2. status bukan cancelled/completed
                    Note: registration_deadline hanya sebagai informasi, bukan batas mutlak
                */}
                {(!tournament.starts_at || new Date(tournament.starts_at) > new Date())
                  && tournament.status !== 'cancelled' && tournament.status !== 'completed' && (
                  <>
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
                        disabled={isLoading || (tournament.max_participants > 0 && registeredCount >= tournament.max_participants)}
                        className="w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Memproses...' : 
                         (tournament.max_participants > 0 && registeredCount >= tournament.max_participants) 
                         ? 'Slot Penuh' 
                         : 'Daftar Sekarang'}
                      </button>
                    )}
                  </>
                )}
                {/* Tampilkan "Pendaftaran sudah ditutup" hanya jika turnamen sudah dimulai */}
                {tournament.starts_at && new Date(tournament.starts_at) <= new Date() && (
                  <div className="text-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-2 rounded-lg">
                    Pendaftaran sudah ditutup
                  </div>
                )}
              </Card>
            </div>

            {tournament.rules && tournament.rules.length > 0 && (
              <Card className="p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Ringkasan Aturan</h2>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap">
                  {tournament.rules.length > 200 
                    ? `${tournament.rules.substring(0, 200)}...` 
                    : tournament.rules}
                </p>
                {tournament.rules.length > 200 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 cursor-pointer hover:underline" onClick={() => setActiveTab('rules')}>
                    Lihat aturan lengkap di tab "Peraturan" →
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Tim Peserta ({registeredCount} / {tournament?.max_participants || 0})
            </h2>
            {isLoadingParticipants ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">Memuat daftar tim...</p>
              </Card>
            ) : participants.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Belum ada tim yang terdaftar untuk turnamen ini.</p>
                {tournament?.registration_deadline && new Date(tournament.registration_deadline) > new Date() && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Pendaftaran masih dibuka hingga {new Date(tournament.registration_deadline).toLocaleDateString('id-ID')}
                  </p>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants.map((participant) => {
                  const statusChip = getParticipantStatusChip(participant.status);
                  const teamInitial =
                    participant.team?.name?.charAt(0)?.toUpperCase() || "T";
                  return (
                    <Card key={participant.team_id} className="p-4 flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/15 text-primary font-bold flex items-center justify-center">
                        {participant.team?.logo_url ? (
                          <Image
                            src={participant.team.logo_url}
                            alt={participant.team.name || "Logo Tim"}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span>{teamInitial}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {participant.team?.name || "Tim Tidak Diketahui"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {participant.team?.game || tournament?.game || "-"}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusChip.classes}`}>
                            {statusChip.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          {participant.seed !== null && participant.seed !== undefined && (
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              Seed #{participant.seed}
                            </span>
                          )}
                          {participant.checked_in_at && (
                            <span>
                              Check-in:{" "}
                              {new Date(participant.checked_in_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {participant.registered_at && (
                            <span>
                              Terdaftar:{" "}
                              {new Date(participant.registered_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bracket Tab */}
        {activeTab === 'bracket' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Bracket Turnamen</h2>
            {isLoadingBracket ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">Memuat bracket...</p>
              </Card>
            ) : bracketRounds.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Bracket belum tersedia. Tim akan muncul secara otomatis setelah jadwal pertandingan dibuat oleh panitia.
                </p>
              </Card>
            ) : (
              <TournamentBracket bracket={bracketRounds} />
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Jadwal Turnamen</h2>
            <div className="space-y-4">
              {tournament?.registration_deadline && (
                <Card className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="font-semibold text-lg">Batas Pendaftaran</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(tournament.registration_deadline).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        {new Date(tournament.registration_deadline).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })} WIB
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
                        Deadline
                      </span>
                    </div>
                  </div>
                </Card>
              )}
              
              {tournament?.starts_at && (
                <Card className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="font-semibold text-lg">Mulai Turnamen</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(tournament.starts_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        {new Date(tournament.starts_at).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })} WIB
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                        Mulai
                      </span>
                    </div>
                  </div>
                </Card>
              )}
              
              {tournament?.ends_at && (
                <Card className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="font-semibold text-lg">Selesai Turnamen</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(tournament.ends_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        {new Date(tournament.ends_at).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })} WIB
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-sm">
                        Selesai
                      </span>
                    </div>
                  </div>
                </Card>
              )}
              
              {!tournament?.starts_at && !tournament?.ends_at && !tournament?.registration_deadline && (
                <Card className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Jadwal turnamen belum tersedia.</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Peraturan Turnamen</h2>
            <Card className="p-6">
              {tournament.rules && tournament.rules.length > 0 ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans text-base leading-relaxed">
                    {tournament.rules}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Tidak ada peraturan yang tersedia untuk turnamen ini.</p>
              )}
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