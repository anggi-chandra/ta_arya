"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Video, 
  Clock, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  game: string;
  location: string;
  starts_at: string;
  ends_at?: string;
  max_participants?: number;
  price_cents?: number;
  image_url?: string;
  tournament_id?: string;
  tournament_banner_url?: string;
  is_using_tournament_banner?: boolean;
  live_url?: string;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  event_stats?: {
    participants: number;
  };
  created_at: string;
  created_by?: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const eventId = params.id as string;

  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch event data
  const { data: eventData, isLoading, error, refetch } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch event');
      }

      const data = await res.json();
      return data.event as EventDetail;
    },
    retry: 2,
    retryDelay: 1000
  });

  // Check if user is registered
  useEffect(() => {
    if (session?.user && eventId) {
      checkRegistrationStatus();
    }
  }, [session, eventId]);

  const checkRegistrationStatus = async () => {
    if (!session?.user) return;

    try {
      const res = await fetch(`/api/events/${eventId}/register/status`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsRegistered(data.isRegistered || false);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const handleRegister = async () => {
    if (!session) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to register');
      }

      setIsRegistered(true);
      refetch(); // Refresh event data to update participant count
    } catch (error: any) {
      alert(error.message || 'Gagal mendaftar event');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Memuat detail event...</p>
        </Card>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex flex-col gap-2">
            <p className="text-red-600 dark:text-red-400 font-medium">Gagal memuat event</p>
            <p className="text-red-500 dark:text-red-300 text-sm">
              {(error as Error)?.message || 'Event tidak ditemukan'}
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => refetch()} variant="outline">
                Coba lagi
              </Button>
              <Button onClick={() => router.push('/events')} variant="ghost">
                Kembali ke Events
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const event = eventData;
  const startsAt = event.starts_at ? new Date(event.starts_at) : null;
  const endsAt = event.ends_at ? new Date(event.ends_at) : null;
  const participantCount = event.event_stats?.participants || 0;
  const maxParticipants = event.max_participants || 0;
  const isFull = maxParticipants > 0 && participantCount >= maxParticipants;
  const price = event.price_cents ? event.price_cents / 100 : 0;

  // Format dates
  const formattedStartDate = startsAt?.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedStartTime = startsAt?.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  const formattedEndDate = endsAt?.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedEndTime = endsAt?.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Status badge
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      icon: AlertCircle
    },
    upcoming: {
      label: 'Akan Datang',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      icon: Clock
    },
    ongoing: {
      label: 'Sedang Berlangsung',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      icon: Video
    },
    completed: {
      label: 'Selesai',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Dibatalkan',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      icon: XCircle
    }
  };

  const statusInfo = statusConfig[event.status] || statusConfig.upcoming;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link href="/events">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Events
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          <Card className="overflow-hidden">
            <div className="relative h-64 md:h-96 w-full bg-gray-200 dark:bg-gray-800">
              {event.image_url && (event.image_url.startsWith('http') || event.image_url.startsWith('//')) ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/hero-esports.svg";
                  }}
                />
              ) : (
                <Image
                  src={event.image_url || "/images/hero-esports.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/hero-esports.svg";
                  }}
                />
              )}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <statusInfo.icon className="h-4 w-4" />
                  {statusInfo.label}
                </div>
              </div>
              {event.is_using_tournament_banner && (
                <div className="absolute bottom-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  📸 Menggunakan banner tournament
                </div>
              )}
            </div>
          </Card>

          {/* Event Details */}
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{event.game}</p>

            {/* Event Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Deskripsi Event</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {event.description || 'Tidak ada deskripsi tersedia.'}
              </p>
            </div>

            {/* Event Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal & Waktu</p>
                  <p className="font-medium">
                    {formattedStartDate ? `${formattedStartDate}` : 'TBA'}
                    {formattedStartTime && ` • ${formattedStartTime}`}
                  </p>
                  {endsAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Selesai: {formattedEndDate} • {formattedEndTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lokasi</p>
                  <p className="font-medium">{event.location || 'TBA'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Peserta</p>
                  <p className="font-medium">
                    {participantCount}{maxParticipants > 0 ? ` / ${maxParticipants}` : ''} peserta
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Biaya Pendaftaran</p>
                  <p className="font-medium">
                    {price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : 'Gratis'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Link YouTube/Live Stream</p>
                  {event.live_url ? (
                    <Link 
                      href={event.live_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {event.live_url}
                    </Link>
                  ) : (
                    <p className="font-medium text-gray-500 dark:text-gray-400">-</p>
                  )}
                </div>
              </div>
            </div>

            {/* Live Stream Button - Show if URL exists and event is ongoing or upcoming */}
            {event.live_url && (event.status === 'ongoing' || event.status === 'upcoming') && (
              <div className="mb-6">
                <Link href={event.live_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Video className="h-4 w-4 mr-2" />
                    {event.status === 'ongoing' ? 'Tonton Live Streaming' : 'Link YouTube/Live Stream'}
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pendaftaran</h2>
            
            {isFull && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Event Penuh</p>
                </div>
              </div>
            )}

            {event.status === 'completed' && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <XCircle className="h-4 w-4" />
                  <p className="text-sm">Event ini sudah selesai.</p>
                </div>
              </div>
            )}

            {isRegistered ? (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Anda sudah terdaftar</p>
                </div>
              </div>
            ) : (
              <>
                {event.status === 'upcoming' && !isFull && (
                  <Button 
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full mb-4"
                  >
                    {isRegistering ? 'Mendaftar...' : 'Daftar Event'}
                  </Button>
                )}
              </>
            )}

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium">{statusInfo.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Peserta:</span>
                <span className="font-medium">
                  {participantCount}{maxParticipants > 0 ? ` / ${maxParticipants}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya:</span>
                <span className="font-medium">
                  {price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : 'Gratis'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Info Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informasi</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Game</p>
                <p className="font-medium">{event.game || 'TBA'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Lokasi</p>
                <p className="font-medium">{event.location || 'TBA'}</p>
              </div>
              {maxParticipants > 0 && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Maksimal Peserta</p>
                  <p className="font-medium">{maxParticipants} peserta</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">YouTube/Live Stream</p>
                {event.live_url ? (
                  <Link 
                    href={event.live_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all text-xs"
                  >
                    {event.live_url.length > 50 ? `${event.live_url.substring(0, 50)}...` : event.live_url}
                  </Link>
                ) : (
                  <p className="font-medium text-gray-500 dark:text-gray-400">-</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

