"use client";

import { Card } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dukungan</h1>
      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Butuh bantuan? Tim dukungan siap membantu Anda.
        </p>
      </Card>
    </div>
  );
}