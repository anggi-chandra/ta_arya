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
  game?: string;
  image_url?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  max_participants?: number;
  price_cents?: number;
  event_stats?: { participants?: number } | null;
  live_url?: string;
};

async function fetchAdminEvents(page: number, limit: number, search: string, status: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await fetch(`/api/admin/events?${params.toString()}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Gagal memuat data event");
  return res.json() as Promise<{ events: EventItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
}

async function createEvent(payload: Partial<EventItem>) {
  const res = await fetch(`/api/admin/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal membuat event");
  }
  return res.json();
}

async function updateEvent(id: string, payload: Partial<EventItem>) {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal memperbarui event");
  }
  return res.json();
}

async function deleteEvent(id: string) {
  const res = await fetch(`/api/admin/events/${id}`, { 
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Gagal menghapus event");
  return res.json();
}

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newGame, setNewGame] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newEndsAt, setNewEndsAt] = useState("");
  const [newMaxParticipants, setNewMaxParticipants] = useState<number | "">("");
  const [newPriceCents, setNewPriceCents] = useState<number | "">("");
  const [newLiveUrl, setNewLiveUrl] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGame, setEditGame] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editMaxParticipants, setEditMaxParticipants] = useState<number | "">("");
  const [editPriceCents, setEditPriceCents] = useState<number | "">("");
  const [editLiveUrl, setEditLiveUrl] = useState("");

  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-events", page, limit, search, status],
    queryFn: () => fetchAdminEvents(page, limit, search, status),
  });

  // Upload mutation for images
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'events'); // Specify upload type for events
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengunggah gambar');
      }
      const data = await res.json();
      return data.publicUrl;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = newImageUrl;
      // Upload image file if provided
      if (newImageFile) {
        imageUrl = await uploadMutation.mutateAsync(newImageFile);
      }
      return createEvent({
        title: newTitle,
        description: newDescription || undefined,
        game: newGame || undefined,
        image_url: imageUrl || undefined,
        location: newLocation || undefined,
        starts_at: newStartsAt || undefined,
        ends_at: newEndsAt || undefined,
        max_participants: newMaxParticipants ? Number(newMaxParticipants) : undefined,
        // Convert Rupiah to cents (multiply by 100)
        price_cents: newPriceCents ? Number(newPriceCents) * 100 : 0,
        live_url: newLiveUrl || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setNewTitle("");
      setNewDescription("");
      setNewGame("");
      setNewImageUrl("");
      setNewImageFile(null);
      setNewImagePreview(null);
      setNewLocation("");
      setNewStartsAt("");
      setNewEndsAt("");
      setNewMaxParticipants("");
      setNewPriceCents("");
      setNewLiveUrl("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return Promise.resolve(null);
      let imageUrl = editImageUrl;
      // Upload image file if provided
      if (editImageFile) {
        imageUrl = await uploadMutation.mutateAsync(editImageFile);
      }
      return updateEvent(editingId, {
        title: editTitle,
        description: editDescription || undefined,
        game: editGame || undefined,
        image_url: imageUrl || undefined,
        location: editLocation || undefined,
        starts_at: editStartsAt || undefined,
        ends_at: editEndsAt || undefined,
        max_participants: editMaxParticipants ? Number(editMaxParticipants) : undefined,
        // Convert Rupiah to cents (multiply by 100)
        price_cents: editPriceCents ? Number(editPriceCents) * 100 : 0,
        live_url: editLiveUrl || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEditingId(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
          <Button onClick={() => setPage(1)}>Cari</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Judul Event *" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              required
            />
            <Input 
              placeholder="Game (contoh: Mobile Legends, Valorant)" 
              value={newGame} 
              onChange={(e) => setNewGame(e.target.value)}
            />
          </div>
          
          <Input 
            placeholder="Deskripsi Event" 
            value={newDescription} 
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Gambar Thumbnail Event
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Format: JPG, PNG, GIF, WebP (Maks. 5MB)
              </p>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size
                      const maxSize = 5 * 1024 * 1024; // 5MB
                      if (file.size > maxSize) {
                        alert('Ukuran file terlalu besar. Maksimum 5MB.');
                        e.target.value = ''; // Clear input
                        return;
                      }
                      setNewImageFile(file);
                      setNewImageUrl(""); // Clear URL if file is selected
                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90
                    file:cursor-pointer
                    border border-gray-300 dark:border-gray-700 rounded-md
                    bg-white dark:bg-gray-900"
                />
                {newImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={newImagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-md border border-gray-300 dark:border-gray-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewImageFile(null);
                        setNewImagePreview(null);
                      }}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Hapus Preview
                    </Button>
                  </div>
                )}
                {!newImageFile && (
                  <Input
                    type="text"
                    placeholder="Atau masukkan URL gambar"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      setNewImageFile(null);
                      setNewImagePreview(null);
                    }}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
            <Input 
              placeholder="Lokasi" 
              value={newLocation} 
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              placeholder="Tanggal & Waktu Mulai *"
              value={newStartsAt}
              onChange={(e) => setNewStartsAt(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              required
            />
            <Input
              type="datetime-local"
              placeholder="Tanggal & Waktu Selesai"
              value={newEndsAt}
              onChange={(e) => setNewEndsAt(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              placeholder="Max Peserta"
              value={newMaxParticipants}
              onChange={(e) => setNewMaxParticipants(e.target.value ? Number(e.target.value) : "")}
              min="1"
            />
            <Input
              type="number"
              placeholder="Harga (dalam Rupiah)"
              value={newPriceCents}
              onChange={(e) => setNewPriceCents(e.target.value ? Number(e.target.value) : "")}
              min="0"
            />
            <Input 
              placeholder="Link Live Stream (opsional)" 
              value={newLiveUrl} 
              onChange={(e) => setNewLiveUrl(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={createMutation.isPending || uploadMutation.isPending || !newTitle || !newStartsAt}
          >
            {createMutation.isPending || uploadMutation.isPending ? "Menyimpan..." : "Buat Event"}
          </Button>
          {(createMutation.isPending || uploadMutation.isPending) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 self-center">
              {uploadMutation.isPending ? "Mengupload gambar..." : "Menyimpan event..."}
            </p>
          )}
        </div>
        {(createMutation.error || uploadMutation.error) && (
          <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
            {uploadMutation.error?.message || createMutation.error?.message || "Terjadi kesalahan"}
          </div>
        )}
      </Card>

      <Card className="p-4">
        {isLoading && <p className="text-gray-500 dark:text-gray-400">Memuat event...</p>}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">Error:</p>
            <p className="text-red-500 dark:text-red-300 text-sm mt-1">{(error as Error).message}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}
        {!isLoading && !error && events.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada event.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {search || status ? 'Coba ubah filter pencarian atau status.' : 'Buat event pertama Anda menggunakan form di atas.'}
            </p>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Judul</th>
                <th className="py-2">Lokasi</th>
                <th className="py-2">Mulai</th>
                <th className="py-2">Selesai</th>
                <th className="py-2">Live URL</th>
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
                        <div className="space-y-2 min-w-[300px]">
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Judul" />
                          <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Deskripsi" />
                          <Input value={editGame} onChange={(e) => setEditGame(e.target.value)} placeholder="Game" />
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                              Gambar Thumbnail
                            </label>
                            <p className="text-xs text-gray-400 mb-1">Format: JPG, PNG, GIF, WebP (Maks. 5MB)</p>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Validate file size
                                  const maxSize = 5 * 1024 * 1024; // 5MB
                                  if (file.size > maxSize) {
                                    alert('Ukuran file terlalu besar. Maksimum 5MB.');
                                    e.target.value = ''; // Clear input
                                    return;
                                  }
                                  setEditImageFile(file);
                                  setEditImageUrl(""); // Clear URL if file is selected
                                  // Create preview
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditImagePreview(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-xs text-gray-500 dark:text-gray-400
                                file:mr-2 file:py-1 file:px-2
                                file:rounded file:border-0
                                file:text-xs file:font-semibold
                                file:bg-primary file:text-white
                                hover:file:bg-primary/90
                                file:cursor-pointer
                                border border-gray-300 dark:border-gray-700 rounded
                                bg-white dark:bg-gray-900"
                            />
                            {editImagePreview && (
                              <div className="mt-2">
                                <img 
                                  src={editImagePreview} 
                                  alt="Preview" 
                                  className="w-full h-32 object-cover rounded border border-gray-300 dark:border-gray-700"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditImageFile(null);
                                    setEditImagePreview(null);
                                  }}
                                  className="mt-1 text-red-600 hover:text-red-700 text-xs"
                                >
                                  Hapus Preview
                                </Button>
                              </div>
                            )}
                            {!editImageFile && (
                              <Input
                                type="text"
                                placeholder="Atau URL gambar"
                                value={editImageUrl}
                                onChange={(e) => {
                                  setEditImageUrl(e.target.value);
                                  setEditImageFile(null);
                                  setEditImagePreview(null);
                                }}
                                className="mt-1 text-xs"
                              />
                            )}
                            {!editImageFile && !editImagePreview && ev.image_url && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Gambar saat ini:</p>
                                <img 
                                  src={ev.image_url} 
                                  alt="Current" 
                                  className="w-full h-32 object-cover rounded border border-gray-300 dark:border-gray-700"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{ev.title}</div>
                          {ev.game && <div className="text-xs text-gray-500">{ev.game}</div>}
                          {ev.image_url && (
                            <img 
                              src={ev.image_url} 
                              alt={ev.title} 
                              className="w-20 h-20 object-cover rounded mt-2 border border-gray-300 dark:border-gray-700"
                            />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Lokasi" />
                      ) : (
                        ev.location || "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input
                          type="datetime-local"
                          value={editStartsAt}
                          onChange={(e) => setEditStartsAt(e.target.value)}
                          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        />
                      ) : (
                        ev.starts_at ? new Date(ev.starts_at).toLocaleString('id-ID') : "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input
                          type="datetime-local"
                          value={editEndsAt}
                          onChange={(e) => setEditEndsAt(e.target.value)}
                          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        />
                      ) : (
                        ev.ends_at ? new Date(ev.ends_at).toLocaleString('id-ID') : "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <Input 
                          placeholder="Link Live Stream" 
                          value={editLiveUrl} 
                          onChange={(e) => setEditLiveUrl(e.target.value)}
                        />
                      ) : (
                        ev.live_url ? (
                          <a href={ev.live_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                            Tonton Live
                          </a>
                        ) : "-"
                      )}
                    </td>
                    <td className="py-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="Max Peserta"
                            value={editMaxParticipants}
                            onChange={(e) => setEditMaxParticipants(e.target.value ? Number(e.target.value) : "")}
                            min="1"
                          />
                          <Input
                            type="number"
                            placeholder="Harga (Rupiah)"
                            value={editPriceCents}
                            onChange={(e) => setEditPriceCents(e.target.value ? Number(e.target.value) : "")}
                            min="0"
                          />
                        </div>
                      ) : (
                        <div>
                          <div>{ev.event_stats?.participants ?? 0} / {ev.max_participants || "-"}</div>
                          {ev.price_cents !== undefined && (
                            <div className="text-xs text-gray-500">
                              {ev.price_cents > 0 ? `Rp ${(ev.price_cents / 100).toLocaleString('id-ID')}` : 'Gratis'}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2 flex gap-2">
                      {!isEditing ? (
                        <Button
                          onClick={() => {
                            setEditingId(ev.id);
                            setEditTitle(ev.title || "");
                            setEditDescription(ev.description || "");
                            setEditGame(ev.game || "");
                            setEditImageUrl(ev.image_url || "");
                            setEditImageFile(null);
                            setEditImagePreview(null);
                            setEditLocation(ev.location || "");
                            setEditStartsAt(ev.starts_at ? ev.starts_at.slice(0, 16) : "");
                            setEditEndsAt(ev.ends_at ? ev.ends_at.slice(0, 16) : "");
                            setEditMaxParticipants(ev.max_participants || "");
                            // Convert cents to Rupiah for display (divide by 100)
                            setEditPriceCents(ev.price_cents ? ev.price_cents / 100 : "");
                            setEditLiveUrl(ev.live_url || "");
                          }}
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button 
                            onClick={() => updateMutation.mutate()} 
                            disabled={updateMutation.isPending || uploadMutation.isPending}
                          >
                            {updateMutation.isPending || uploadMutation.isPending ? "Menyimpan..." : "Simpan"}
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => {
                              setEditingId(null);
                              setEditImageFile(null);
                              setEditImagePreview(null);
                            }}
                          >
                            Batal
                          </Button>
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