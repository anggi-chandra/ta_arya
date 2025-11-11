"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

async function createTeamRequest(data: {
  name: string;
  game: string;
  logo_url?: string;
  description?: string;
  recruiting: boolean;
}) {
  const res = await fetch("/api/teams/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal mengajukan permintaan tim");
  }
  return res.json();
}

export default function CreateTeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [recruiting, setRecruiting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const createMutation = useMutation({
    mutationFn: createTeamRequest,
    onSuccess: () => {
      alert("Permintaan pembuatan tim berhasil dikirim. Silakan tunggu persetujuan dari admin.");
      router.push("/dashboard/teams");
      queryClient.invalidateQueries({ queryKey: ["my-team-requests"] });
    },
    onError: (error: any) => {
      alert(error.message || "Gagal mengajukan permintaan tim");
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/teams/upload-logo', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Gagal upload logo');
      return res.json();
    },
    onSuccess: (data) => {
      setLogoUrl(data.url);
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file gambar yang diizinkan (JPEG, PNG, WebP, GIF)');
      return;
    }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !game) {
      alert("Nama tim dan game harus diisi");
      return;
    }
    createMutation.mutate({
      name,
      game,
      logo_url: logoUrl || undefined,
      description: description || undefined,
      recruiting,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/teams" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Tim Saya
        </Link>
      </div>

      <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Info:</strong> Permintaan pembuatan tim akan ditinjau oleh admin. Tim akan dibuat setelah permintaan disetujui.
        </p>
      </Card>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Ajukan Permintaan Pembuatan Tim</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Tim *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Masukkan nama tim"
              />
            </div>
            <div>
              <Label htmlFor="game">Game *</Label>
              <Input
                id="game"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                required
                placeholder="Contoh: Mobile Legends, PUBG Mobile"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL (opsional)</Label>
            <div className="flex gap-2">
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="URL logo atau upload di bawah"
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
            {logoUrl && (
              <div className="mt-2">
                <img
                  src={logoUrl}
                  alt="Preview logo"
                  className="w-16 h-16 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMzNi40MTgzIDIwIDQwIDIzLjU4MTcgNDAgMjhDNDAgMzIuNDE4MyAzNi40MTgzIDM2IDMyIDM2QzI3LjU4MTcgMzYgMjQgMzIuNDE4MyAyNCAyOEMyNCAyMy41ODE3IDI3LjU4MTcgMjAgMzIgMjBaTTI0IDQ0VjQ4SDQwVjQ0SDI0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent p-2"
              rows={4}
              placeholder="Deskripsi tim, visi misi, dll."
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recruiting}
                onChange={(e) => setRecruiting(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Membuka rekrutmen anggota</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={createMutation.isPending || !name || !game}
            >
              {createMutation.isPending ? "Mengirim..." : "Ajukan Permintaan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

