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
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Selamat datang, {session?.user?.email?.split("@")[0] || "User"}!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola tim, event, dan turnamen esports Anda dari dashboard ini.
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tim Saya</p>
              <p className="text-2xl font-semibold">
                {isLoadingStats ? "..." : stats?.teams || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Mendatang</p>
              <p className="text-2xl font-semibold">
                {isLoadingStats ? "..." : stats?.upcomingEvents || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900">
              <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Turnamen</p>
              <p className="text-2xl font-semibold">
                {isLoadingStats ? "..." : stats?.tournaments || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900">
              <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktivitas</p>
              <p className="text-2xl font-semibold">
                {isLoadingStats ? "..." : stats?.activity || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Info Panel */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Informasi</h2>
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Selamat datang di dashboard pengguna. Anda dapat melihat informasi tentang:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
            <li>Statistik tim dan event</li>
            <li>Aktivitas terbaru</li>
            <li>Status pendaftaran</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Untuk menambahkan atau mengubah data, silakan hubungi administrator.
          </p>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium mb-4">Aktivitas Terbaru</h2>
        <Card className="p-6">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Belum ada aktivitas terbaru.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}