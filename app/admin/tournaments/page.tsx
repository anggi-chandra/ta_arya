"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type TournamentItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  max_participants?: number;
  price_cents?: number;
  game?: string;
  event_stats?: { participants?: number } | null;
};

async function fetchAdminTournaments(page: number, limit: number, search: string, status: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await fetch(`/api/admin/events?${params.toString()}`);
  if (!res.ok) throw new Error("Gagal memuat data turnamen");
  return res.json() as Promise<{ tournaments: TournamentItem[]; events: TournamentItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
}

async function createTournament(payload: Partial<TournamentItem>) {
  const res = await fetch(`/api/admin/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat turnamen");
  return res.json();
}

async function updateTournament(id: string, payload: Partial<TournamentItem>) {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal memperbarui turnamen");
  return res.json();
}

async function deleteTournament(id: string) {
  const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus turnamen");
  return res.json();
}

export default function AdminTournamentsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newGame, setNewGame] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newEndsAt, setNewEndsAt] = useState("");
  const [newMaxParticipants, setNewMaxParticipants] = useState<number | "">("");
  const [newPriceCents, setNewPriceCents] = useState<number | "">("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editGame, setEditGame] = useState("");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editMaxParticipants, setEditMaxParticipants] = useState<number | "">("");
  const [editPriceCents, setEditPriceCents] = useState<number | "">("");

  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-tournaments", page, limit, search, status],
    queryFn: () => fetchAdminTournaments(page, limit, search, status),
  });

  const createMutation = useMutation({
    mutationFn: () => createTournament({
      title: newTitle,
      description: newDescription || undefined,
      image_url: newImageUrl || undefined,
      location: newLocation || undefined,
      game: newGame || undefined,
      starts_at: newStartsAt || undefined,
      ends_at: newEndsAt || undefined,
      max_participants: typeof newMaxParticipants === "number" ? newMaxParticipants : undefined,
      price_cents: typeof newPriceCents === "number" ? newPriceCents : 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      setNewTitle("");
      setNewDescription("");
      setNewImageUrl("");
      setNewLocation("");
      setNewGame("");
      setNewStartsAt("");
      setNewEndsAt("");
      setNewMaxParticipants("");
      setNewPriceCents("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingId) return Promise.resolve(null);
      return updateTournament(editingId, {
        title: editTitle,
        description: editDescription || undefined,
        image_url: editImageUrl || undefined,
        location: editLocation || undefined,
        game: editGame || undefined,
        starts_at: editStartsAt || undefined,
        ends_at: editEndsAt || undefined,
        max_participants: typeof editMaxParticipants === "number" ? editMaxParticipants : undefined,
        price_cents: typeof editPriceCents === "number" ? editPriceCents : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
    },
  });

  const tournaments = (data?.events || data?.tournaments || []) as TournamentItem[];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Turnamen</h1>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kelola turnamen esports: buat, edit, dan atur publikasi.
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

        {/* Create form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Input placeholder="Judul" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input placeholder="Deskripsi" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <Input placeholder="URL Gambar" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
          <Input placeholder="Lokasi" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
          <Input placeholder="Game" value={newGame} onChange={(e) => setNewGame(e.target.value)} />
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
          <Input
            placeholder="Maks Peserta"
            value={newMaxParticipants}
            onChange={(e) => setNewMaxParticipants(e.target.value ? Number(e.target.value) : "")}
            type="number"
          />
          <Input
            placeholder="Harga (Rp)"
            value={newPriceCents === "" ? "" : String(Number(newPriceCents) / 100)}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : 0;
              setNewPriceCents(v ? v * 100 : "");
            }}
            type="number"
          />
        </div>
        <div className="mt-3">
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newTitle || !newStartsAt}>
            {createMutation.isPending ? "Menyimpan..." : "Buat Turnamen"}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        {isLoading && <p>Memuat turnamen...</p>}
        {error && <p className="text-red-500">{(error as Error).message}</p>}
        {!isLoading && tournaments.length === 0 && <p>Tidak ada turnamen.</p>}

        {!isLoading && tournaments.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Judul</th>
                <th className="py-2">Game</th>
                <th className="py-2">Lokasi</th>
                <th className="py-2">Mulai</th>
                <th className="py-2">Selesai</th>
                <th className="py-2">Peserta</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t: TournamentItem) => {
                const isEditing = editingId === t.id;
                return (
                  <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">
                      {isEditing ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      ) : (
                        t.title
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input value={editGame} onChange={(e) => setEditGame(e.target.value)} />
                      ) : (
                        t.game || "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                      ) : (
                        t.location || "-"
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
                        t.starts_at ? new Date(t.starts_at).toLocaleString() : "-"
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
                        t.ends_at ? new Date(t.ends_at).toLocaleString() : "-"
                      )}
                    </td>
                    <td className="py-2">{t.event_stats?.participants ?? 0}</td>
                    <td className="py-2 flex gap-2">
                      {!isEditing ? (
                        <Button
                          onClick={() => {
                            setEditingId(t.id);
                            setEditTitle(t.title || "");
                            setEditDescription(t.description || "");
                            setEditImageUrl(t.image_url || "");
                            setEditLocation(t.location || "");
                            setEditGame((t as any)?.game || "");
                            setEditStartsAt(t.starts_at ? t.starts_at.slice(0, 16) : "");
                            setEditEndsAt(t.ends_at ? t.ends_at.slice(0, 16) : "");
                            setEditMaxParticipants(typeof t.max_participants === "number" ? t.max_participants : "");
                            setEditPriceCents(typeof t.price_cents === "number" ? t.price_cents : "");
                          }}
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Batal
                          </Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(t.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Hapus
                      </Button>
                      <Link href={`/tournaments/${t.id}`}>
                        <Button variant="secondary">Lihat</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <span>
              Halaman {page} dari {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => (pagination && page < pagination.totalPages ? p + 1 : p))}
              disabled={!pagination || page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}