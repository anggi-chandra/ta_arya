"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Trash2, Edit, Plus, Search, Folder, MessageSquare } from "lucide-react";

type ForumTopic = {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    icon?: string;
  } | null;
  reply_count?: number;
};

type ForumCategory = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
  topic_count?: number;
};

type ForumTopicsResponse = {
  topics: ForumTopic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchForumTopics(page: number, limit: number, search: string, categoryId: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (categoryId) params.set("category_id", categoryId);
  const res = await fetch(`/api/admin/forum/topics?${params.toString()}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Gagal memuat data forum topics");
  return res.json() as Promise<ForumTopicsResponse>;
}

async function fetchForumCategories(includeInactive: boolean = false) {
  const params = new URLSearchParams();
  params.set("limit", "100");
  if (includeInactive) {
    params.set("include_inactive", "true");
  }
  const res = await fetch(`/api/admin/forum/categories?${params.toString()}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Gagal memuat kategori forum");
  return res.json() as Promise<{ categories: ForumCategory[] }>;
}

async function createCategory(payload: { name: string; description?: string; color?: string; icon?: string; is_active?: boolean }) {
  const res = await fetch(`/api/admin/forum/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal membuat kategori");
  }
  return res.json();
}

async function updateCategory(id: string, payload: Partial<ForumCategory>) {
  const res = await fetch(`/api/admin/forum/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal memperbarui kategori");
  }
  return res.json();
}

async function deleteCategory(id: string) {
  const res = await fetch(`/api/admin/forum/categories/${id}`, { 
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal menghapus kategori");
  }
  return res.json();
}

async function createTopic(payload: { title: string; content: string; category_id: string; is_pinned?: boolean; is_locked?: boolean }) {
  const res = await fetch(`/api/admin/forum/topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal membuat topic");
  }
  return res.json();
}

async function updateTopic(id: string, payload: Partial<ForumTopic>) {
  const res = await fetch(`/api/admin/forum/topics/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal memperbarui topic");
  }
  return res.json();
}

async function deleteTopic(id: string) {
  const res = await fetch(`/api/admin/forum/topics/${id}`, { 
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Gagal menghapus topic");
  return res.json();
}

export default function AdminForumPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newIsLocked, setNewIsLocked] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [editIsLocked, setEditIsLocked] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
  
  // Category management states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [editCategoryColor, setEditCategoryColor] = useState("#3B82F6");
  const [editCategoryIcon, setEditCategoryIcon] = useState("");
  const [editCategoryIsActive, setEditCategoryIsActive] = useState(true);

  const queryClient = useQueryClient();

  // Fetch categories (for dropdown in post form - only active)
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-forum-categories"],
    queryFn: () => fetchForumCategories(false), // Only active for dropdown
  });

  // Fetch all categories (including inactive) for category management
  const { data: allCategoriesData } = useQuery({
    queryKey: ["admin-forum-categories-all"],
    queryFn: () => fetchForumCategories(true), // Include inactive for management
    enabled: activeTab === "categories",
  });

  const categories = categoriesData?.categories || [];
  const allCategories = allCategoriesData?.categories || [];

  // Fetch topics
  const { data, isLoading, isError } = useQuery<ForumTopicsResponse>({
    queryKey: ["admin-forum-topics", { page, limit, search, categoryId }],
    queryFn: () => fetchForumTopics(page, limit, search, categoryId),
  });

  const createMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      setNewTitle("");
      setNewContent("");
      setNewCategoryId("");
      setNewIsPinned(false);
      setNewIsLocked(false);
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-forum-topics"] });
      alert("Forum post berhasil dibuat!");
    },
    onError: (error: any) => {
      alert(error?.message || "Gagal membuat forum post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ForumTopic> }) =>
      updateTopic(id, data),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-forum-topics"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-topics"] });
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryColor("#3B82F6");
      setNewCategoryIcon("");
      setShowCategoryForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories-all"] });
      alert("Kategori berhasil dibuat!");
    },
    onError: (error: any) => {
      alert(error?.message || "Gagal membuat kategori");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ForumCategory> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      setEditingCategoryId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories-all"] });
      alert("Kategori berhasil diperbarui!");
    },
    onError: (error: any) => {
      alert(error?.message || "Gagal memperbarui kategori");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories-all"] });
      alert("Kategori berhasil dihapus!");
    },
    onError: (error: any) => {
      alert(error?.message || "Gagal menghapus kategori");
    },
  });

  const startEdit = (topic: ForumTopic) => {
    setEditingId(topic.id);
    setEditTitle(topic.title);
    setEditContent(topic.content);
    setEditCategoryId(topic.category_id);
    setEditIsPinned(topic.is_pinned);
    setEditIsLocked(topic.is_locked);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleCreate = () => {
    // Validate title
    if (!newTitle || !newTitle.trim()) {
      alert("Judul harus diisi");
      return;
    }

    // Validate content
    if (!newContent || !newContent.trim()) {
      alert("Konten harus diisi");
      return;
    }

    // Validate category - must be a valid UUID, not empty string
    if (!newCategoryId || newCategoryId.trim() === "" || newCategoryId === "Pilih kategori") {
      alert("Silakan pilih kategori dari dropdown");
      return;
    }

    // Validate category exists in the list
    const categoryExists = categories.some(cat => cat.id === newCategoryId);
    if (!categoryExists) {
      alert("Kategori yang dipilih tidak valid. Silakan pilih kategori yang tersedia.");
      return;
    }

    createMutation.mutate({
      title: newTitle.trim(),
      content: newContent.trim(),
      category_id: newCategoryId,
      is_pinned: newIsPinned,
      is_locked: newIsLocked,
    });
  };

  const handleUpdate = (id: string) => {
    if (!editTitle || !editContent || !editCategoryId) {
      alert("Harap isi semua field yang diperlukan");
      return;
    }
    updateMutation.mutate({
      id,
      data: {
        title: editTitle,
        content: editContent,
        category_id: editCategoryId,
        is_pinned: editIsPinned,
        is_locked: editIsLocked,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus topic ini?")) {
      deleteMutation.mutate(id);
    }
  };

  // Category handlers
  const handleCreateCategory = () => {
    if (!newCategoryName || !newCategoryName.trim()) {
      alert("Nama kategori harus diisi");
      return;
    }
    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
      color: newCategoryColor,
      icon: newCategoryIcon.trim() || undefined,
      is_active: true,
    });
  };

  const handleUpdateCategory = (id: string) => {
    if (!editCategoryName || !editCategoryName.trim()) {
      alert("Nama kategori harus diisi");
      return;
    }
    updateCategoryMutation.mutate({
      id,
      data: {
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim() || undefined,
        color: editCategoryColor,
        icon: editCategoryIcon.trim() || undefined,
        is_active: editCategoryIsActive,
      },
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini? Kategori yang memiliki topik tidak bisa dihapus.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const startEditCategory = (category: ForumCategory) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
    setEditCategoryColor(category.color || "#3B82F6");
    setEditCategoryIcon(category.icon || "");
    setEditCategoryIsActive(category.is_active !== false);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kelola Forum</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola forum posts dan kategori
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "posts"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Forum Posts
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "categories"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Folder className="h-4 w-4 inline mr-2" />
          Kategori
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <>
          {/* Create Form */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Buat Forum Post Baru</h2>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
              >
                {showCreateForm ? "Tutup" : <><Plus className="h-4 w-4 mr-2" />Buat Post</>}
              </Button>
            </div>

            {showCreateForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Masukkan judul post"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  {categories.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
                      Belum ada kategori forum yang aktif. Silakan buat kategori terlebih dahulu.
                    </div>
                  ) : (
                    <select
                      value={newCategoryId}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        // Only set if not empty (placeholder)
                        if (selectedValue) {
                          setNewCategoryId(selectedValue);
                        } else {
                          setNewCategoryId("");
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="" disabled>
                        -- Pilih kategori --
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Konten <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Masukkan konten post"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsPinned}
                      onChange={(e) => setNewIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Pin Post</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsLocked}
                      onChange={(e) => setNewIsLocked(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Lock Post</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !newTitle.trim() || !newContent.trim() || !newCategoryId}
                  >
                    {createMutation.isPending ? "Menyimpan..." : "Buat Post"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewTitle("");
                      setNewContent("");
                      setNewCategoryId("");
                      setNewIsPinned(false);
                      setNewIsLocked(false);
                    }}
                    disabled={createMutation.isPending}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari post..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Semua kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Topics List */}
          {isLoading ? (
            <div className="text-center py-8">Memuat...</div>
          ) : isError ? (
            <Card className="p-6 text-red-600">Gagal memuat data forum topics</Card>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {data?.topics.map((topic) => (
                  <Card key={topic.id} className="p-6">
                    {editingId === topic.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Judul</label>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Kategori</label>
                          {categories.length === 0 ? (
                            <div className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
                              Belum ada kategori forum yang aktif.
                            </div>
                          ) : (
                            <select
                              value={editCategoryId}
                              onChange={(e) => setEditCategoryId(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              required
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Konten</label>
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={6}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editIsPinned}
                              onChange={(e) => setEditIsPinned(e.target.checked)}
                            />
                            <span className="text-sm">Pinned</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editIsLocked}
                              onChange={(e) => setEditIsLocked(e.target.checked)}
                            />
                            <span className="text-sm">Locked</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdate(topic.id)}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                          </Button>
                          <Button variant="outline" onClick={cancelEdit}>
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{topic.title}</h3>
                              {topic.is_pinned && (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                  Pinned
                                </span>
                              )}
                              {topic.is_locked && (
                                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  Locked
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Kategori: {topic.category?.name || "N/A"} | 
                              Oleh: {topic.author?.username || topic.author?.full_name || "Unknown"} | 
                              Replies: {topic.reply_count || 0} | 
                              Views: {topic.view_count || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                              {topic.content}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(topic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(topic.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}

              {data && data.topics.length === 0 && (
                <Card className="p-6 text-center text-gray-500">
                  Tidak ada forum posts ditemukan
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <>
          {/* Create Category Form */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Buat Kategori Baru</h2>
              <Button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                variant={showCategoryForm ? "outline" : "default"}
              >
                {showCategoryForm ? "Tutup" : <><Plus className="h-4 w-4 mr-2" />Buat Kategori</>}
              </Button>
            </div>

            {showCategoryForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Masukkan nama kategori"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi</label>
                  <Textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Masukkan deskripsi kategori (opsional)"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Warna</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <Input
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon</label>
                    <div className="space-y-2">
                      <Input
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        placeholder="Icon (opsional, contoh: 🎮)"
                      />
                      {newCategoryIcon && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>Preview:</span>
                          <span className="text-2xl">{newCategoryIcon}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pilih icon populer:</p>
                        <div className="flex flex-wrap gap-2">
                          {['🎮', '💬', '📢', '🎯', '🏆', '⚡', '🔥', '💡', '📚', '🎨', '🎵', '📱', '💻', '🎪', '🌟', '📺', '🎬', '🎤', '🎸', '🎲'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setNewCategoryIcon(emoji)}
                              className={`w-10 h-10 text-xl rounded border-2 transition-colors ${
                                newCategoryIcon === emoji
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewCategoryIcon('')}
                          className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Hapus icon
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleCreateCategory}
                    disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                  >
                    {createCategoryMutation.isPending ? "Menyimpan..." : "Buat Kategori"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewCategoryName("");
                      setNewCategoryDescription("");
                      setNewCategoryColor("#3B82F6");
                      setNewCategoryIcon("");
                    }}
                    disabled={createCategoryMutation.isPending}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Categories List */}
          {!allCategoriesData && (
            <div className="text-center py-8">Memuat kategori...</div>
          )}
          {allCategoriesData && allCategories.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              Belum ada kategori forum. Buat kategori pertama Anda!
            </Card>
          ) : (
            <div className="space-y-4">
              {allCategories.map((category) => (
                <Card key={category.id} className="p-6">
                  {editingCategoryId === category.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nama Kategori</label>
                        <Input
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Deskripsi</label>
                        <Textarea
                          value={editCategoryDescription}
                          onChange={(e) => setEditCategoryDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Warna</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={editCategoryColor}
                              onChange={(e) => setEditCategoryColor(e.target.value)}
                              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={editCategoryColor}
                              onChange={(e) => setEditCategoryColor(e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Icon</label>
                          <div className="space-y-2">
                            <Input
                              value={editCategoryIcon}
                              onChange={(e) => setEditCategoryIcon(e.target.value)}
                              placeholder="Icon (opsional, contoh: 🎮)"
                            />
                            {editCategoryIcon && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Preview:</span>
                                <span className="text-2xl">{editCategoryIcon}</span>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pilih icon populer:</p>
                              <div className="flex flex-wrap gap-2">
                                {['🎮', '💬', '📢', '🎯', '🏆', '⚡', '🔥', '💡', '📚', '🎨', '🎵', '📱', '💻', '🎪', '🌟', '📺', '🎬', '🎤', '🎸', '🎲'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setEditCategoryIcon(emoji)}
                                    className={`w-10 h-10 text-xl rounded border-2 transition-colors ${
                                      editCategoryIcon === emoji
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditCategoryIcon('')}
                                className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                Hapus icon
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editCategoryIsActive}
                            onChange={(e) => setEditCategoryIsActive(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm">Aktif</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateCategory(category.id)}
                          disabled={updateCategoryMutation.isPending}
                        >
                          {updateCategoryMutation.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                        <Button variant="outline" onClick={cancelEditCategory}>
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {category.icon && (
                              <span className="text-2xl">{category.icon}</span>
                            )}
                            <h3 className="text-lg font-semibold">{category.name}</h3>
                            {category.is_active === false && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                Nonaktif
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Topik: {category.topic_count || 0}</span>
                            {category.color && (
                              <div className="flex items-center gap-2">
                                <span>Warna:</span>
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: category.color }}
                                ></div>
                                <span>{category.color}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={deleteCategoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

