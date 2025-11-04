"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardEventsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Event Saya</h1>

      <div className="mb-6">
        <Link href="/dashboard/events/create">
          <Button>Buat Event Baru</Button>
        </Link>
      </div>

      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada event. Gunakan tombol di atas untuk membuat event.
        </p>
      </Card>
    </div>
  );
}