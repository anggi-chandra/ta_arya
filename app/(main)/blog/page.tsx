"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, Clock, ThumbsUp, MessageSquare } from "lucide-react";

// Tipe data untuk artikel
type ArticleType = "news" | "tips" | "analysis" | "community";

// Type untuk content dari API
type BlogContent = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  type: "blog" | "news" | "article" | "page";
  published_at?: string | null;
  created_at: string;
  author?: {
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
};

type BlogResponse = {
  content: BlogContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Mapping type content ke kategori blog
const mapTypeToCategory = (type: string): ArticleType[] => {
  switch (type) {
    case "news":
      return ["news"];
    case "blog":
      return ["news", "community"]; // Blog bisa masuk ke news atau community
    case "article":
      return ["tips", "analysis"]; // Article bisa masuk ke tips atau analysis
    default:
      return [];
  }
};

// Calculate read time (average reading speed: 200 words per minute)
const calculateReadTime = (content: string): string => {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} menit`;
};

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<ArticleType>("news");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch blog content from API
  const { data, isLoading, isError, error } = useQuery<BlogResponse>({
    queryKey: ["blog-content", searchQuery, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "100", // Get more items to filter by category
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error fetching blog content:", errorData);
        throw new Error(errorData.error || "Gagal memuat konten blog");
      }
      const result = await res.json();
      console.log("Fetched blog content:", result);
      return result;
    },
  });

  // Filter articles berdasarkan kategori aktif
  const filteredArticles = useMemo(() => {
    if (!data?.content) return [];

    return data.content
      .filter((article) => {
        const categories = mapTypeToCategory(article.type);
        return categories.includes(activeTab);
      })
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt || "",
        image: article.featured_image || "/images/placeholder.jpg",
        date: article.published_at
          ? new Date(article.published_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : new Date(article.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
        author: article.author?.full_name || article.author?.username || "Admin",
        category: activeTab,
        // Note: likes, comments, tags, readTime tidak ada di database
        // Untuk sementara kita set default atau bisa ditambahkan nanti
        likes: 0,
        comments: 0,
        tags: [],
        readTime: "5 menit", // Default, bisa dihitung dari content jika ada
      }));
  }, [data?.content, activeTab]);

  // Category labels and colors
  const categoryConfig = {
    news: { label: "BERITA", color: "bg-blue-600" },
    tips: { label: "TIPS", color: "bg-green-600" },
    analysis: { label: "ANALISIS", color: "bg-purple-600" },
    community: { label: "KOMUNITAS", color: "bg-orange-600" },
  };

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog Esports</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Berita terkini, tips & trik, analisis mendalam, dan cerita inspiratif dari dunia esports
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari artikel..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={activeTab === "news" ? "default" : "ghost"}
          onClick={() => setActiveTab("news")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === "news" ? "active" : "inactive"}
        >
          Berita Esports
        </Button>
        <Button
          variant={activeTab === "tips" ? "default" : "ghost"}
          onClick={() => setActiveTab("tips")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === "tips" ? "active" : "inactive"}
        >
          Tips & Trik
        </Button>
        <Button
          variant={activeTab === "analysis" ? "default" : "ghost"}
          onClick={() => setActiveTab("analysis")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === "analysis" ? "active" : "inactive"}
        >
          Analisis
        </Button>
        <Button
          variant={activeTab === "community" ? "default" : "ghost"}
          onClick={() => setActiveTab("community")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === "community" ? "active" : "inactive"}
        >
          Cerita Komunitas
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Memuat konten...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Gagal memuat konten. Silakan coba lagi.
          </p>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">
              {error instanceof Error ? error.message : "Terjadi kesalahan"}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Muat Ulang
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada konten untuk kategori ini.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Admin dapat menambahkan konten di halaman Admin &gt; Konten.
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && filteredArticles.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {activeTab === "news" && "Berita Esports Terkini"}
              {activeTab === "tips" && "Tips & Trik untuk Pemain Esports"}
              {activeTab === "analysis" && "Analisis Strategi & Pertandingan"}
              {activeTab === "community" && "Cerita Inspiratif dari Komunitas"}
            </h2>
          </div>

          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-8">
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-2/3 h-64 md:h-96 relative bg-gray-200 dark:bg-gray-700">
                    {featuredArticle.image && featuredArticle.image !== "/images/placeholder.jpg" ? (
                      <Image
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                    <div
                      className={`absolute top-0 left-0 ${categoryConfig[activeTab].color} text-white px-3 py-1 text-xs font-medium`}
                    >
                      FEATURED
                    </div>
                  </div>
                  <div className="md:w-1/3 p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-4">{featuredArticle.date}</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{featuredArticle.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <User className="h-4 w-4 mr-1" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <Link href={`/blog/${featuredArticle.slug}`}>
                      <Button className="w-full">Baca Selengkapnya</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Articles Grid */}
          {otherArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <Link href={`/blog/${article.slug}`} key={article.id}>
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
                    <div className="h-48 relative bg-gray-200 dark:bg-gray-700">
                      {article.image && article.image !== "/images/placeholder.jpg" ? (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                      <div
                        className={`absolute top-0 left-0 ${categoryConfig[activeTab].color} text-white px-3 py-1 text-xs font-medium`}
                      >
                        {categoryConfig[activeTab].label}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-bold mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="h-4 w-4 mr-1" />
                          <span className="truncate">{article.author}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Newsletter Subscription */}
      <section className="mb-12">
        <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Dapatkan Update Terbaru</h3>
            <p className="text-blue-100">
              Berlangganan newsletter kami untuk mendapatkan berita dan tips esports terbaru
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Alamat email Anda"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100">Berlangganan</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
