"use client";

import { Card } from "@/components/ui/card";

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Konten</h1>
      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Kelola artikel, berita, dan konten lainnya dari sini.
        </p>
      </Card>
    </div>
  );
}