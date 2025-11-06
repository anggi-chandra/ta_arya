"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type AdminContent = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  type: "blog" | "news" | "article" | "page";
  status: "draft" | "published" | "archived";
  featured_image_url?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
};

type ContentListResponse = {
  content: AdminContent[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function AdminContentPage() {
  const queryClient = useQueryClient();

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("article");
  const [newStatus, setNewStatus] = useState("draft");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("article");
  const [editStatus, setEditStatus] = useState("draft");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data, isLoading, isError } = useQuery<ContentListResponse>({
    queryKey: [
      "admin-content",
      { search, type, status, page, limit },
    ],
    queryFn: async (): Promise<ContentListResponse> => {
      const params = new URLSearchParams({
        search,
        type,
        status,
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/content?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat konten");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          status: newStatus,
          excerpt: newExcerpt || undefined,
          content: newContent,
        }),
      });
      if (!res.ok) throw new Error("Gagal membuat artikel");
      return res.json();
    },
    onSuccess: () => {
      setNewTitle("");
      setNewExcerpt("");
      setNewContent("");
      setNewType("article");
      setNewStatus("draft");
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: Partial<AdminContent> }) => {
      const res = await fetch(`/api/admin/content/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) throw new Error("Gagal memperbarui artikel");
      return res.json();
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus artikel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
  });

  const startEdit = (item: AdminContent) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditType(item.type);
    setEditStatus(item.status);
    setEditExcerpt(item.excerpt || "");
    setEditContent(item.content || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Konten</h1>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      {/* Filter & search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Pencarian</Label>
            <Input
              id="search"
              placeholder="Judul/isi/ekscerpt"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="type">Tipe</Label>
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="article">Artikel</option>
              <option value="blog">Blog</option>
              <option value="news">Berita</option>
              <option value="page">Halaman</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-content"] })}>
              Cari
            </Button>
          </div>
        </div>
      </Card>

      {/* Create form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Buat Artikel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="newTitle">Judul</Label>
            <Input id="newTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="newType">Tipe</Label>
            <Select id="newType" value={newType} onChange={(e) => setNewType(e.target.value)}>
              <option value="article">Artikel</option>
              <option value="blog">Blog</option>
              <option value="news">Berita</option>
              <option value="page">Halaman</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="newStatus">Status</Label>
            <Select id="newStatus" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="newExcerpt">Ekscerpt (opsional)</Label>
            <Input id="newExcerpt" value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="newContent">Konten</Label>
            <textarea
              id="newContent"
              className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent p-2"
              rows={6}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newTitle || !newContent}>
            {createMutation.isPending ? "Menyimpan..." : "Buat Artikel"}
          </Button>
          <Button variant="ghost" onClick={() => { setNewTitle(""); setNewExcerpt(""); setNewContent(""); setNewType("article"); setNewStatus("draft"); }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* List & inline edit */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Daftar Konten</h2>
        {isLoading && <p>Memuat...</p>}
        {isError && <p className="text-red-500">Gagal memuat data.</p>}
        {!isLoading && data?.content?.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">Belum ada konten.</p>
        )}

        {!isLoading && data?.content && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                  <th className="py-2 pr-4">Judul</th>
                  <th className="py-2 pr-4">Tipe</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Dipublikasikan</th>
                  <th className="py-2 pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((item: AdminContent) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      ) : (
                        <span className="font-medium">{item.title}</span>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {item.excerpt}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <Select value={editType} onChange={(e) => setEditType(e.target.value)}>
                          <option value="article">Artikel</option>
                          <option value="blog">Blog</option>
                          <option value="news">Berita</option>
                          <option value="page">Halaman</option>
                        </Select>
                      ) : (
                        <span>{item.type}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </Select>
                      ) : (
                        <span>{item.status}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {item.published_at ? new Date(item.published_at).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              updateMutation.mutate({
                                id: item.id,
                                data: {
                                  title: editTitle,
                                  type: editType as AdminContent["type"],
                                  status: editStatus as AdminContent["status"],
                                  excerpt: editExcerpt,
                                  content: editContent,
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