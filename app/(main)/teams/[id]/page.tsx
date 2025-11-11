"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Users, Trophy, Calendar, User, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface TeamAchievement {
  id: string;
  title: string;
  description?: string;
  achievement_date: string;
  rank_position?: number;
  tournament_name?: string;
}

interface TeamDetail {
  id: string;
  name: string;
  game: string;
  logo_url?: string;
  logo: string;
  description?: string;
  recruiting: boolean;
  isRecruiting: boolean;
  created_at: string;
  owner_id?: string;
  owner?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
  };
  members: TeamMember[];
  achievements: TeamAchievement[];
  memberCount: number;
  achievementCount: number;
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setError('Team ID is missing');
      setIsLoading(false);
      return;
    }

    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/teams/${teamId}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch team');
        }

        const data = await response.json();
        setTeam(data.team);
      } catch (err: any) {
        console.error('Error fetching team data:', err);
        setError(err.message || 'Failed to load team details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'captain':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Pemilik';
      case 'captain':
        return 'Kapten';
      case 'member':
        return 'Anggota';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Memuat detail tim...</p>
        </Card>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            {error || 'Tim tidak ditemukan.'}
          </p>
          <Link href="/teams" className="text-blue-600 hover:underline mt-4 inline-block">
            Kembali ke Daftar Tim
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="relative rounded-lg overflow-hidden h-64 mb-8 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 p-6 z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
              <Image
                src={team.logo}
                alt={`${team.name} logo`}
                width={80}
                height={80}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/teams/team-default.svg";
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm text-white">
                  {team.game}
                </span>
                {team.isRecruiting && (
                  <span className="bg-green-600 px-3 py-1 rounded-full text-sm text-white">
                    Membuka Rekrutmen
                  </span>
                )}
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {team.memberCount} Anggota
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {team.achievementCount} Prestasi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Team Info */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Tentang Tim</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
            {team.description || 'Tidak ada deskripsi tersedia.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Game:</p>
              <p className="font-medium">{team.game}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Status Rekrutmen:</p>
              <p className="font-medium">
                {team.isRecruiting ? (
                  <span className="text-green-600">Membuka Rekrutmen</span>
                ) : (
                  <span className="text-gray-600">Tutup Rekrutmen</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Tanggal Dibuat:</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(team.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Total Anggota:</p>
              <p className="font-medium">{team.memberCount} Anggota</p>
            </div>
          </div>
        </Card>

        {/* Owner Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Pemilik Tim</h2>
          {team.owner ? (
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted mb-3">
                {team.owner.avatar_url ? (
                  <Image
                    src={team.owner.avatar_url}
                    alt={team.owner.full_name || team.owner.username || 'Owner'}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold text-xl">
                    {(team.owner.full_name || team.owner.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">
                {team.owner.full_name || team.owner.username || 'Unknown'}
              </h3>
              {team.owner.username && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  @{team.owner.username}
                </p>
              )}
              {team.owner.bio && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {team.owner.bio}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Pemilik tim tidak ditemukan.</p>
          )}
        </Card>
      </div>

      {/* Team Members */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Anggota Tim ({team.memberCount})
        </h2>
        {team.members.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Belum ada anggota tim.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <div
                key={member.user_id}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {member.user?.avatar_url ? (
                      <Image
                        src={member.user.avatar_url}
                        alt={member.user.full_name || member.user.username || 'Member'}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">
                        {(member.user?.full_name || member.user?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {member.user?.full_name || member.user?.username || 'Unknown'}
                      </h3>
                      {getRoleIcon(member.role)}
                    </div>
                    {member.user?.username && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        @{member.user.username}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {getRoleLabel(member.role)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Bergabung: {new Date(member.joined_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Team Achievements */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Prestasi ({team.achievementCount})
        </h2>
        {team.achievements.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Belum ada prestasi yang tercatat.
          </p>
        ) : (
          <div className="space-y-4">
            {team.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      {achievement.rank_position && (
                        <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded text-sm font-medium">
                          Peringkat #{achievement.rank_position}
                        </span>
                      )}
                    </div>
                    {achievement.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {achievement.description}
                      </p>
                    )}
                    {achievement.tournament_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Turnamen:</strong> {achievement.tournament_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(achievement.achievement_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Back Button */}
      <div className="mt-8">
        <Link href="/teams">
          <Button variant="outline" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Daftar Tim
          </Button>
        </Link>
      </div>
    </div>
  );
}
