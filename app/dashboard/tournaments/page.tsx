"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardTournamentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Turnamen</h1>
        <Button variant="default">Buat Turnamen</Button>
      </div>
      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada turnamen. Mulai dengan membuat turnamen baru.
        </p>
      </Card>
    </div>
  );
}