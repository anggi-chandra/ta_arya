"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type TeamRequest = {
  id: string;
  user_id: string;
  name: string;
  game: string;
  logo_url?: string | null;
  description?: string | null;
  recruiting: boolean;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
  user?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  reviewer?: {
    id: string;
    full_name?: string;
    username?: string;
  };
};

type TeamRequestsResponse = {
  requests: TeamRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function AdminTeamsPage() {
  const queryClient = useQueryClient();

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  const { data, isLoading, isError } = useQuery<TeamRequestsResponse>({
    queryKey: [
      "admin-team-requests",
      { search, status, page, limit },
    ],
    queryFn: async (): Promise<TeamRequestsResponse> => {
      const params = new URLSearchParams({
        search,
        status,
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/team-requests?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat permintaan tim");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/admin/team-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyetujui permintaan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team-requests"] });
      alert("Permintaan tim disetujui dan tim berhasil dibuat");
    },
    onError: (error: any) => {
      alert(error.message || "Gagal menyetujui permintaan");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const res = await fetch(`/api/admin/team-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: 'rejected',
          rejection_reason: reason || undefined
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menolak permintaan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team-requests"] });
      setRejectionReason({});
      alert("Permintaan tim ditolak");
    },
    onError: (error: any) => {
      alert(error.message || "Gagal menolak permintaan");
    },
  });

  const handleApprove = (requestId: string) => {
    if (confirm("Apakah Anda yakin ingin menyetujui permintaan ini?")) {
      approveMutation.mutate(requestId);
    }
  };

  const handleReject = (requestId: string) => {
    const reason = rejectionReason[requestId] || '';
    if (confirm("Apakah Anda yakin ingin menolak permintaan ini?")) {
      rejectMutation.mutate({ requestId, reason });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3" />
            Menunggu
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3" />
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kelola Tim</h1>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Info:</strong> Halaman ini menampilkan permintaan pembuatan tim dari user. Admin dapat menyetujui atau menolak permintaan tersebut.
        </p>
      </Card>

      {/* Filter & search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Pencarian</Label>
            <Input
              id="search"
              placeholder="Nama/Deskripsi/Game"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-team-requests"] })}>
              Cari
            </Button>
          </div>
        </div>
      </Card>

      {/* List of requests */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Permintaan Pembuatan Tim</h2>
        {isLoading && <p className="text-gray-600 dark:text-gray-400">Memuat...</p>}
        {isError && <p className="text-red-500">Gagal memuat data.</p>}
        {!isLoading && !isError && data?.requests?.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">Belum ada permintaan tim.</p>
        )}

        {!isLoading && data?.requests && data.requests.length > 0 && (
          <div className="space-y-4">
            {data.requests.map((request) => (
              <Card key={request.id} className="p-4 border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {request.logo_url && (
                        <img
                          src={request.logo_url}
                          alt={`${request.name} logo`}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{request.name}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div>
                            <strong>Game:</strong> {request.game}
                          </div>
                          <div>
                            <strong>Rekrut Anggota:</strong> {request.recruiting ? "Ya" : "Tidak"}
                          </div>
                          <div>
                            <strong>Pemohon:</strong> {request.user?.full_name || request.user?.username || "Unknown"}
                          </div>
                          <div>
                            <strong>Tanggal:</strong> {new Date(request.requested_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        {request.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{request.description}</p>
                        )}
                        {request.status === 'rejected' && request.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-800 dark:text-red-200">
                            <strong>Alasan ditolak:</strong> {request.rejection_reason}
                          </div>
                        )}
                        {request.reviewed_by && request.reviewer && (
                          <div className="mt-2 text-xs text-gray-500">
                            Ditinjau oleh: {request.reviewer.full_name || request.reviewer.username} pada {request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString('id-ID') : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                      <div className="flex flex-col gap-2">
                        <Input
                          placeholder="Alasan penolakan (opsional)"
                          value={rejectionReason[request.id] || ''}
                          onChange={(e) => setRejectionReason({ ...rejectionReason, [request.id]: e.target.value })}
                          className="text-sm"
                        />
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && (
          <div className="mt-4 flex items-center gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-sm">
              Halaman {page} dari {data.pagination.totalPages || 1}
            </span>
            <Button
              disabled={page >= (data.pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}