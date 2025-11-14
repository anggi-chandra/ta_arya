"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Calendar, MapPin, DollarSign, Users, User } from "lucide-react";

type EventRequest = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  game?: string | null;
  image_url?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at?: string | null;
  price_cents?: number | null;
  capacity?: number | null;
  live_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
  user?: {
    id: string;
    full_name?: string;
    username?: string;
    email?: string;
  } | null;
};

type EventRequestsResponse = {
  eventRequests: EventRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function AdminEventRequestsPage() {
  const queryClient = useQueryClient();

  // Filters & pagination
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading, isError } = useQuery<EventRequestsResponse>({
    queryKey: [
      "admin-event-requests",
      { status, page, limit },
    ],
    queryFn: async (): Promise<EventRequestsResponse> => {
      const params = new URLSearchParams({
        status,
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/event-requests?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat permintaan event");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/admin/event-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyetujui permintaan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-requests"] });
      alert("Permintaan event disetujui dan event berhasil dibuat");
    },
    onError: (error: any) => {
      alert(error.message || "Gagal menyetujui permintaan");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const res = await fetch(`/api/admin/event-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: 'reject',
          rejection_reason: reason || null
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menolak permintaan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-requests"] });
      setShowRejectForm({});
      setRejectionReason({});
      alert("Permintaan event ditolak");
    },
    onError: (error: any) => {
      alert(error.message || "Gagal menolak permintaan");
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Menunggu
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Kelola Permintaan Event</h1>
        <Card className="p-6">
          <p className="text-red-600 dark:text-red-400">
            Gagal memuat permintaan event. Silakan refresh halaman.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Permintaan Event</h1>
        <Link href="/admin/events">
          <Button variant="outline">Lihat Semua Event</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="status">Filter Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mt-1"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Event Requests List */}
      {isLoading ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Memuat permintaan event...</p>
        </Card>
      ) : !data || data.eventRequests.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Belum ada permintaan event.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {data.eventRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    {request.user && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <User className="h-4 w-4" />
                        <span>
                          {request.user.full_name || request.user.username || 'User'} 
                          {request.user.email && ` (${request.user.email})`}
                        </span>
                      </div>
                    )}
                    {request.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {request.description}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                      {request.game && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{request.game}</span>
                        </div>
                      )}
                      {request.location && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{request.location}</span>
                        </div>
                      )}
                      {request.price_cents !== undefined && request.price_cents > 0 && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(request.price_cents)}</span>
                        </div>
                      )}
                      {request.capacity && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>Kapasitas: {request.capacity}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                      <p>
                        Dimulai: {new Date(request.starts_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {request.ends_at && (
                        <p>
                          Selesai: {new Date(request.ends_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                      <p className="mt-1">
                        Diajukan: {new Date(request.requested_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {request.reviewed_at && (
                        <p>
                          Direview: {new Date(request.reviewed_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    {request.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                          Alasan Penolakan:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {request.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Setujui
                    </Button>
                    <Button
                      onClick={() => setShowRejectForm({
                        ...showRejectForm,
                        [request.id]: !showRejectForm[request.id]
                      })}
                      variant="outline"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                )}
                {showRejectForm[request.id] && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <Label htmlFor={`rejection-reason-${request.id}`}>
                      Alasan Penolakan (Opsional)
                    </Label>
                    <Textarea
                      id={`rejection-reason-${request.id}`}
                      value={rejectionReason[request.id] || ""}
                      onChange={(e) => setRejectionReason({
                        ...rejectionReason,
                        [request.id]: e.target.value
                      })}
                      placeholder="Masukkan alasan penolakan..."
                      rows={3}
                      className="mt-1"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          rejectMutation.mutate({
                            requestId: request.id,
                            reason: rejectionReason[request.id] || undefined
                          });
                        }}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        Konfirmasi Tolak
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRejectForm({
                            ...showRejectForm,
                            [request.id]: false
                          });
                          setRejectionReason({
                            ...rejectionReason,
                            [request.id]: ""
                          });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Halaman {data.pagination.page} dari {data.pagination.totalPages} (
                {data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Sebelumnya
                </Button>
                <Button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

