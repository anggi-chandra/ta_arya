"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, MapPin, DollarSign, Users } from "lucide-react";
import { useSession } from "next-auth/react";

async function createEventRequest(data: {
  title: string;
  description?: string;
  game?: string;
  image_url?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  price_cents?: number;
  capacity?: number;
  live_url?: string;
}) {
  const res = await fetch("/api/events/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal mengajukan permintaan event");
  }
  return res.json();
}

type EventRequest = {
  id: string;
  title: string;
  description?: string;
  game?: string;
  image_url?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  price_cents?: number;
  capacity?: number;
  live_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
};

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [game, setGame] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceCents, setPriceCents] = useState<number | "">("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [liveUrl, setLiveUrl] = useState("");
  
  // State for event requests
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Load event requests
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadEventRequests();
    }
  }, [sessionStatus]);

  const loadEventRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/events/request", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Get latest 5 requests
        const requests = (data.eventRequests || []).slice(0, 5);
        setEventRequests(requests);
      }
    } catch (error) {
      console.error("Error loading event requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: createEventRequest,
    onSuccess: () => {
      // Reload event requests after successful submission to show new status
      loadEventRequests();
      // Reset form
      setTitle("");
      setDescription("");
      setGame("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      setLocation("");
      setStartsAt("");
      setEndsAt("");
      setPriceCents("");
      setCapacity("");
      setLiveUrl("");
      queryClient.invalidateQueries({ queryKey: ["event-requests"] });
      // Show success message
      alert("Permintaan pembuatan event berhasil dikirim. Silakan tunggu persetujuan dari admin. Status dapat dilihat di bawah form.");
      // Scroll to status section
      setTimeout(() => {
        const statusSection = document.getElementById('status-section');
        if (statusSection) {
          statusSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
    onError: (error: any) => {
      alert(error.message || "Gagal mengajukan permintaan event");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/events/upload-image', {
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
    onSuccess: (data) => {
      setImageUrl(data.url);
      setUploadingImage(false);
    },
    onError: (error: any) => {
      alert('Gagal upload gambar: ' + error.message);
      setUploadingImage(false);
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file gambar yang diizinkan (JPEG, PNG, WebP, GIF)');
      event.target.value = ''; // Reset input
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      event.target.value = ''; // Reset input
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
    setUploadingImage(true);
    
    try {
      await uploadImageMutation.mutateAsync(file);
    } catch (error: any) {
      // If upload fails, remove preview and reset
      setImagePreview(null);
      setImageFile(null);
      setImageUrl('');
      event.target.value = ''; // Reset input
      console.error('Upload error:', error);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Menunggu
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startsAt) {
      alert("Judul dan tanggal mulai wajib diisi");
      return;
    }

    // Convert price to cents if provided
    const priceInCents = priceCents ? Math.round(Number(priceCents) * 100) : 0;

    createMutation.mutate({
      title,
      description: description || undefined,
      game: game || undefined,
      image_url: imageUrl || undefined,
      location: location || undefined,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
      price_cents: priceInCents,
      capacity: capacity ? Number(capacity) : undefined,
      live_url: liveUrl || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Ajukan Event Baru</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">
              Judul Event <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Turnamen Mobile Legends"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi event..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="game">Game</Label>
              <Input
                id="game"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder="Contoh: Mobile Legends"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jakarta"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image">Gambar Event</Label>
            <div className="mt-1 space-y-3">
              {/* Image Preview */}
              {(imagePreview || imageUrl) && (
                <div className="relative inline-block">
                  <img
                    src={imageUrl || imagePreview || ''}
                    alt="Preview"
                    className="h-48 w-auto rounded-md border border-gray-300 dark:border-gray-600 object-cover"
                    onError={(e) => {
                      // Fallback to preview if URL fails to load
                      if (imageUrl && imagePreview) {
                        (e.target as HTMLImageElement).src = imagePreview;
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
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
                  {imageUrl && !uploadingImage && (
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
                  id="image"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer ${
                    uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImage ? (
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
                      {imageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
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
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    // Reset preview and file when user types URL manually
                    setImagePreview(null);
                    setImageFile(null);
                    // Reset file input
                    const fileInput = document.getElementById('image') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.value = '';
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  disabled={uploadingImage}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {imageFile 
                    ? 'Gambar sudah diupload. Kosongkan URL ini untuk menggunakan gambar yang sudah diupload.'
                    : 'Masukkan URL gambar jika Anda tidak ingin mengupload file'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startsAt">
                Tanggal & Waktu Mulai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startsAt"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                type="datetime-local"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endsAt">Tanggal & Waktu Selesai</Label>
              <Input
                id="endsAt"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                type="datetime-local"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceCents">Harga (IDR)</Label>
              <Input
                id="priceCents"
                value={priceCents}
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceCents(val === "" ? "" : Number(val));
                }}
                placeholder="0"
                type="number"
                min="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan jika event gratis
              </p>
            </div>

            <div>
              <Label htmlFor="capacity">Kapasitas Maksimal</Label>
              <Input
                id="capacity"
                value={capacity}
                onChange={(e) => {
                  const val = e.target.value;
                  setCapacity(val === "" ? "" : Number(val));
                }}
                placeholder="0"
                type="number"
                min="0"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="liveUrl">URL Live Streaming</Label>
            <Input
              id="liveUrl"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              className="mt-1"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? "Mengirim..." : "Ajukan Event"}
            </Button>
            <Link href="/dashboard/events">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {/* Status Event Requests */}
      {sessionStatus === "authenticated" && (
        <div id="status-section" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Status Pengajuan Event</h2>
            <Link href="/dashboard/events">
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>

          {loadingRequests ? (
            <Card className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Memuat status pengajuan...
              </p>
            </Card>
          ) : eventRequests.length === 0 ? (
            <Card className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Belum ada pengajuan event. Form di atas untuk mengajukan event baru.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {eventRequests.map((request) => (
                <Card
                  key={request.id}
                  className={`p-4 ${
                    request.status === 'pending'
                      ? 'border-l-4 border-l-yellow-500'
                      : request.status === 'approved'
                      ? 'border-l-4 border-l-green-500'
                      : 'border-l-4 border-l-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{request.title}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {request.game && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{request.game}</span>
                          </div>
                        )}
                        {request.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{request.location}</span>
                          </div>
                        )}
                        {request.price_cents != null && request.price_cents > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(request.price_cents)}</span>
                          </div>
                        )}
                        {request.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Kapasitas: {request.capacity}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        <p>
                          Diajukan: {new Date(request.requested_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {request.reviewed_at && (
                          <p>
                            Direview: {new Date(request.reviewed_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                            Alasan Penolakan:
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {request.rejection_reason}
                          </p>
                        </div>
                      )}
                      {request.status === 'approved' && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-xs text-green-800 dark:text-green-200">
                            ✓ Event telah disetujui dan dibuat. Cek halaman Events untuk melihat event tersebut.
                          </p>
                        </div>
                      )}
                      {request.status === 'pending' && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            ⏳ Menunggu persetujuan dari admin.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {eventRequests.length >= 5 && (
                <div className="text-center pt-2">
                  <Link href="/dashboard/events">
                    <Button variant="outline" size="sm">
                      Lihat Semua Pengajuan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

