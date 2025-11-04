"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Trophy, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">
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
              <p className="text-2xl font-semibold">0</p>
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
              <p className="text-2xl font-semibold">0</p>
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
              <p className="text-2xl font-semibold">0</p>
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
              <p className="text-2xl font-semibold">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Aksi Cepat</h2>
        <div className="flex space-x-4">
          <Link href="/admin/users">
            <Button>Kelola Pengguna</Button>
          </Link>
          <Link href="/admin/events">
            <Button>Kelola Event</Button>
          </Link>
          <Link href="/admin/content">
            <Button>Manajemen Konten</Button>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-lg font-medium mb-4">Status Sistem</h2>
        <Card className="p-6">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Semua sistem berjalan normal.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}