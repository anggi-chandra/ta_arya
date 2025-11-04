"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardTeamsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tim Saya</h1>

      <div className="mb-6">
        <Link href="/dashboard/teams/create">
          <Button>Buat Tim Baru</Button>
        </Link>
      </div>

      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada tim. Buat tim baru untuk mulai berkolaborasi.
        </p>
      </Card>
    </div>
  );
}