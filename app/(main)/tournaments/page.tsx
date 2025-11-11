"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tournaments');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Gagal memuat turnamen');
          return;
        }
        const data = await response.json();
        setTournaments(data.tournaments || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat turnamen');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);


  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-4">Turnamen</h1>
        <Card className="p-6">
          <p className="text-gray-500 dark:text-gray-400">Memuat turnamen...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-4">Turnamen</h1>
        <Card className="p-6">
          <p className="text-red-600 dark:text-red-400">Gagal memuat turnamen: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Coba lagi
          </button>
        </Card>
      </div>
    );
  }

  const list = tournaments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Turnamen Esports</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ikuti turnamen seru dan menangkan hadiah menarik!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((t: any) => {
          const now = new Date();
          const start = new Date(t.starts_at);
          const end = t.ends_at ? new Date(t.ends_at) : null;
          let statusLabel = "Akan Datang";
          if (t.status === 'completed') statusLabel = "Selesai";
          else if (t.status === 'ongoing') statusLabel = "Berlangsung";
          else if (t.status === 'cancelled') statusLabel = "Dibatalkan";
          else if (end && now > end) statusLabel = "Selesai";
          else if (now >= start && (!end || now <= end)) statusLabel = "Berlangsung";
          
          const statusCls = statusLabel === 'Akan Datang' || t.status === 'upcoming'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : statusLabel === 'Berlangsung' || t.status === 'ongoing'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : t.status === 'cancelled'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
          
          // For now, we don't have participant count, so set to 0
          const registered = 0;
          const max = t.max_participants || 0;
          const progress = max && registered > 0 ? Math.min((registered / max) * 100, 100) : 0;

          return (
          <Card key={t.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image 
                src={t.banner_url || "/images/hero-esports.svg"} 
                alt={t.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls}`}>
                  {t.status === 'upcoming' ? 'Akan Datang' : 
                   t.status === 'ongoing' ? 'Berlangsung' : 
                   t.status === 'completed' ? 'Selesai' : 
                   t.status === 'cancelled' ? 'Dibatalkan' : statusLabel}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t.game || 'Umum'} • {t.tournament_type?.replace('_', ' ') || ''} • {t.format || ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                {new Date(t.starts_at).toLocaleDateString('id-ID')} {t.ends_at ? `- ${new Date(t.ends_at).toLocaleDateString('id-ID')}` : ''}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                {t.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Entry Fee</p>
                  <p className="font-semibold text-green-600">
                    {t.entry_fee && t.entry_fee > 0 ? `Rp ${t.entry_fee.toLocaleString('id-ID')}` : 'Gratis'}
                  </p>
                </div>
                {t.prize_pool && t.prize_pool > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Prize Pool</p>
                    <p className="font-semibold text-yellow-600">
                      Rp {t.prize_pool.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Max Peserta</p>
                  <p className="font-semibold">{t.max_participants || '-'}</p>
                </div>
              </div>
              
              {t.max_participants && t.max_participants > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              
              <Link href={`/tournaments/${t.id}`} className="block">
                <Button className="w-full">Lihat Detail</Button>
              </Link>
            </div>
          </Card>
          );
        })}

        {list.length === 0 && (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Belum ada turnamen</h3>
              <p className="text-gray-600">Nantikan turnamen menarik segera!</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}