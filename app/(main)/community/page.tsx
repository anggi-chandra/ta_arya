"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Komunitas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bergabung, berdiskusi, dan berkembang bersama komunitas esports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Forum</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Diskusikan strategi, berita, dan hal-hal terkini.
          </p>
          <Link href="/community/forum">
            <Button>Masuk Forum</Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Tim</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Cari atau bentuk tim untuk turnamen berikutnya.
          </p>
          <Link href="/teams">
            <Button variant="outline">Lihat Tim</Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Event</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Ikuti kompetisi dan kegiatan komunitas mendatang.
          </p>
          <Link href="/events">
            <Button variant="outline">Jelajahi Event</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}