"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

async function fetchMyTeams() {
  const res = await fetch("/api/teams/my-teams", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Gagal memuat tim");
  }
  return res.json();
}

async function fetchMyRequests() {
  const res = await fetch("/api/teams/request", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Gagal memuat permintaan");
  }
  return res.json();
}

export default function DashboardTeamsPage() {
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["my-teams"],
    queryFn: fetchMyTeams,
  });

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["my-team-requests"],
    queryFn: fetchMyRequests,
  });

  const teams = teamsData?.teams || [];
  const requests = requestsData?.requests || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3" />
            Menunggu Persetujuan
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
      <h1 className="text-2xl font-bold mb-6">Tim Saya</h1>

      <div className="mb-6">
        <Link href="/dashboard/teams/create">
          <Button>Ajukan Permintaan Tim Baru</Button>
        </Link>
      </div>

      {/* My Teams */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tim Saya</h2>
        {isLoadingTeams ? (
          <p className="text-gray-600 dark:text-gray-400">Memuat tim...</p>
        ) : teams.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Anda belum memiliki tim. Ajukan permintaan pembuatan tim di atas.
          </p>
        ) : (
          <div className="space-y-4">
            {teams.map((team: any) => (
              <div key={team.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {team.logo_url && (
                    <img
                      src={team.logo_url}
                      alt={`${team.name} logo`}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-bold">{team.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{team.game}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* My Requests */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Permintaan Saya</h2>
        {isLoadingRequests ? (
          <p className="text-gray-600 dark:text-gray-400">Memuat permintaan...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada permintaan pembuatan tim.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold">{request.name}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Game:</strong> {request.game}
                    </p>
                    {request.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {request.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Diajukan pada: {new Date(request.requested_at).toLocaleDateString('id-ID')}
                    </p>
                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-800 dark:text-red-200">
                        <strong>Alasan ditolak:</strong> {request.rejection_reason}
                      </div>
                    )}
                    {request.status === 'approved' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✓ Tim Anda telah dibuat! Silakan refresh halaman untuk melihat tim Anda.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}