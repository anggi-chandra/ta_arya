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
  featured_image?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
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
  const [newFeaturedImage, setNewFeaturedImage] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("article");
  const [editStatus, setEditStatus] = useState("draft");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFeaturedImage, setEditFeaturedImage] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const { data, isLoading, isError, error } = useQuery<ContentListResponse>({
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
      const res = await fetch(`/api/admin/content?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error fetching content:", errorData);
        throw new Error(errorData.error || "Gagal memuat konten");
      }
      const result = await res.json();
      console.log("Fetched content:", result);
      return result;
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/content/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal upload gambar');
      }
      return res.json();
    },
  });

  // Handle image upload for new content
  const handleNewImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file gambar yang diizinkan (JPEG, PNG, WebP, GIF)');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      event.target.value = '';
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setNewImageFile(file);
    setUploadingNewImage(true);
    
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setNewFeaturedImage(result.url);
      setUploadingNewImage(false);
    } catch (error: any) {
      setNewImagePreview(null);
      setNewImageFile(null);
      setNewFeaturedImage('');
      setUploadingNewImage(false);
      event.target.value = '';
      alert('Gagal upload gambar: ' + error.message);
    }
  };

  // Handle image upload for edit content
  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file gambar yang diizinkan (JPEG, PNG, WebP, GIF)');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      event.target.value = '';
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setEditImageFile(file);
    setUploadingEditImage(true);
    
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setEditFeaturedImage(result.url);
      setUploadingEditImage(false);
    } catch (error: any) {
      setEditImagePreview(null);
      setEditImageFile(null);
      setEditFeaturedImage('');
      setUploadingEditImage(false);
      event.target.value = '';
      alert('Gagal upload gambar: ' + error.message);
    }
  };

  // Handle remove image for new content
  const handleRemoveNewImage = () => {
    setNewFeaturedImage("");
    setNewImageFile(null);
    setNewImagePreview(null);
    const fileInput = document.getElementById('newFeaturedImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle remove image for edit content
  const handleRemoveEditImage = () => {
    setEditFeaturedImage("");
    setEditImageFile(null);
    setEditImagePreview(null);
    const fileInput = document.getElementById('editFeaturedImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

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
          featured_image: newFeaturedImage || undefined,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal membuat artikel");
      }
      return res.json();
    },
    onSuccess: () => {
      setNewTitle("");
      setNewExcerpt("");
      setNewContent("");
      setNewType("article");
      setNewStatus("draft");
      setNewFeaturedImage("");
      setNewImageFile(null);
      setNewImagePreview(null);
      // Invalidate and refetch immediately
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      // Also refetch to ensure data is up to date
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["admin-content"] });
      }, 500);
    },
    onError: (error: any) => {
      console.error("Error creating content:", error);
      alert(error.message || "Gagal membuat artikel");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: Partial<AdminContent> }) => {
      const res = await fetch(`/api/admin/content/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal memperbarui artikel");
      }
      return res.json();
    },
    onSuccess: () => {
      setEditingId(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
    onError: (error: any) => {
      console.error("Error updating content:", error);
      alert(error.message || "Gagal memperbarui artikel");
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
    setEditFeaturedImage(item.featured_image || "");
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditFeaturedImage("");
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
            <Label htmlFor="newFeaturedImage">Gambar Featured (opsional)</Label>
            <div className="mt-1 space-y-3">
              {/* Image Preview */}
              {(newImagePreview || newFeaturedImage) && (
                <div className="relative inline-block">
                  <img
                    src={newFeaturedImage || newImagePreview || ''}
                    alt="Preview"
                    className="h-48 w-auto rounded-md border border-gray-300 dark:border-gray-600 object-cover"
                    onError={(e) => {
                      if (newFeaturedImage && newImagePreview) {
                        (e.target as HTMLImageElement).src = newImagePreview;
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveNewImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    title="Hapus gambar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {newFeaturedImage && !uploadingNewImage && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      ✓ Upload berhasil
                    </div>
                  )}
                </div>
              )}
              
              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  id="newFeaturedImage"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleNewImageUpload}
                  className="hidden"
                  disabled={uploadingNewImage}
                />
                <label
                  htmlFor="newFeaturedImage"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer ${
                    uploadingNewImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingNewImage ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {newFeaturedImage ? 'Ganti Gambar' : 'Upload Gambar'}
                    </>
                  )}
                </label>
              </div>

              {/* Or use URL */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    atau
                  </span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <Input
                  id="newFeaturedImageUrl"
                  value={newFeaturedImage}
                  onChange={(e) => {
                    setNewFeaturedImage(e.target.value);
                    setNewImagePreview(null);
                    setNewImageFile(null);
                    const fileInput = document.getElementById('newFeaturedImage') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.value = '';
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  disabled={uploadingNewImage}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newImageFile 
                    ? 'Gambar sudah diupload. Kosongkan URL ini untuk menggunakan gambar yang sudah diupload.'
                    : 'Masukkan URL gambar jika Anda tidak ingin mengupload file'}
                </p>
              </div>
            </div>
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
          <Button variant="ghost" onClick={() => { 
            setNewTitle(""); 
            setNewExcerpt(""); 
            setNewContent(""); 
            setNewType("article"); 
            setNewStatus("draft");
            setNewFeaturedImage("");
            setNewImageFile(null);
            setNewImagePreview(null);
          }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* List & inline edit */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Daftar Konten</h2>
        {isLoading && <p>Memuat...</p>}
        {isError && (
          <div className="text-red-500">
            <p>Gagal memuat data.</p>
            {error && (
              <p className="text-sm mt-2">
                {error instanceof Error ? error.message : "Terjadi kesalahan"}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-content"] })}
              className="mt-2"
            >
              Coba Lagi
            </Button>
          </div>
        )}
        {!isLoading && !isError && data?.content?.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">Belum ada konten.</p>
        )}
        {!isLoading && !isError && data && data.content && data.content.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Menampilkan {data.content.length} dari {data.pagination?.total || 0} konten
          </p>
        )}

        {/* Edit Form (shown when editing) */}
        {editingId && (
          <Card className="p-6 mb-6 border-2 border-blue-500">
            <h2 className="text-xl font-semibold mb-4">Edit Artikel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTitle">Judul</Label>
                <Input id="editTitle" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editType">Tipe</Label>
                <Select id="editType" value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <option value="article">Artikel</option>
                  <option value="blog">Blog</option>
                  <option value="news">Berita</option>
                  <option value="page">Halaman</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select id="editStatus" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="editExcerpt">Ekscerpt (opsional)</Label>
                <Input id="editExcerpt" value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editFeaturedImage">Gambar Featured (opsional)</Label>
                <div className="mt-1 space-y-3">
                  {/* Image Preview */}
                  {(editImagePreview || editFeaturedImage) && (
                    <div className="relative inline-block">
                      <img
                        src={editFeaturedImage || editImagePreview || ''}
                        alt="Preview"
                        className="h-48 w-auto rounded-md border border-gray-300 dark:border-gray-600 object-cover"
                        onError={(e) => {
                          if (editFeaturedImage && editImagePreview) {
                            (e.target as HTMLImageElement).src = editImagePreview;
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveEditImage}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        title="Hapus gambar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {editFeaturedImage && !uploadingEditImage && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          ✓ Upload berhasil
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="editFeaturedImage"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleEditImageUpload}
                      className="hidden"
                      disabled={uploadingEditImage}
                    />
                    <label
                      htmlFor="editFeaturedImage"
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer ${
                        uploadingEditImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingEditImage ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <svg
                            className="-ml-1 mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {editFeaturedImage ? 'Ganti Gambar' : 'Upload Gambar'}
                        </>
                      )}
                    </label>
                  </div>

                  {/* Or use URL */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                        atau
                      </span>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <Input
                      id="editFeaturedImageUrl"
                      value={editFeaturedImage}
                      onChange={(e) => {
                        setEditFeaturedImage(e.target.value);
                        setEditImagePreview(null);
                        setEditImageFile(null);
                        const fileInput = document.getElementById('editFeaturedImage') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                      disabled={uploadingEditImage}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {editImageFile 
                        ? 'Gambar sudah diupload. Kosongkan URL ini untuk menggunakan gambar yang sudah diupload.'
                        : 'Masukkan URL gambar jika Anda tidak ingin mengupload file'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editContent">Konten</Label>
                <textarea
                  id="editContent"
                  className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent p-2"
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() =>
                  updateMutation.mutate({
                    id: editingId,
                    data: {
                      title: editTitle,
                      type: editType as AdminContent["type"],
                      status: editStatus as AdminContent["status"],
                      excerpt: editExcerpt,
                      content: editContent,
                      featured_image: editFeaturedImage || undefined,
                    },
                  })
                }
                disabled={updateMutation.isPending || !editTitle || !editContent}
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                Batal
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && data?.content && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                  <th className="py-2 pr-4">Judul</th>
                  <th className="py-2 pr-4">Tipe</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Gambar</th>
                  <th className="py-2 pr-4">Dipublikasikan</th>
                  <th className="py-2 pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((item: AdminContent) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      <span className="font-medium">{item.title}</span>
                      {item.excerpt && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {item.excerpt}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span>{item.type}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : item.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {item.featured_image ? (
                        <img
                          src={item.featured_image}
                          alt={item.title}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {item.published_at ? new Date(item.published_at).toLocaleString('id-ID') : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEdit(item)}
                          disabled={editingId !== null && editingId !== item.id}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus "${item.title}"?`)) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Hapus
                        </Button>
                      </div>
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