"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  game: string;
  location: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
  ticket_types?: {
    regular?: { price: number; available?: number };
    vip?: { price: number; available?: number };
    early_bird?: { price: number; available?: number };
  } | null;
  check_in_required?: boolean;
  image_url?: string;
  price_cents?: number;
  event_stats?: {
    participants: number;
    tickets_sold?: number;
  };
}

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { data: session } = useSession();
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Fetch event data
  const { data: eventData, isLoading, error, refetch } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await res.json();
      return data.event as EventDetail;
    },
    enabled: !!eventId
  });

  // Check if user has existing tickets
  const { data: existingTickets } = useQuery({
    queryKey: ['event-tickets', eventId],
    queryFn: async () => {
      if (!session?.user) return null;
      const res = await fetch(`/api/events/${eventId}/tickets/my-tickets`, {
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.tickets || [];
    },
    enabled: !!session?.user && !!eventId
  });

  useEffect(() => {
    // Set default ticket type if available
    if (eventData?.ticket_types) {
      // Parse ticket_types if it's a string (JSON)
      let ticketTypes = eventData.ticket_types;
      if (typeof ticketTypes === 'string') {
        try {
          ticketTypes = JSON.parse(ticketTypes);
        } catch (e) {
          console.error('Error parsing ticket_types:', e);
        }
      }
      
      if (ticketTypes && typeof ticketTypes === 'object') {
        const types = Object.keys(ticketTypes);
        if (types.length > 0 && !selectedTicketType) {
          setSelectedTicketType(types[0]);
        }
      }
    } else if (eventData?.price_cents && !selectedTicketType) {
      // If no ticket_types but has price_cents, use 'regular'
      setSelectedTicketType('regular');
    }
  }, [eventData, selectedTicketType]);

  const handlePurchase = async () => {
    if (!session) {
      router.push(`/auth/signin?redirect=/events/${eventId}/tickets`);
      return;
    }

    if (!selectedTicketType) {
      alert('Pilih jenis tiket terlebih dahulu');
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await fetch(`/api/events/${eventId}/tickets/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ticket_type: selectedTicketType,
          quantity: quantity
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal membeli tiket');
      }

      const data = await res.json();
      alert(data.message || 'Tiket berhasil dibeli!');
      
      // Redirect to event detail page or tickets page
      router.push(`/events/${eventId}?purchased=true`);
    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      alert(error.message || 'Terjadi kesalahan saat membeli tiket');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Memuat data event...</p>
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

  // Calculate ticket price
  let ticketPrice = 0;
  if (event.ticket_types && selectedTicketType) {
    const ticketType = event.ticket_types[selectedTicketType as keyof typeof event.ticket_types];
    if (ticketType) {
      ticketPrice = ticketType.price || 0;
    }
  } else if (event.price_cents) {
    ticketPrice = event.price_cents / 100; // Convert cents to rupiah
  }

  const totalPrice = ticketPrice * quantity;

  // Get available tickets
  const getAvailableTickets = (ticketType: string) => {
    if (!event.ticket_types) return null;
    
    // Parse ticket_types if it's a string (JSON)
    let ticketTypes = event.ticket_types;
    if (typeof ticketTypes === 'string') {
      try {
        ticketTypes = JSON.parse(ticketTypes);
      } catch (e) {
        console.error('Error parsing ticket_types:', e);
        return null;
      }
    }
    
    if (ticketTypes && typeof ticketTypes === 'object') {
      const type = ticketTypes[ticketType as keyof typeof ticketTypes];
      if (type && typeof type === 'object' && 'available' in type) {
        return type.available !== undefined && type.available !== null ? type.available : null;
      }
    }
    return null;
  };

  // Check if event is sold out
  const ticketsSold = event.event_stats?.tickets_sold || 0;
  const isSoldOut = event.capacity ? ticketsSold >= event.capacity : false;

  // Check if ticket type is available
  const selectedTicketAvailable = selectedTicketType 
    ? getAvailableTickets(selectedTicketType) 
    : null;
  const isTicketTypeSoldOut = selectedTicketAvailable !== null && selectedTicketAvailable <= 0;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        href={`/events/${eventId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Detail Event
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Info */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-4">
              {event.image_url && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {event.game && (
                    <span className="flex items-center">
                      <span className="mr-1">🎮</span>
                      {event.game}
                    </span>
                  )}
                  {startsAt && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {startsAt.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Ticket Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Pilih Tiket</h2>
            
            {isSoldOut ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Tiket Habis</span>
                </div>
                <p className="text-red-500 dark:text-red-300 text-sm mt-2">
                  Maaf, semua tiket untuk event ini sudah terjual habis.
                </p>
              </div>
            ) : (
              <>
                {/* Ticket Types */}
                {event.ticket_types ? (
                  <div className="space-y-4 mb-6">
                    {(() => {
                      // Parse ticket_types if it's a string (JSON)
                      let ticketTypes = event.ticket_types;
                      if (typeof ticketTypes === 'string') {
                        try {
                          ticketTypes = JSON.parse(ticketTypes);
                        } catch (e) {
                          console.error('Error parsing ticket_types:', e);
                          return null;
                        }
                      }
                      
                      if (!ticketTypes || typeof ticketTypes !== 'object') {
                        return null;
                      }
                      
                      return Object.entries(ticketTypes).map(([type, data]: [string, any]) => {
                        const available = data?.available ?? null;
                        const price = data?.price ?? 0;
                        const isAvailable = available === null || available > 0;
                        const isSelected = selectedTicketType === type;

                        return (
                          <div
                            key={type}
                            onClick={() => isAvailable && setSelectedTicketType(type)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : isAvailable
                                ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold capitalize">
                                    {type.replace('_', ' ')}
                                  </h3>
                                  {isSelected && (
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                                  Rp {price.toLocaleString('id-ID')}
                                </p>
                                {available !== null && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Tersedia: {available} tiket
                                  </p>
                                )}
                              </div>
                              {!isAvailable && (
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  Habis
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : event.price_cents ? (
                  <div className="border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Tiket Regular</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                          Rp {(event.price_cents / 100).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Tiket gratis - Tidak perlu pembayaran
                    </p>
                  </div>
                )}

                {/* Quantity Selection */}
                {ticketPrice > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Jumlah Tiket
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => {
                          const maxQuantity = selectedTicketAvailable !== null 
                            ? Math.min(selectedTicketAvailable, 10) 
                            : 10;
                          setQuantity(Math.min(maxQuantity, quantity + 1));
                        }}
                        disabled={
                          (selectedTicketAvailable !== null && quantity >= selectedTicketAvailable) ||
                          quantity >= 10
                        }
                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                      {selectedTicketAvailable !== null && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Maksimal {selectedTicketAvailable} tiket
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                {!session ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-2">
                      Anda perlu login untuk membeli tiket
                    </p>
                    <Link href={`/auth/signin?redirect=/events/${eventId}/tickets`}>
                      <Button className="w-full">Login untuk Membeli Tiket</Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchasing || !selectedTicketType || isTicketTypeSoldOut}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {isPurchasing ? (
                      'Memproses...'
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        {ticketPrice > 0 
                          ? `Beli Tiket - Rp ${totalPrice.toLocaleString('id-ID')}`
                          : 'Dapatkan Tiket Gratis'}
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Event</p>
                <p className="font-medium">{event.title}</p>
              </div>
              {selectedTicketType && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jenis Tiket</p>
                  <p className="font-medium capitalize">
                    {selectedTicketType.replace('_', ' ')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah</p>
                <p className="font-medium">{quantity} tiket</p>
              </div>
              {ticketPrice > 0 && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium">
                        Rp {(ticketPrice * quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {event.check_in_required && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Check-in diperlukan di venue
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Existing Tickets */}
          {existingTickets && existingTickets.length > 0 && (
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-bold mb-4">Tiket Saya</h2>
              <div className="space-y-2">
                {existingTickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {ticket.ticket_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {ticket.status === 'active' ? 'Aktif' : ticket.status}
                      </p>
                    </div>
                    <Ticket className="h-5 w-5 text-blue-600" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

