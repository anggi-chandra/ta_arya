"use client";

import { Search, Filter, Users, Trophy, ArrowRight } from "lucide-react";
import { TeamCard } from "@/components/ui/team-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Data contoh untuk tim
const TEAMS_DATA = [
  {
    id: "1",
    name: "EVOS Legends",
    logo: "/images/teams/team-default.svg",
    game: "Mobile Legends",
    memberCount: 8,
    achievements: 12,
    description: "Tim profesional Mobile Legends dengan berbagai prestasi nasional dan internasional.",
    isRecruiting: true,
  },
  {
    id: "2",
    name: "BOOM Esports",
    logo: "/images/teams/team-default.svg",
    game: "Dota 2",
    memberCount: 6,
    achievements: 9,
    description: "Tim Dota 2 terkemuka di Indonesia dengan pengalaman kompetisi internasional.",
    isRecruiting: false,
  },
  {
    id: "3",
    name: "RRQ Hoshi",
    logo: "/images/teams/team-default.svg",
    game: "Mobile Legends",
    memberCount: 7,
    achievements: 15,
    description: "Tim Mobile Legends dengan sejarah prestasi yang panjang dan fanbase yang besar.",
    isRecruiting: true,
  },
  {
    id: "4",
    name: "Bigetron RA",
    logo: "/images/teams/team-default.svg",
    game: "PUBG Mobile",
    memberCount: 5,
    achievements: 11,
    description: "Tim PUBG Mobile dengan prestasi internasional dan gaya bermain agresif.",
    isRecruiting: false,
  },
  {
    id: "5",
    name: "Alter Ego",
    logo: "/images/teams/team-default.svg",
    game: "Valorant",
    memberCount: 6,
    achievements: 7,
    description: "Tim Valorant yang sedang berkembang dengan pemain-pemain berbakat.",
    isRecruiting: true,
  },
  {
    id: "6",
    name: "ONIC Esports",
    logo: "/images/teams/team-default.svg",
    game: "Mobile Legends",
    memberCount: 8,
    achievements: 10,
    description: "Tim Mobile Legends dengan strategi unik dan pemain-pemain berpengalaman.",
    isRecruiting: false,
  },
];

// Daftar game untuk filter
const GAMES = ["Semua Game", "Mobile Legends", "Dota 2", "PUBG Mobile", "Valorant", "League of Legends"];

export default function TeamsPage() {
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
              className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select className="px-4 py-2 rounded-md border border-input bg-background">
              {GAMES.map((game) => (
                <option key={game} value={game === "Semua Game" ? "" : game}>
                  {game}
                </option>
              ))}
            </select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Lainnya
            </Button>
            
            <Button variant="default" className="ml-auto md:ml-0">
              Buat Tim Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {TEAMS_DATA.map((team) => (
          <TeamCard
            key={team.id}
            id={team.id}
            name={team.name}
            logo={team.logo}
            game={team.game}
            memberCount={team.memberCount}
            achievements={team.achievements}
            description={team.description}
            isRecruiting={team.isRecruiting}
            className="h-full"
          />
        ))}
      </div>

      {/* CTA Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 border-none text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Tidak menemukan tim yang cocok?</h3>
            <p className="text-gray-200">Buat tim baru dan mulai perjalanan esports kamu sekarang!</p>
          </div>
          <Button size="lg" variant="secondary" className="flex items-center gap-2">
            Buat Tim Baru
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}