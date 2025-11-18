"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Calendar, User, Ticket, MapPin, Hash, Loader2 } from "lucide-react";

type Ticket = {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type: string;
  price_cents: number;
  qr_code: string;
  status: "active" | "used" | "cancelled" | "transferred";
  purchased_at: string;
  used_at?: string | null;
  checked_in_at?: string | null;
  user?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  event?: {
    id: string;
    title: string;
    starts_at?: string | null;
    location?: string | null;
  } | null;
};

type TicketsResponse = {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function AdminTicketsPage() {
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, Ticket["status"]>>({});
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Record<string, Ticket["status"]>>({});
  
  const queryClient = useQueryClient();

  const queryKey = ["admin-tickets", { search, eventId, status, ticketType, page, limit }] as const;

  const { data, isLoading, isError, error } = useQuery<TicketsResponse>({
    queryKey,
    queryFn: async (): Promise<TicketsResponse> => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(eventId && { event_id: eventId }),
        ...(status && { status }),
        ...(ticketType && { ticket_type: ticketType }),
      });
      const res = await fetch(`/api/admin/tickets?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal memuat tiket");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (!data?.tickets) return;

    const idsToClear: string[] = [];

    setTicketStatuses((prev) => {
      const updated = { ...prev };
      let changed = false;

      data.tickets.forEach((ticket) => {
        const pendingStatus = pendingStatusUpdates[ticket.id];
        if (pendingStatus !== undefined) {
          if (ticket.status === pendingStatus) {
            idsToClear.push(ticket.id);
          } else {
            // Keep optimistic value while server data catches up
            if (updated[ticket.id] === undefined) {
              updated[ticket.id] = pendingStatus;
              changed = true;
            }
            return;
          }
        }

        if (updated[ticket.id] !== ticket.status) {
          updated[ticket.id] = ticket.status;
          changed = true;
        }
      });

      // Remove statuses for tickets no longer in the list
      Object.keys(updated).forEach((id) => {
        if (!data.tickets.find((ticket) => ticket.id === id)) {
          delete updated[id];
          changed = true;
        }
      });

      return changed ? updated : prev;
    });

    if (idsToClear.length > 0) {
      setPendingStatusUpdates((prev) => {
        const next = { ...prev };
        idsToClear.forEach((id) => {
          delete next[id];
        });
        return next;
      });
    }
  }, [data?.tickets, pendingStatusUpdates]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mutation for updating ticket status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, newStatus }: { ticketId: string; newStatus: string }) => {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengupdate status tiket');
      }

      return res.json();
    },
    onMutate: async ({ ticketId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TicketsResponse>(queryKey);

      queryClient.setQueryData<TicketsResponse | undefined>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          tickets: old.tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: newStatus as Ticket["status"] } : ticket
          ),
        };
      });

      setSelectedTicket((prev) =>
        prev && prev.id === ticketId ? { ...prev, status: newStatus as Ticket["status"] } : prev
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: (response, { ticketId }) => {
      const updatedTicket = response?.ticket as Ticket | undefined;
      if (updatedTicket) {
        queryClient.setQueryData<TicketsResponse | undefined>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            tickets: old.tickets.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
            ),
          };
        });

        setSelectedTicket((prev) =>
          prev && prev.id === ticketId ? { ...prev, ...updatedTicket } : prev
        );

        setTicketStatuses((prev) => ({
          ...prev,
          [ticketId]: updatedTicket.status,
        }));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    const previousStatus =
      ticketStatuses[ticketId] ??
      data?.tickets.find((t) => t.id === ticketId)?.status ??
      (selectedTicket?.id === ticketId ? selectedTicket.status : undefined);

    setTicketStatuses((prev) => ({
      ...prev,
      [ticketId]: newStatus as Ticket["status"],
    }));
    setPendingStatusUpdates((prev) => ({
      ...prev,
      [ticketId]: newStatus as Ticket["status"],
    }));

    setUpdatingTicketId(ticketId);
    let didSucceed = false;
    try {
      await updateStatusMutation.mutateAsync({ ticketId, newStatus });
      didSucceed = true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengupdate status tiket');
      if (previousStatus) {
        queryClient.setQueryData<TicketsResponse | undefined>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            tickets: old.tickets.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, status: previousStatus } : ticket
            ),
          };
        });

        setTicketStatuses((prev) => ({
          ...prev,
          [ticketId]: previousStatus,
        }));

        setSelectedTicket((prev) =>
          prev && prev.id === ticketId ? { ...prev, status: previousStatus } : prev
        );
      }
    } finally {
      setUpdatingTicketId(null);
      if (!didSucceed) {
        setPendingStatusUpdates((prev) => {
          const { [ticketId]: _removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Aktif
          </span>
        );
      case "used":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Digunakan
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Dibatalkan
          </span>
        );
      case "transferred":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Ditransfer
          </span>
        );
      default:
        return null;
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Pembelian Tiket</h1>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      {/* Filter & Search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Pencarian</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="No Tiket / Nama / Email / Username"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="used">Digunakan</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="transferred">Ditransfer</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="ticketType">Tipe Tiket</Label>
            <Select
              id="ticketType"
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="eventId">Event</Label>
            <Input
              id="eventId"
              placeholder="ID Event (opsional)"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Daftar Tiket</h2>
          {data && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {data.tickets.length} dari {data.pagination?.total || 0} tiket
            </p>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Memuat tiket...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-2">
              Gagal memuat tiket. Silakan coba lagi.
            </p>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {error instanceof Error ? error.message : "Terjadi kesalahan"}
              </p>
            )}
          </div>
        )}

        {!isLoading && !isError && data?.tickets && data.tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Tidak ada tiket ditemukan.</p>
          </div>
        )}

        {!isLoading && !isError && data?.tickets && data.tickets.length > 0 && (
          <div className="space-y-4">
            {data.tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Ticket Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg border-2 border-primary/30 dark:border-primary/50 flex flex-col items-center justify-center min-w-[140px]">
                      <Hash className="h-6 w-6 text-primary mb-2" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">No Tiket</p>
                      <p className="font-mono text-sm font-bold text-primary break-all text-center">{ticket.qr_code}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      Lihat Detail
                    </Button>
                  </div>

                  {/* Ticket Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {ticket.event?.title || "Event Tidak Ditemukan"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Tipe:</span>
                            <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{ticket.ticket_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <div className="relative">
                              <Select
                                value={ticketStatuses[ticket.id] ?? ticket.status}
                                onValueChange={(value) => handleStatusChange(ticket.id, value)}
                                disabled={updatingTicketId === ticket.id}
                                className="text-xs min-w-[120px]"
                              >
                                <option value="active">Aktif</option>
                                <option value="used">Digunakan</option>
                                <option value="cancelled">Dibatalkan</option>
                                <option value="transferred">Ditransfer</option>
                              </Select>
                              {updatingTicketId === ticket.id && (
                                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 animate-spin text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(ticket.price_cents)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Pembeli:</span>
                        </div>
                        <div className="space-y-1">
                          {ticket.user?.full_name && (
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {ticket.user.full_name}
                            </p>
                          )}
                          {ticket.user?.username && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              @{ticket.user.username}
                            </p>
                          )}
                          {ticket.user?.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                              {ticket.user.email}
                            </p>
                          )}
                          {!ticket.user?.full_name && !ticket.user?.username && !ticket.user?.email && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              Tidak diketahui
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Dibeli:</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(ticket.purchased_at)}
                        </p>
                      </div>

                      {ticket.event?.starts_at && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Event:</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(ticket.event.starts_at)}
                          </p>
                        </div>
                      )}

                      {ticket.event?.location && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">Lokasi:</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {ticket.event.location}
                          </p>
                        </div>
                      )}

                      {ticket.used_at && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Digunakan:</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(ticket.used_at)}
                          </p>
                        </div>
                      )}

                      {ticket.checked_in_at && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Check-in:</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(ticket.checked_in_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {page} dari {data.pagination.totalPages || 1}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                disabled={page >= (data.pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Detail Tiket</h2>
              <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Ticket Number Display */}
              <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-lg border-2 border-primary/30 dark:border-primary/50">
                <div className="flex items-center gap-3 mb-3">
                  <Hash className="h-8 w-8 text-primary" />
                  <Label className="text-xl font-bold">Nomor Tiket</Label>
                </div>
                <p className="font-mono text-3xl font-bold text-primary break-all mb-2">{selectedTicket.qr_code}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gunakan nomor tiket ini untuk verifikasi di venue
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Event</Label>
                  <p className="font-semibold text-lg">{selectedTicket.event?.title || "Tidak diketahui"}</p>
                </div>

                <div>
                  <Label>Pembeli</Label>
                  <div className="space-y-1 mt-1">
                    {selectedTicket.user?.full_name && (
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedTicket.user.full_name}
                      </p>
                    )}
                    {selectedTicket.user?.username && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{selectedTicket.user.username}
                      </p>
                    )}
                    {selectedTicket.user?.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 font-mono break-all">
                        {selectedTicket.user.email}
                      </p>
                    )}
                    {!selectedTicket.user?.full_name && !selectedTicket.user?.username && !selectedTicket.user?.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Tidak diketahui
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Tipe Tiket</Label>
                  <p className="capitalize text-lg font-medium">{selectedTicket.ticket_type}</p>
                </div>

                <div>
                  <Label>Harga</Label>
                  <p className="font-bold text-primary text-lg">{formatCurrency(selectedTicket.price_cents)}</p>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Select
                        value={ticketStatuses[selectedTicket.id] ?? selectedTicket.status}
                        onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                        disabled={updatingTicketId === selectedTicket.id}
                        className="w-full"
                      >
                        <option value="active">Aktif</option>
                        <option value="used">Digunakan</option>
                        <option value="cancelled">Dibatalkan</option>
                        <option value="transferred">Ditransfer</option>
                      </Select>
                      {updatingTicketId === selectedTicket.id && (
                        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Dibeli</Label>
                  <p>{formatDate(selectedTicket.purchased_at)}</p>
                </div>

                {selectedTicket.event?.starts_at && (
                  <div>
                    <Label>Tanggal Event</Label>
                    <p>{formatDate(selectedTicket.event.starts_at)}</p>
                  </div>
                )}

                {selectedTicket.event?.location && (
                  <div>
                    <Label>Lokasi</Label>
                    <p>{selectedTicket.event.location}</p>
                  </div>
                )}

                {selectedTicket.used_at && (
                  <div>
                    <Label>Digunakan</Label>
                    <p>{formatDate(selectedTicket.used_at)}</p>
                  </div>
                )}

                {selectedTicket.checked_in_at && (
                  <div>
                    <Label>Check-in</Label>
                    <p>{formatDate(selectedTicket.checked_in_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

