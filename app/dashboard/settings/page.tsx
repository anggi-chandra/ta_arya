"use client";

import { Card } from "@/components/ui/card";

export default function DashboardSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>

      <Card className="p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Halaman pengaturan akan berisi preferensi akun seperti notifikasi, privasi, dan tema.
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Konten pengaturan akan ditambahkan kemudian.</p>
        </div>
      </Card>
    </div>
  );
}