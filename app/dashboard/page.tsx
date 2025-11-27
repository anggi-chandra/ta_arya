"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Trophy, Activity } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data: session } = useSession();

  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return res.json();
    },
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Selamat datang, {session?.user?.email?.split("@")[0] || "User"}! 👋
          </h1>
          <p className="text-blue-100 max-w-2xl text-lg">
            Kelola tim, event, dan turnamen esports Anda dengan mudah dari sini.
            Siap untuk mencetak prestasi baru hari ini?
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform"></div>
        <div className="absolute right-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-24 w-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 w-fit mb-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tim Saya</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {isLoadingStats ? "..." : stats?.teams || 0}
            </p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="h-24 w-24 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 w-fit mb-4">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Mendatang</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {isLoadingStats ? "..." : stats?.upcomingEvents || 0}
            </p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="h-24 w-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-4">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Turnamen</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {isLoadingStats ? "..." : stats?.tournaments || 0}
            </p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-24 w-24 text-amber-600" />
          </div>
          <div className="relative z-10">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit mb-4">
              <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktivitas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {isLoadingStats ? "..." : stats?.activity || 0}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-none shadow-lg h-full bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Informasi Penting
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Status Akun</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Akun Anda aktif dan terverifikasi. Anda dapat mengikuti semua turnamen yang tersedia.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Panduan Cepat</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Lengkapi profil tim Anda sebelum mendaftar turnamen
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Cek notifikasi secara berkala untuk update jadwal
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Hubungi admin jika mengalami kendala teknis
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="p-6 border-none shadow-lg h-full bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Aktivitas Terbaru
            </h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada aktivitas</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Aktivitas terbaru Anda akan muncul di sini
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}