"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Trophy, ShieldCheck, FileText, Settings, Gamepad2, MessageSquare, Ticket } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";


async function fetchStats() {
  try {
    // Fetch events count
    const eventsRes = await fetch('/api/admin/events?page=1&limit=1', {
      credentials: 'include'
    });
    const eventsData = eventsRes.ok ? await eventsRes.json() : { pagination: { total: 0 } };
    
    // Fetch users count
    const usersRes = await fetch('/api/admin/users?page=1&limit=1', { 
      credentials: 'include' 
    });
    const usersData = usersRes.ok ? await usersRes.json() : { pagination: { total: 0 } };
    
    // Fetch tournaments count
    const tournamentsRes = await fetch('/api/admin/tournaments?page=1&limit=1', {
      credentials: 'include'
    });
    
    let tournamentsData = { pagination: { total: 0 } };
    if (tournamentsRes.ok) {
      tournamentsData = await tournamentsRes.json();
      console.log('Tournaments API response:', tournamentsData);
    } else {
      const errorText = await tournamentsRes.text();
      console.error('Error fetching tournaments:', tournamentsRes.status, errorText);
    }
    
    // Fetch teams count
    const teamsRes = await fetch('/api/admin/teams?page=1&limit=1', {
      credentials: 'include'
    });
    
    let teamsData = { pagination: { total: 0 } };
    if (teamsRes.ok) {
      teamsData = await teamsRes.json();
      console.log('Teams API response:', teamsData);
    } else {
      const errorText = await teamsRes.text();
      console.error('Error fetching teams:', teamsRes.status, errorText);
    }
    
    const stats = {
      events: eventsData.pagination?.total || 0,
      users: usersData.pagination?.total || 0,
      tournaments: tournamentsData.pagination?.total || 0,
      teams: teamsData.pagination?.total || 0,
      reports: 0, // TODO: Implement reports API
    };
    
    console.log('Dashboard stats:', stats);
    
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      events: 0,
      users: 0,
      tournaments: 0,
      teams: 0,
      reports: 0,
    };
  }
}

function AdminDashboardContent() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="flex-1 min-w-0 space-y-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Selamat datang, {session?.user?.email?.split("@")[0] || "Admin"}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola pengguna, konten, dan pengaturan sistem dari dashboard ini.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 h-full hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Total Pengguna
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.users || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 h-full hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Total Event
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.events || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 h-full hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex-shrink-0">
                <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Total Turnamen
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.tournaments || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 h-full hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex-shrink-0">
                <Gamepad2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Total Tim
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.teams || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 h-full hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50 flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Laporan Moderasi
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.reports || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Status Sistem
          </h2>
          <Card className="p-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Semua sistem berjalan normal.</p>
            </div>
          </Card>
        </div>
    </div>
  );
}

// Dynamic import with no SSR to avoid usePathname context issues
const AdminDashboardClient = dynamic(() => Promise.resolve(AdminDashboardContent), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, idx) => (
          <Card key={idx} className="p-5 h-full">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
});

export default function AdminDashboard() {
  return <AdminDashboardClient />;
}
