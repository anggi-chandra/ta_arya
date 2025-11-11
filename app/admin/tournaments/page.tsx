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
  game: string;
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  format: '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | 'custom';
  max_participants: number;
  prize_pool?: number;
  currency?: string;
  entry_fee?: number;
  location?: string;
  starts_at: string;
  ends_at?: string;
  registration_deadline: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  rules?: string;
  banner_url?: string;
  organizer_id?: string;
  created_at?: string;
  updated_at?: string;
};

async function fetchAdminTournaments(page: number, limit: number, search: string, status: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await fetch(`/api/admin/tournaments?${params.toString()}`, {
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal memuat data turnamen");
  }
  return res.json() as Promise<{ tournaments: TournamentItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
}

async function createTournament(payload: Partial<TournamentItem>) {
  const res = await fetch(`/api/admin/tournaments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal membuat turnamen");
  }
  return res.json();
}

async function updateTournament(id: string, payload: Partial<TournamentItem>) {
  const res = await fetch(`/api/admin/tournaments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal memperbarui turnamen");
  }
  return res.json();
}

async function deleteTournament(id: string) {
  const res = await fetch(`/api/admin/tournaments/${id}`, { 
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal menghapus turnamen");
  }
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
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newGame, setNewGame] = useState("");
  const [newTournamentType, setNewTournamentType] = useState<'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'>('single_elimination');
  const [newFormat, setNewFormat] = useState<'1v1' | '2v2' | '3v3' | '4v4' | '5v5' | 'custom'>('5v5');
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newEndsAt, setNewEndsAt] = useState("");
  const [newRegistrationDeadline, setNewRegistrationDeadline] = useState("");
  const [newMaxParticipants, setNewMaxParticipants] = useState<number | "">("");
  const [newPrizePool, setNewPrizePool] = useState<number | "">("");
  const [newCurrency, setNewCurrency] = useState("IDR");
  const [newEntryFee, setNewEntryFee] = useState<number | "">("");
  const [newRules, setNewRules] = useState("");
  const [newStatus, setNewStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editGame, setEditGame] = useState("");
  const [editTournamentType, setEditTournamentType] = useState<'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'>('single_elimination');
  const [editFormat, setEditFormat] = useState<'1v1' | '2v2' | '3v3' | '4v4' | '5v5' | 'custom'>('5v5');
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editRegistrationDeadline, setEditRegistrationDeadline] = useState("");
  const [editMaxParticipants, setEditMaxParticipants] = useState<number | "">("");
  const [editPrizePool, setEditPrizePool] = useState<number | "">("");
  const [editCurrency, setEditCurrency] = useState("IDR");
  const [editEntryFee, setEditEntryFee] = useState<number | "">("");
  const [editRules, setEditRules] = useState("");
  const [editStatus, setEditStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');

  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-tournaments", page, limit, search, status],
    queryFn: () => fetchAdminTournaments(page, limit, search, status),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'tournaments');
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
      let bannerUrl = newBannerUrl;
      if (newBannerFile) {
        bannerUrl = await uploadMutation.mutateAsync(newBannerFile);
      }
      return createTournament({
        title: newTitle,
        description: newDescription || undefined,
        game: newGame,
        tournament_type: newTournamentType,
        format: newFormat,
        max_participants: typeof newMaxParticipants === "number" ? newMaxParticipants : 0,
        prize_pool: typeof newPrizePool === "number" ? newPrizePool : 0,
        currency: newCurrency,
        entry_fee: typeof newEntryFee === "number" ? newEntryFee : 0,
        location: newLocation || undefined,
        starts_at: newStartsAt,
        ends_at: newEndsAt || undefined,
        registration_deadline: newRegistrationDeadline,
        status: newStatus,
        rules: newRules || undefined,
        banner_url: bannerUrl || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setNewTitle("");
      setNewDescription("");
      setNewBannerUrl("");
      setNewBannerFile(null);
      setNewLocation("");
      setNewGame("");
      setNewTournamentType('single_elimination');
      setNewFormat('5v5');
      setNewStartsAt("");
      setNewEndsAt("");
      setNewRegistrationDeadline("");
      setNewMaxParticipants("");
      setNewPrizePool("");
      setNewCurrency("IDR");
      setNewEntryFee("");
      setNewRules("");
      setNewStatus('upcoming');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return Promise.resolve(null);
      let bannerUrl = editBannerUrl;
      if (editBannerFile) {
        bannerUrl = await uploadMutation.mutateAsync(editBannerFile);
      }
      
      // Convert datetime-local to ISO string if provided
      let startsAtISO = editStartsAt;
      if (editStartsAt && editStartsAt.length === 16) {
        startsAtISO = new Date(editStartsAt).toISOString();
      }
      
      let endsAtISO = editEndsAt;
      if (editEndsAt && editEndsAt.length === 16) {
        endsAtISO = new Date(editEndsAt).toISOString();
      }
      
      let registrationDeadlineISO = editRegistrationDeadline;
      if (editRegistrationDeadline && editRegistrationDeadline.length === 16) {
        registrationDeadlineISO = new Date(editRegistrationDeadline).toISOString();
      }
      
      return updateTournament(editingId, {
        title: editTitle,
        description: editDescription || undefined,
        game: editGame,
        tournament_type: editTournamentType,
        format: editFormat,
        max_participants: typeof editMaxParticipants === "number" ? editMaxParticipants : undefined,
        prize_pool: editPrizePool === "" ? 0 : (typeof editPrizePool === "number" ? editPrizePool : 0),
        currency: editCurrency,
        entry_fee: editEntryFee === "" ? 0 : (typeof editEntryFee === "number" ? editEntryFee : 0),
        location: editLocation || undefined,
        starts_at: startsAtISO,
        ends_at: endsAtISO || undefined,
        registration_deadline: registrationDeadlineISO,
        status: editStatus,
        rules: editRules || undefined,
        banner_url: bannerUrl || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] }); // Refresh dashboard stats
      setEditingId(null);
      setEditBannerFile(null);
      alert("Turnamen berhasil diperbarui!");
    },
    onError: (error: Error) => {
      alert(`Gagal memperbarui turnamen: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      alert("Turnamen berhasil dihapus dari database.");
    },
    onError: (error: Error) => {
      alert(`Gagal menghapus turnamen: ${error.message}`);
    },
  });

  const handleDeleteTournament = (tournamentId: string, tournamentTitle: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus turnamen "${tournamentTitle}"?\n\nSemua data registrasi peserta untuk turnamen ini juga akan ikut terhapus.`)) {
      deleteMutation.mutate(tournamentId);
    }
  };

  const tournaments = data?.tournaments || [];
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Judul Turnamen *" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              required
            />
            <Input 
              placeholder="Game * (contoh: Mobile Legends, Valorant)" 
              value={newGame} 
              onChange={(e) => setNewGame(e.target.value)}
              required
            />
          </div>
          
          <Input 
            placeholder="Deskripsi" 
            value={newDescription} 
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Banner Turnamen
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
                      const maxSize = 5 * 1024 * 1024; // 5MB
                      if (file.size > maxSize) {
                        alert('Ukuran file terlalu besar. Maksimum 5MB.');
                        e.target.value = '';
                        return;
                      }
                      setNewBannerFile(file);
                      setNewBannerUrl("");
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
                {!newBannerFile && (
                  <Input
                    type="text"
                    placeholder="Atau masukkan URL banner"
                    value={newBannerUrl}
                    onChange={(e) => {
                      setNewBannerUrl(e.target.value);
                      setNewBannerFile(null);
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
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tipe Turnamen *
              </label>
              <select
                value={newTournamentType}
                onChange={(e) => setNewTournamentType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                required
              >
                <option value="single_elimination">Single Elimination</option>
                <option value="double_elimination">Double Elimination</option>
                <option value="round_robin">Round Robin</option>
                <option value="swiss">Swiss</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Format *
              </label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                required
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="4v4">4v4</option>
                <option value="5v5">5v5</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Input
              type="datetime-local"
              placeholder="Batas Registrasi *"
              value={newRegistrationDeadline}
              onChange={(e) => setNewRegistrationDeadline(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="number"
              placeholder="Max Peserta *"
              value={newMaxParticipants}
              onChange={(e) => setNewMaxParticipants(e.target.value ? Number(e.target.value) : "")}
              min="1"
              required
            />
            <Input
              type="number"
              placeholder="Prize Pool (Rp)"
              value={newPrizePool}
              onChange={(e) => setNewPrizePool(e.target.value ? Number(e.target.value) : "")}
              min="0"
            />
            <Input
              type="number"
              placeholder="Entry Fee (Rp)"
              value={newEntryFee}
              onChange={(e) => setNewEntryFee(e.target.value ? Number(e.target.value) : "")}
              min="0"
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Mata Uang
              </label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Aturan Turnamen
            </label>
            <textarea
              placeholder="Masukkan aturan turnamen..."
              value={newRules}
              onChange={(e) => setNewRules(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 min-h-[100px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Status Turnamen *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              required
            >
              <option value="upcoming">Akan Datang</option>
              <option value="ongoing">Sedang Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={createMutation.isPending || uploadMutation.isPending || !newTitle || !newGame || !newStartsAt || !newRegistrationDeadline || !newMaxParticipants}
          >
            {createMutation.isPending || uploadMutation.isPending ? "Menyimpan..." : "Buat Turnamen"}
          </Button>
          {(createMutation.isPending || uploadMutation.isPending) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 self-center">
              {uploadMutation.isPending ? "Mengupload banner..." : "Menyimpan turnamen..."}
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
        {isLoading && <p>Memuat turnamen...</p>}
        {error && <p className="text-red-500">{(error as Error).message}</p>}
        {!isLoading && tournaments.length === 0 && <p>Tidak ada turnamen.</p>}

        {!isLoading && tournaments.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Judul</th>
                <th className="py-2">Game</th>
                <th className="py-2">Banner</th>
                <th className="py-2">Tipe/Format</th>
                <th className="py-2">Lokasi</th>
                <th className="py-2">Mulai</th>
                <th className="py-2">Reg Deadline</th>
                <th className="py-2">Fee/Pool</th>
                <th className="py-2">Max Peserta</th>
                <th className="py-2">Status</th>
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
                         <div>
                           <Input
                             type="file"
                             accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 const maxSize = 5 * 1024 * 1024; // 5MB
                                 if (file.size > maxSize) {
                                   alert('Ukuran file terlalu besar. Maksimum 5MB.');
                                   e.target.value = '';
                                   return;
                                 }
                                 setEditBannerFile(file);
                                 setEditBannerUrl("");
                               }
                             }}
                           />
                           {editBannerUrl && !editBannerFile && t.banner_url && (
                             <img src={t.banner_url} alt="Preview" className="w-20 h-20 mt-2" />
                           )}
                         </div>
                       ) : (
                         t.banner_url ? <img src={t.banner_url} alt={t.title} className="w-20 h-20 object-cover rounded" /> : '-'
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <div className="space-y-1">
                           <select
                             value={editTournamentType}
                             onChange={(e) => setEditTournamentType(e.target.value as any)}
                             className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                           >
                             <option value="single_elimination">Single Elim</option>
                             <option value="double_elimination">Double Elim</option>
                             <option value="round_robin">Round Robin</option>
                             <option value="swiss">Swiss</option>
                           </select>
                           <select
                             value={editFormat}
                             onChange={(e) => setEditFormat(e.target.value as any)}
                             className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                           >
                             <option value="1v1">1v1</option>
                             <option value="2v2">2v2</option>
                             <option value="3v3">3v3</option>
                             <option value="4v4">4v4</option>
                             <option value="5v5">5v5</option>
                             <option value="custom">Custom</option>
                           </select>
                         </div>
                       ) : (
                         <div className="text-xs">
                           <div className="font-medium">{t.tournament_type?.replace('_', ' ') || '-'}</div>
                           <div>{t.format || '-'}</div>
                         </div>
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="text-xs" />
                       ) : (
                         <div className="text-xs">{t.location || "-"}</div>
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <input
                           type="datetime-local"
                           value={editStartsAt}
                           onChange={(e) => setEditStartsAt(e.target.value)}
                           className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                         />
                       ) : (
                         <div className="text-xs">{t.starts_at ? new Date(t.starts_at).toLocaleDateString('id-ID') : "-"}</div>
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <input
                           type="datetime-local"
                           value={editRegistrationDeadline}
                           onChange={(e) => setEditRegistrationDeadline(e.target.value)}
                           className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                         />
                       ) : (
                         <div className="text-xs">{t.registration_deadline ? new Date(t.registration_deadline).toLocaleDateString('id-ID') : "-"}</div>
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <div className="space-y-1">
                           <Input
                             value={editEntryFee}
                             onChange={(e) => setEditEntryFee(e.target.value ? Number(e.target.value) : "")}
                             type="number"
                             placeholder="Entry Fee"
                             className="text-xs"
                           />
                           <Input
                             value={editPrizePool}
                             onChange={(e) => {
                               const val = e.target.value;
                               setEditPrizePool(val === "" ? "" : Number(val));
                             }}
                             type="number"
                             min="0"
                             placeholder="Prize Pool"
                             className="text-xs"
                           />
                         </div>
                       ) : (
                         <div className="text-xs">
                           <div>Fee: {t.entry_fee ? `Rp ${t.entry_fee.toLocaleString()}` : 'Gratis'}</div>
                           <div>Pool: {t.prize_pool ? `Rp ${t.prize_pool.toLocaleString()}` : '-'}</div>
                         </div>
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <Input
                           value={editMaxParticipants}
                           onChange={(e) => setEditMaxParticipants(e.target.value ? Number(e.target.value) : "")}
                           type="number"
                           placeholder="Max"
                           className="text-xs w-16"
                         />
                       ) : (
                         <div className="text-xs">{t.max_participants || "-"}</div>
                       )}
                     </td>
                     <td className="py-2">
                       {isEditing ? (
                         <select
                           value={editStatus}
                           onChange={(e) => setEditStatus(e.target.value as any)}
                           className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                         >
                           <option value="upcoming">Akan Datang</option>
                           <option value="ongoing">Berlangsung</option>
                           <option value="completed">Selesai</option>
                           <option value="cancelled">Dibatalkan</option>
                         </select>
                       ) : (
                         <div className="text-xs">
                           <span className={`px-2 py-1 rounded ${
                             t.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                             t.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                             t.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                             'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                           }`}>
                             {t.status || 'upcoming'}
                           </span>
                         </div>
                       )}
                     </td>
                     <td className="py-2 flex gap-2 flex-wrap">
                       {!isEditing ? (
                         <Button
                           size="sm"
                           onClick={() => {
                             setEditingId(t.id);
                             setEditTitle(t.title || "");
                             setEditDescription(t.description || "");
                             setEditBannerUrl(t.banner_url || "");
                             setEditBannerFile(null);
                             setEditLocation(t.location || "");
                             setEditGame(t.game || "");
                             setEditTournamentType(t.tournament_type || 'single_elimination');
                             setEditFormat(t.format || '5v5');
                            // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
                            setEditStartsAt(t.starts_at ? new Date(t.starts_at).toISOString().slice(0, 16) : "");
                            setEditEndsAt(t.ends_at ? new Date(t.ends_at).toISOString().slice(0, 16) : "");
                            setEditRegistrationDeadline(t.registration_deadline ? new Date(t.registration_deadline).toISOString().slice(0, 16) : "");
                             setEditMaxParticipants(t.max_participants ?? "");
                             setEditPrizePool(t.prize_pool ?? 0);
                             setEditCurrency(t.currency || "IDR");
                             setEditEntryFee(t.entry_fee ?? 0);
                             setEditRules(t.rules || "");
                             setEditStatus(t.status || 'upcoming');
                           }}
                         >
                           Edit
                         </Button>
                       ) : (
                         <>
                           <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || uploadMutation.isPending}>
                             {updateMutation.isPending || uploadMutation.isPending ? "Menyimpan..." : "Simpan"}
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               setEditingId(null);
                               setEditBannerFile(null);
                             }}
                           >
                             Batal
                           </Button>
                         </>
                       )}
                       <Button
                         size="sm"
                         variant="destructive"
                         onClick={() => handleDeleteTournament(t.id, t.title)}
                         disabled={deleteMutation.isPending}
                       >
                         {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
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