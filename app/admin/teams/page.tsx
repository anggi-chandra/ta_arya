"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type AdminTeam = {
  id: string;
  name: string;
  game: string;
  logo_url?: string | null;
  description?: string | null;
  recruiting: boolean;
  created_at: string;
  owner_id?: string | null;
};

type TeamsListResponse = {
  teams: (AdminTeam & { member_count?: number; achievement_count?: number })[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function AdminTeamsPage() {
  const queryClient = useQueryClient();

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [game, setGame] = useState<string>("");
  const [recruiting, setRecruiting] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newGame, setNewGame] = useState("");
  const [newRecruiting, setNewRecruiting] = useState("false");
  const [newLogo, setNewLogo] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGame, setEditGame] = useState("");
  const [editRecruiting, setEditRecruiting] = useState("false");
  const [editLogo, setEditLogo] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data, isLoading, isError } = useQuery<TeamsListResponse>({
    queryKey: [
      "admin-teams",
      { search, game, recruiting, page, limit },
    ],
    queryFn: async (): Promise<TeamsListResponse> => {
      const params = new URLSearchParams({
        search,
        game,
        recruiting,
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/teams?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat tim");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          game: newGame,
          recruiting: newRecruiting === "true",
          logo_url: newLogo || undefined,
          description: newDescription || undefined,
        }),
      });
      if (!res.ok) throw new Error("Gagal membuat tim");
      return res.json();
    },
    onSuccess: () => {
      setNewName("");
      setNewGame("");
      setNewRecruiting("false");
      setNewLogo("");
      setNewDescription("");
      queryClient.invalidateQueries({ queryKey: ["admin-teams"] });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/teams/upload-logo', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Gagal upload logo');
      return res.json();
    },
    onSuccess: (data) => {
      setNewLogo(data.url);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: Partial<AdminTeam> }) => {
      const res = await fetch(`/api/admin/teams/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) throw new Error("Gagal memperbarui tim");
      return res.json();
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-teams"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus tim");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teams"] });
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file gambar yang diizinkan (JPEG, PNG, WebP, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      await uploadLogoMutation.mutateAsync(file);
    } catch (error) {
      alert('Gagal upload logo: ' + (error as Error).message);
    } finally {
      setUploadingLogo(false);
    }
  };
  const startEdit = (item: AdminTeam) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditGame(item.game);
    setEditRecruiting(item.recruiting ? "true" : "false");
    setEditLogo(item.logo_url || "");
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tim</h1>

      {/* Filter & search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Pencarian</Label>
            <Input
              id="search"
              placeholder="Nama/Deskripsi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="game">Game</Label>
            <Input id="game" value={game} onChange={(e) => setGame(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="recruiting">Rekrut Anggota</Label>
            <Select id="recruiting" value={recruiting} onChange={(e) => setRecruiting(e.target.value)}>
              <option value="">Semua</option>
              <option value="true">Sedang merekrut</option>
              <option value="false">Tidak merekrut</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-teams"] })}>
              Cari
            </Button>
          </div>
        </div>
      </Card>

      {/* Create form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Buat Tim</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="newName">Nama Tim</Label>
            <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="newGame">Game</Label>
            <Input id="newGame" value={newGame} onChange={(e) => setNewGame(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="newRecruiting">Rekrut Anggota</Label>
            <Select id="newRecruiting" value={newRecruiting} onChange={(e) => setNewRecruiting(e.target.value)}>
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="newLogo">Logo</Label>
            <div className="flex gap-2">
              <Input 
                id="newLogo" 
                value={newLogo} 
                onChange={(e) => setNewLogo(e.target.value)} 
                placeholder="URL Logo atau upload di bawah"
              />
            </div>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploadingLogo}
              />
              <label htmlFor="logo-upload">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={uploadingLogo}
                  className="cursor-pointer"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  {uploadingLogo ? "Mengupload..." : "Upload Logo"}
                </Button>
              </label>
            </div>
            {newLogo && (
              <div className="mt-2">
                <img 
                  src={newLogo} 
                  alt="Preview logo" 
                  className="w-16 h-16 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMzNi40MTgzIDIwIDQwIDIzLjU4MTcgNDAgMjhDNDAgMzIuNDE4MyAzNi40MTgzIDM2IDMyIDM2QzI3LjU4MTcgMzYgMjQgMzIuNDE4MyAyNCAyOEMyNCAyMy41ODE3IDI3LjU4MTcgMjAgMzIgMjBaTTI0IDQ0VjQ4SDQwVjQ0SDI0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="newDescription">Deskripsi (opsional)</Label>
            <textarea
              id="newDescription"
              className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent p-2"
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !newName || !newGame}
          >
            {createMutation.isPending ? "Menyimpan..." : "Buat Tim"}
          </Button>
          <Button variant="ghost" onClick={() => { setNewName(""); setNewGame(""); setNewRecruiting("false"); setNewLogo(""); setNewDescription(""); }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* List & inline edit */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Daftar Tim</h2>
        {isLoading && <p>Memuat...</p>}
        {isError && <p className="text-red-500">Gagal memuat data.</p>}
        {!isLoading && data?.teams?.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">Belum ada tim.</p>
        )}

        {!isLoading && data?.teams && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                  <th className="py-2 pr-4">Logo</th>
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Game</th>
                  <th className="py-2 pr-4">Rekrut</th>
                  <th className="py-2 pr-4">Anggota</th>
                  <th className="py-2 pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.teams.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <Input
                          value={editLogo}
                          onChange={(e) => setEditLogo(e.target.value)}
                          placeholder="Logo URL"
                        />
                      ) : item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt={`${item.name} logo`}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Logo</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                          <textarea
                            className="mt-2 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent p-2 text-xs"
                            rows={2}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Deskripsi"
                          />
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <Input value={editGame} onChange={(e) => setEditGame(e.target.value)} />
                      ) : (
                        <span>{item.game}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <Select value={editRecruiting} onChange={(e) => setEditRecruiting(e.target.value)}>
                          <option value="false">Tidak</option>
                          <option value="true">Ya</option>
                        </Select>
                      ) : (
                        <span>{item.recruiting ? "Ya" : "Tidak"}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {item.member_count ?? 0}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              updateMutation.mutate({
                                id: item.id,
                                data: {
                                  name: editName,
                                  game: editGame,
                                  recruiting: editRecruiting === "true",
                                  logo_url: editLogo || undefined,
                                  description: editDescription || undefined,
                                },
                              })
                            }
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                          </Button>
                          <Button variant="ghost" onClick={cancelEdit}>Batal</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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