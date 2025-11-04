"use client";

import { Card } from "@/components/ui/card";

export default function AdminEventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Event</h1>
      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Kelola event esports: buat, edit, dan atur publikasi.
        </p>
      </Card>
    </div>
  );
}