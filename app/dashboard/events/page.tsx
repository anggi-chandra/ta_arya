"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Clock, CheckCircle, XCircle, Calendar, MapPin, DollarSign, Users } from "lucide-react";

type EventRequest = {
  id: string;
  title: string;
  description?: string;
  game?: string;
  image_url?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  price_cents?: number;
  capacity?: number;
  live_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
};

export default function DashboardEventsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadEventRequests();
    }
  }, [sessionStatus]);

  const loadEventRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events/request", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setEventRequests(data.eventRequests || []);
      }
    } catch (error) {
      console.error("Error loading event requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1.5 border border-yellow-300 dark:border-yellow-700">
            <Clock className="h-4 w-4" />
            Menunggu Persetujuan
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1.5 border border-green-300 dark:border-green-700">
            <CheckCircle className="h-4 w-4" />
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1.5 border border-red-300 dark:border-red-700">
            <XCircle className="h-4 w-4" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Filter event requests by status
  const filteredRequests = statusFilter
    ? eventRequests.filter((req) => req.status === statusFilter)
    : eventRequests;

  // Count requests by status
  const statusCounts = {
    pending: eventRequests.filter((req) => req.status === 'pending').length,
    approved: eventRequests.filter((req) => req.status === 'approved').length,
    rejected: eventRequests.filter((req) => req.status === 'rejected').length,
    total: eventRequests.length,
  };

  if (sessionStatus === "loading") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Event Saya</h1>
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Event Saya</h1>
          {statusCounts.total > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {statusCounts.total} pengajuan
            </p>
          )}
        </div>
        <Link href="/dashboard/events/create">
          <Button>Ajukan Event Baru</Button>
        </Link>
      </div>

      {/* Status Statistics */}
      {statusCounts.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statusCounts.pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disetujui</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statusCounts.approved}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ditolak</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {statusCounts.rejected}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Status Filter */}
      {statusCounts.total > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
            {statusFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("")}
              >
                Hapus Filter
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Memuat event requests...</p>
        </Card>
      ) : eventRequests.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Belum ada event request. Gunakan tombol di atas untuk mengajukan event baru.
          </p>
          <Link href="/dashboard/events/create">
            <Button>Ajukan Event Baru</Button>
          </Link>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Tidak ada event request dengan status "{statusFilter === 'pending' ? 'Menunggu Persetujuan' : statusFilter === 'approved' ? 'Disetujui' : 'Ditolak'}".
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className={`p-6 ${
                request.status === 'pending' 
                  ? 'border-l-4 border-l-yellow-500' 
                  : request.status === 'approved'
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-red-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{request.title}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {request.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                  <div className="mt-3 text-sm text-gray-500 dark:text-gray-500">
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
                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        Alasan Penolakan:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {request.rejection_reason}
                      </p>
                    </div>
                  )}
                  {request.status === 'approved' && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                        ✓ Event Disetujui
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Event Anda telah disetujui dan telah dibuat. Silakan cek halaman Events untuk melihat event tersebut.
                      </p>
                    </div>
                  )}
                  {request.status === 'pending' && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏳ Permintaan Anda sedang dalam proses review oleh admin. Mohon tunggu konfirmasi lebih lanjut.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}