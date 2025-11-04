"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar, User, Clock, Tag, ChevronRight, ThumbsUp, MessageSquare, BookOpen } from "lucide-react";

// Tipe data untuk artikel
type ArticleType = "news" | "tips" | "analysis" | "community";

// Data contoh untuk artikel
const articles = [
  // Berita Esports
  {
    id: "news-1",
    title: "Tim Indonesia Raih Juara di Turnamen MLBB World Championship",
    excerpt: "Tim RRQ Hoshi berhasil mengalahkan tim-tim top dunia dan membawa pulang trofi juara MLBB World Championship 2023.",
    image: "/images/news-1.jpg",
    date: "28 Nov 2023",
    author: "Budi Santoso",
    category: "news",
    tags: ["Mobile Legends", "Tournament", "RRQ"],
    likes: 245,
    comments: 58,
    readTime: "5 menit"
  },
  {
    id: "news-2",
    title: "Update Terbaru PUBG Mobile: Fitur dan Peta Baru",
    excerpt: "PUBG Mobile merilis update terbaru dengan peta baru dan beberapa fitur yang mengubah gameplay secara signifikan.",
    image: "/images/news-2.jpg",
    date: "25 Nov 2023",
    author: "Dian Permata",
    category: "news",
    tags: ["PUBG Mobile", "Update", "Gameplay"],
    likes: 187,
    comments: 42,
    readTime: "4 menit"
  },
  {
    id: "news-3",
    title: "Valorant Umumkan Turnamen Regional Asia Tenggara",
    excerpt: "Riot Games mengumumkan turnamen Valorant khusus untuk wilayah Asia Tenggara dengan total hadiah mencapai $100,000.",
    image: "/images/news-3.jpg",
    date: "22 Nov 2023",
    author: "Andi Wijaya",
    category: "news",
    tags: ["Valorant", "Tournament", "Riot Games"],
    likes: 156,
    comments: 31,
    readTime: "3 menit"
  },
  
  // Tips & Trik
  {
    id: "tips-1",
    title: "5 Strategi Jitu untuk Meningkatkan Rank di Mobile Legends",
    excerpt: "Panduan lengkap untuk pemain Mobile Legends yang ingin naik rank dengan cepat dan efektif.",
    image: "/images/tips-1.jpg",
    date: "20 Nov 2023",
    author: "Rudi Hartono",
    category: "tips",
    tags: ["Mobile Legends", "Rank", "Strategy"],
    likes: 312,
    comments: 87,
    readTime: "7 menit"
  },
  {
    id: "tips-2",
    title: "Cara Efektif Melatih Reflex dan Aim di FPS Game",
    excerpt: "Tips dan latihan untuk meningkatkan reflex dan akurasi tembakan di game FPS seperti Valorant dan CSGO.",
    image: "/images/tips-2.jpg",
    date: "18 Nov 2023",
    author: "Fajar Pradana",
    category: "tips",
    tags: ["FPS", "Aim Training", "Valorant", "CSGO"],
    likes: 278,
    comments: 63,
    readTime: "6 menit"
  },
  {
    id: "tips-3",
    title: "Panduan Lengkap Hero Meta MLBB Season Terbaru",
    excerpt: "Analisis mendalam tentang hero-hero meta di Mobile Legends season terbaru dan cara menggunakannya.",
    image: "/images/tips-3.jpg",
    date: "15 Nov 2023",
    author: "Sinta Dewi",
    category: "tips",
    tags: ["Mobile Legends", "Hero Meta", "Guide"],
    likes: 295,
    comments: 72,
    readTime: "8 menit"
  },
  
  // Analisis
  {
    id: "analysis-1",
    title: "Analisis Strategi Tim EVOS di MPL Season 12",
    excerpt: "Pembahasan mendalam tentang strategi dan taktik yang digunakan tim EVOS selama MPL Season 12.",
    image: "/images/analysis-1.jpg",
    date: "12 Nov 2023",
    author: "Gunawan Prasetyo",
    category: "analysis",
    tags: ["EVOS", "MPL", "Strategy Analysis"],
    likes: 203,
    comments: 47,
    readTime: "10 menit"
  },
  {
    id: "analysis-2",
    title: "Perbandingan Meta PUBG Mobile vs Free Fire",
    excerpt: "Analisis perbandingan meta game, strategi, dan mekanik antara PUBG Mobile dan Free Fire.",
    image: "/images/analysis-2.jpg",
    date: "10 Nov 2023",
    author: "Hendra Kusuma",
    category: "analysis",
    tags: ["PUBG Mobile", "Free Fire", "Meta Analysis"],
    likes: 187,
    comments: 53,
    readTime: "9 menit"
  },
  {
    id: "analysis-3",
    title: "Evolusi Strategi Valorant dari Beta hingga Sekarang",
    excerpt: "Melihat bagaimana strategi dan meta di Valorant berevolusi sejak beta hingga versi terkini.",
    image: "/images/analysis-3.jpg",
    date: "8 Nov 2023",
    author: "Dimas Purnomo",
    category: "analysis",
    tags: ["Valorant", "Meta Evolution", "Strategy"],
    likes: 176,
    comments: 39,
    readTime: "11 menit"
  },
  
  // Cerita Komunitas
  {
    id: "community-1",
    title: "Dari Hobi ke Profesi: Kisah Sukses Pro Player Indonesia",
    excerpt: "Perjalanan inspiratif seorang pemain game biasa yang kini menjadi pro player terkenal di Indonesia.",
    image: "/images/community-1.jpg",
    date: "5 Nov 2023",
    author: "Ratna Sari",
    category: "community",
    tags: ["Pro Player", "Success Story", "Esports Career"],
    likes: 342,
    comments: 91,
    readTime: "12 menit"
  },
  {
    id: "community-2",
    title: "Komunitas Esports untuk Difabel: Inklusivitas dalam Gaming",
    excerpt: "Kisah inspiratif tentang komunitas esports yang memberdayakan pemain dengan disabilitas.",
    image: "/images/community-2.jpg",
    date: "2 Nov 2023",
    author: "Maya Indah",
    category: "community",
    tags: ["Inclusive Gaming", "Disability", "Community"],
    likes: 287,
    comments: 76,
    readTime: "8 menit"
  },
  {
    id: "community-3",
    title: "Turnamen Amal: Gamers Bersatu untuk Korban Bencana",
    excerpt: "Bagaimana komunitas gaming Indonesia mengadakan turnamen amal untuk membantu korban bencana alam.",
    image: "/images/community-3.jpg",
    date: "30 Oct 2023",
    author: "Agus Setiawan",
    category: "community",
    tags: ["Charity", "Community Event", "Disaster Relief"],
    likes: 325,
    comments: 84,
    readTime: "7 menit"
  }
];

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<ArticleType>("news");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter artikel berdasarkan kategori aktif
  const filteredArticles = articles.filter(article => article.category === activeTab);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog Esports</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Berita terkini, tips & trik, analisis mendalam, dan cerita inspiratif dari dunia esports
        </p>
      </div>
      
      {/* Search dan Filter */}
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
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button>Artikel Terbaru</Button>
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
      
      {/* Berita Esports */}
      {activeTab === "news" && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Berita Esports Terkini</h2>
          </div>
          
          {/* Featured Article */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 bg-gray-200 dark:bg-gray-700 h-64 md:h-auto relative">
                  <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 text-xs font-medium">
                    FEATURED
                  </div>
                </div>
                <div className="md:w-1/3 p-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{filteredArticles[0]?.date}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{filteredArticles[0]?.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{filteredArticles[0]?.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.author}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {filteredArticles[0]?.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${filteredArticles[0]?.id}`}>
                    <Button className="w-full">Baca Selengkapnya</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          
          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.slice(1).map((article) => (
              <Link href={`/blog/${article.id}`} key={article.id}>
                <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 text-xs font-medium">
                      BERITA
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline">Lihat Lebih Banyak Berita</Button>
          </div>
        </div>
      )}
      
      {/* Tips & Trik */}
      {activeTab === "tips" && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tips & Trik untuk Pemain Esports</h2>
          </div>
          
          {/* Featured Tip */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 bg-gray-200 dark:bg-gray-700 h-64 md:h-auto relative">
                  <div className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 text-xs font-medium">
                    FEATURED
                  </div>
                </div>
                <div className="md:w-1/3 p-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{filteredArticles[0]?.date}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{filteredArticles[0]?.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{filteredArticles[0]?.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.author}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {filteredArticles[0]?.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${filteredArticles[0]?.id}`}>
                    <Button className="w-full">Baca Selengkapnya</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.slice(1).map((article) => (
              <Link href={`/blog/${article.id}`} key={article.id}>
                <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    <div className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 text-xs font-medium">
                      TIPS
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline">Lihat Lebih Banyak Tips</Button>
          </div>
        </div>
      )}
      
      {/* Analisis */}
      {activeTab === "analysis" && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Analisis Strategi & Pertandingan</h2>
          </div>
          
          {/* Featured Analysis */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 bg-gray-200 dark:bg-gray-700 h-64 md:h-auto relative">
                  <div className="absolute top-0 left-0 bg-purple-600 text-white px-3 py-1 text-xs font-medium">
                    FEATURED
                  </div>
                </div>
                <div className="md:w-1/3 p-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{filteredArticles[0]?.date}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{filteredArticles[0]?.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{filteredArticles[0]?.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.author}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {filteredArticles[0]?.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${filteredArticles[0]?.id}`}>
                    <Button className="w-full">Baca Selengkapnya</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.slice(1).map((article) => (
              <Link href={`/blog/${article.id}`} key={article.id}>
                <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    <div className="absolute top-0 left-0 bg-purple-600 text-white px-3 py-1 text-xs font-medium">
                      ANALISIS
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline">Lihat Lebih Banyak Analisis</Button>
          </div>
        </div>
      )}
      
      {/* Cerita Komunitas */}
      {activeTab === "community" && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cerita Inspiratif dari Komunitas</h2>
          </div>
          
          {/* Featured Community Story */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 bg-gray-200 dark:bg-gray-700 h-64 md:h-auto relative">
                  <div className="absolute top-0 left-0 bg-orange-600 text-white px-3 py-1 text-xs font-medium">
                    FEATURED
                  </div>
                </div>
                <div className="md:w-1/3 p-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{filteredArticles[0]?.date}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{filteredArticles[0]?.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{filteredArticles[0]?.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{filteredArticles[0]?.author}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {filteredArticles[0]?.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${filteredArticles[0]?.id}`}>
                    <Button className="w-full">Baca Selengkapnya</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Community Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.slice(1).map((article) => (
              <Link href={`/blog/${article.id}`} key={article.id}>
                <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    <div className="absolute top-0 left-0 bg-orange-600 text-white px-3 py-1 text-xs font-medium">
                      KOMUNITAS
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline">Lihat Lebih Banyak Cerita</Button>
          </div>
        </div>
      )}
      
      {/* Newsletter Subscription */}
      <section className="mb-12">
        <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Dapatkan Update Terbaru</h3>
            <p className="text-blue-100">Berlangganan newsletter kami untuk mendapatkan berita dan tips esports terbaru</p>
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
      
      {/* Popular Tags */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Tag Populer</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">Mobile Legends</Button>
          <Button variant="outline" size="sm">PUBG Mobile</Button>
          <Button variant="outline" size="sm">Valorant</Button>
          <Button variant="outline" size="sm">Esports</Button>
          <Button variant="outline" size="sm">Tournament</Button>
          <Button variant="outline" size="sm">Strategy</Button>
          <Button variant="outline" size="sm">Pro Player</Button>
          <Button variant="outline" size="sm">Tips</Button>
          <Button variant="outline" size="sm">Community</Button>
        </div>
      </section>
    </div>
  );
}