"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ArrowRight, Loader2 } from "lucide-react";
import { TeamCard } from "@/components/ui/team-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface Team {
  id: string;
  name: string;
  game: string;
  logo_url?: string;
  logo: string;
  description?: string;
  memberCount: number;
  achievements: number;
  isRecruiting: boolean;
  recruiting: boolean;
}

interface TeamsResponse {
  teams: Team[];
  games: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [game, setGame] = useState("");
  const [recruiting, setRecruiting] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch teams from API
  const { data, isLoading, isError, error } = useQuery<TeamsResponse>({
    queryKey: ["teams", { search: debouncedSearch, game, recruiting }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (game) params.append("game", game);
      if (recruiting) params.append("recruiting", recruiting);
      params.append("limit", "20");

      const res = await fetch(`/api/teams?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal memuat tim");
      }
      return res.json();
    },
    retry: 2,
    retryDelay: 1000,
  });

  const teams = data?.teams || [];
  const games = data?.games || [];
  const allGames = ["Semua Game", ...games];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Tim Esports</h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Jelajahi tim esports terbaik yang terdaftar di platform kami. Temukan tim yang sesuai dengan minat dan skill kamu atau bentuk tim baru untuk memulai perjalanan esports.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Cari tim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background"
            >
              {allGames.map((g) => (
                <option key={g} value={g === "Semua Game" ? "" : g}>
                  {g}
                </option>
              ))}
            </select>
            
            <select
              value={recruiting}
              onChange={(e) => setRecruiting(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background"
            >
              <option value="">Semua Tim</option>
              <option value="true">Membuka Rekrutmen</option>
            </select>
            
            <Link href="/dashboard/teams">
              <Button variant="default" className="ml-auto md:ml-0">
                Buat Tim Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Memuat tim...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="p-6 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            {(error as Error)?.message || "Gagal memuat tim. Silakan coba lagi."}
          </p>
        </Card>
      )}

      {/* Teams Grid */}
      {!isLoading && !isError && (
        <>
          {teams.length === 0 ? (
            <Card className="p-12 text-center mb-8">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold mb-2">Belum ada tim</h3>
                <p className="text-muted-foreground mb-6">
                  {debouncedSearch || game || recruiting
                    ? "Tidak ada tim yang sesuai dengan filter yang dipilih."
                    : "Belum ada tim yang terdaftar di platform. Jadilah yang pertama membuat tim!"}
                </p>
                <Link href="/dashboard/teams">
                  <Button size="lg" className="flex items-center gap-2 mx-auto">
                    Buat Tim Baru
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  id={team.id}
                  name={team.name}
                  logo={team.logo || "/images/teams/team-default.svg"}
                  game={team.game}
                  memberCount={team.memberCount}
                  achievements={team.achievements}
                  description={team.description || "Tidak ada deskripsi."}
                  isRecruiting={team.isRecruiting || team.recruiting}
                  className="h-full"
                />
              ))}
            </div>
          )}

          {/* CTA Section - Only show if there are teams */}
          {teams.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 border-none text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Tidak menemukan tim yang cocok?</h3>
                  <p className="text-gray-200">Buat tim baru dan mulai perjalanan esports kamu sekarang!</p>
                </div>
                <Link href="/dashboard/teams">
                  <Button size="lg" variant="secondary" className="flex items-center gap-2">
                    Buat Tim Baru
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}