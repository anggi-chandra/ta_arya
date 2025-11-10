"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Trophy, ShieldCheck, FileText, Settings, Home, UserCog, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const quickActions = [
  { 
    name: "Kelola Pengguna", 
    href: "/admin/users", 
    icon: UserCog,
    description: "Kelola data pengguna dan peran"
  },
  { 
    name: "Kelola Event", 
    href: "/admin/events", 
    icon: Calendar,
    description: "Kelola event dan kegiatan"
  },
  { 
    name: "Kelola Turnamen", 
    href: "/admin/tournaments", 
    icon: Trophy,
    description: "Kelola turnamen dan kompetisi"
  },
  { 
    name: "Kelola Tim", 
    href: "/admin/teams", 
    icon: Gamepad2,
    description: "Kelola tim dan anggota"
  },
  { 
    name: "Manajemen Konten", 
    href: "/admin/content", 
    icon: FileText,
    description: "Kelola konten dan artikel"
  },
  { 
    name: "Pengaturan", 
    href: "/admin/settings", 
    icon: Settings,
    description: "Pengaturan sistem"
  },
  { 
    name: "Kembali ke Beranda", 
    href: "/", 
    icon: Home,
    description: "Kembali ke halaman utama"
  },
];

async function fetchStats() {
  try {
    // Fetch events count
    const eventsRes = await fetch('/api/admin/events?page=1&limit=1', {
      credentials: 'include'
    });
    const eventsData = eventsRes.ok ? await eventsRes.json() : { pagination: { total: 0 } };
    
    // Fetch users count (if API exists)
    // const usersRes = await fetch('/api/admin/users?page=1&limit=1', { credentials: 'include' });
    // const usersData = usersRes.ok ? await usersRes.json() : { pagination: { total: 0 } };
    
    return {
      events: eventsData.pagination?.total || 0,
      users: 0, // TODO: Implement users API
      tournaments: 0, // TODO: Implement tournaments API
      reports: 0, // TODO: Implement reports API
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      events: 0,
      users: 0,
      tournaments: 0,
      reports: 0,
    };
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar - Quick Actions Table */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <Card className="p-4 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Aksi Cepat
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              // Check if current path matches the action href (exact match or starts with for nested routes)
              const isActive = pathname === action.href || 
                (action.href !== "/" && pathname.startsWith(action.href));
              
              return (
                <Link key={action.href} href={action.href}>
                  <div
                    className={`
                      p-3 rounded-lg border transition-colors cursor-pointer
                      ${isActive
                        ? "bg-primary/10 border-primary text-primary dark:bg-primary/20"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isActive ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                          {action.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Pengguna
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.users || 0}
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Event
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.events || 0}
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Turnamen
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats?.tournaments || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-red-100 dark:bg-red-900">
                <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Laporan Moderasi
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
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
    </div>
  );
}