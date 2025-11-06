"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type EventItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  max_participants?: number;
  price_cents?: number;
  event_stats?: { participants?: number } | null;
};

async function fetchAdminEvents(page: number, limit: number, search: string, status: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await fetch(`/api/admin/events?${params.toString()}`);
  if (!res.ok) throw new Error("Gagal memuat data event");
  return res.json() as Promise<{ events: EventItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
}

async function createEvent(payload: Partial<EventItem>) {
  const res = await fetch(`/api/admin/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat event");
  return res.json();
}

async function updateEvent(id: string, payload: Partial<EventItem>) {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal memperbarui event");
  return res.json();
}

async function deleteEvent(id: string) {
  const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus event");
  return res.json();
}

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newEndsAt, setNewEndsAt] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");

  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-events", page, limit, search, status],
    queryFn: () => fetchAdminEvents(page, limit, search, status),
  });

  const createMutation = useMutation({
    mutationFn: () => createEvent({
      title: newTitle,
      location: newLocation || undefined,
      starts_at: newStartsAt || undefined,
      ends_at: newEndsAt || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setNewTitle("");
      setNewLocation("");
      setNewStartsAt("");
      setNewEndsAt("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingId) return Promise.resolve(null);
      return updateEvent(editingId, {
        title: editTitle,
        location: editLocation || undefined,
        starts_at: editStartsAt || undefined,
        ends_at: editEndsAt || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const events = data?.events || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Event</h1>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kelola event esports: buat, edit, dan atur publikasi.
        </p>

        <div className="flex flex-wrap gap-2 items-end mb-4">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Cari judul, deskripsi, lokasi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          >
            <option value="">Semua Status</option>
            <option value="upcoming">Akan Datang</option>
            <option value="ongoing">Berlangsung</option>
            <option value="completed">Selesai</option>
          </select>
          <Button onClick={() => { setPage(1); refetch(); }}>Cari</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <Input placeholder="Judul baru" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input placeholder="Lokasi" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
          <input
            type="datetime-local"
            value={newStartsAt}
            onChange={(e) => setNewStartsAt(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          />
          <input
            type="datetime-local"
            value={newEndsAt}
            onChange={(e) => setNewEndsAt(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          />
        </div>
        <div className="mt-3">
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newTitle || !newStartsAt}>
            {createMutation.isPending ? "Menyimpan..." : "Buat Event"}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        {isLoading && <p>Memuat event...</p>}
        {error && <p className="text-red-500">{(error as Error).message}</p>}
        {!isLoading && events.length === 0 && <p>Tidak ada event.</p>}

        {!isLoading && events.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Judul</th>
                <th className="py-2">Lokasi</th>
                <th className="py-2">Mulai</th>
                <th className="py-2">Selesai</th>
                <th className="py-2">Peserta</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev: EventItem) => {
                const isEditing = editingId === ev.id;
                return (
                  <tr key={ev.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">
                      {isEditing ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      ) : (
                        ev.title
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                      ) : (
                        ev.location || "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={editStartsAt}
                          onChange={(e) => setEditStartsAt(e.target.value)}
                          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        />
                      ) : (
                        ev.starts_at ? new Date(ev.starts_at).toLocaleString() : "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={editEndsAt}
                          onChange={(e) => setEditEndsAt(e.target.value)}
                          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        />
                      ) : (
                        ev.ends_at ? new Date(ev.ends_at).toLocaleString() : "-"
                      )}
                    </td>
                    <td className="py-2">{ev.event_stats?.participants ?? 0}</td>
                    <td className="py-2 flex gap-2">
                      {!isEditing ? (
                        <Button
                          onClick={() => {
                            setEditingId(ev.id);
                            setEditTitle(ev.title || "");
                            setEditLocation(ev.location || "");
                            setEditStartsAt(ev.starts_at ? ev.starts_at.slice(0, 16) : "");
                            setEditEndsAt(ev.ends_at ? ev.ends_at.slice(0, 16) : "");
                          }}
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                          </Button>
                          <Button variant="secondary" onClick={() => setEditingId(null)}>Batal</Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(ev.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!!pagination && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Halaman {pagination.page} dari {pagination.totalPages} • Total {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Sebelumnya</Button>
              <Button onClick={() => setPage((p) => (pagination && p < pagination.totalPages ? p + 1 : p))} disabled={!pagination || page >= pagination.totalPages}>Berikutnya</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}