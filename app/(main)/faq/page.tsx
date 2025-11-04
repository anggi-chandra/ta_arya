"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search, HelpCircle, BookOpen, Users, Trophy, Gamepad2, Shield, MessageSquare, User, Video, BarChart2 } from "lucide-react";

// Tipe data untuk FAQ
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

// Tipe data untuk panduan
type GuideItem = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  category: string;
  icon: React.ReactNode;
};

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<"general" | "guides">("general");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  
  // Data FAQ
  const faqItems: FAQItem[] = [
    // Umum
    {
      id: "faq-1",
      question: "Bagaimana cara mendaftar akun di EsportsHub?",
      answer: "Untuk mendaftar akun di EsportsHub, klik tombol 'Daftar' di pojok kanan atas halaman. Isi formulir pendaftaran dengan informasi yang diperlukan seperti nama, email, dan kata sandi. Setelah itu, Anda akan menerima email konfirmasi untuk mengaktifkan akun Anda.",
      category: "umum"
    },
    {
      id: "faq-2",
      question: "Apakah mendaftar di EsportsHub gratis?",
      answer: "Ya, pendaftaran akun di EsportsHub sepenuhnya gratis. Anda dapat mengakses sebagian besar fitur platform tanpa biaya. Namun, beberapa turnamen premium atau fitur khusus mungkin memerlukan biaya pendaftaran terpisah.",
      category: "umum"
    },
    {
      id: "faq-3",
      question: "Bagaimana cara mengubah kata sandi saya?",
      answer: "Untuk mengubah kata sandi, masuk ke akun Anda, klik pada profil di pojok kanan atas, pilih 'Pengaturan', lalu pilih tab 'Keamanan'. Di sana Anda dapat mengubah kata sandi dengan memasukkan kata sandi lama dan kata sandi baru Anda.",
      category: "umum"
    },
    
    // Turnamen
    {
      id: "faq-4",
      question: "Bagaimana cara mendaftar untuk turnamen?",
      answer: "Untuk mendaftar turnamen, kunjungi halaman 'Turnamen', pilih turnamen yang ingin Anda ikuti, klik tombol 'Daftar', dan ikuti petunjuk pendaftaran. Pastikan Anda memenuhi semua persyaratan turnamen dan melengkapi semua informasi yang diminta.",
      category: "turnamen"
    },
    {
      id: "faq-5",
      question: "Apakah ada batasan usia untuk mengikuti turnamen?",
      answer: "Ya, sebagian besar turnamen memiliki batasan usia minimal 16 tahun. Namun, beberapa turnamen khusus mungkin memiliki persyaratan usia yang berbeda. Informasi lengkap tentang persyaratan usia dapat ditemukan di halaman detail setiap turnamen.",
      category: "turnamen"
    },
    {
      id: "faq-6",
      question: "Bagaimana sistem poin turnamen bekerja?",
      answer: "Sistem poin turnamen bervariasi tergantung pada jenis turnamen dan game. Secara umum, poin diberikan berdasarkan peringkat akhir, jumlah kemenangan, dan prestasi khusus selama turnamen. Detail lengkap tentang sistem poin dapat ditemukan di halaman 'Format & Aturan' pada setiap turnamen.",
      category: "turnamen"
    },
    
    // Tim
    {
      id: "faq-7",
      question: "Berapa banyak anggota yang bisa ada dalam satu tim?",
      answer: "Jumlah anggota tim bervariasi tergantung pada game dan format turnamen. Umumnya, tim dapat memiliki 5-7 anggota, termasuk pemain cadangan. Beberapa game seperti PUBG Mobile mungkin mengizinkan hingga 6 anggota (4 utama + 2 cadangan), sementara game seperti Valorant biasanya 5 anggota (5 utama + 1-2 cadangan).",
      category: "tim"
    },
    {
      id: "faq-8",
      question: "Bagaimana cara mengundang pemain ke tim saya?",
      answer: "Untuk mengundang pemain ke tim Anda, masuk ke halaman 'Dashboard', pilih 'Tim Saya', pilih tim yang ingin Anda kelola, lalu klik 'Kelola Anggota'. Di sana Anda dapat mengundang pemain dengan memasukkan username atau email mereka dan mengirimkan undangan.",
      category: "tim"
    },
    {
      id: "faq-9",
      question: "Bisakah saya bergabung dengan lebih dari satu tim?",
      answer: "Ya, Anda dapat bergabung dengan beberapa tim berbeda. Namun, untuk turnamen tertentu, Anda hanya dapat mewakili satu tim. Pastikan untuk memeriksa aturan turnamen mengenai batasan keanggotaan tim sebelum mendaftar.",
      category: "tim"
    },
    
    // Komunitas
    {
      id: "faq-10",
      question: "Bagaimana cara bergabung dengan forum diskusi?",
      answer: "Untuk bergabung dengan forum diskusi, kunjungi halaman 'Komunitas' dan pilih tab 'Forum Diskusi'. Di sana Anda dapat melihat berbagai kategori forum, memilih topik yang menarik, dan mulai berpartisipasi dalam diskusi dengan mengirim komentar atau membuat topik baru.",
      category: "komunitas"
    },
    {
      id: "faq-11",
      question: "Apakah ada aturan dalam forum diskusi?",
      answer: "Ya, forum diskusi memiliki aturan yang harus dipatuhi oleh semua anggota. Aturan ini mencakup larangan penggunaan bahasa kasar, spam, konten tidak pantas, dan perilaku tidak menghormati anggota lain. Pelanggaran aturan dapat mengakibatkan peringatan atau pemblokiran akun.",
      category: "komunitas"
    },
    {
      id: "faq-12",
      question: "Bagaimana cara melaporkan konten atau pengguna yang melanggar aturan?",
      answer: "Untuk melaporkan konten atau pengguna yang melanggar aturan, klik tombol 'Laporkan' yang tersedia di setiap postingan atau profil pengguna. Isi formulir laporan dengan detail pelanggaran, dan tim moderator kami akan meninjau laporan tersebut sesegera mungkin.",
      category: "komunitas"
    }
  ];
  
  // Data Panduan
  const guideItems: GuideItem[] = [
    {
      id: "guide-1",
      title: "Cara Mendaftar Turnamen",
      description: "Panduan lengkap untuk mendaftar turnamen di EsportsHub",
      steps: [
        "Masuk ke akun EsportsHub Anda",
        "Kunjungi halaman 'Turnamen' dan pilih turnamen yang ingin diikuti",
        "Klik tombol 'Daftar' pada halaman detail turnamen",
        "Pilih apakah Anda mendaftar sebagai individu atau tim",
        "Jika mendaftar sebagai tim, pilih tim Anda dari daftar atau buat tim baru",
        "Isi semua informasi yang diperlukan dan konfirmasi pendaftaran",
        "Bayar biaya pendaftaran jika diperlukan",
        "Tunggu konfirmasi pendaftaran melalui email"
      ],
      category: "turnamen",
      icon: <Trophy className="h-6 w-6" />
    },
    {
      id: "guide-2",
      title: "Cara Membuat Tim",
      description: "Langkah-langkah untuk membuat dan mengelola tim esports Anda",
      steps: [
        "Masuk ke akun EsportsHub Anda",
        "Kunjungi halaman 'Dashboard' dan pilih 'Tim Saya'",
        "Klik tombol 'Buat Tim Baru'",
        "Isi informasi tim seperti nama, logo, dan deskripsi",
        "Pilih game utama yang dimainkan oleh tim Anda",
        "Tambahkan anggota tim dengan mengundang mereka melalui username atau email",
        "Tetapkan peran untuk setiap anggota (kapten, pemain, cadangan, dll.)",
        "Simpan perubahan dan mulai kelola tim Anda"
      ],
      category: "tim",
      icon: <Users className="h-6 w-6" />
    },
    {
      id: "guide-3",
      title: "Cara Menggunakan Forum Diskusi",
      description: "Panduan untuk berpartisipasi dalam forum diskusi komunitas",
      steps: [
        "Masuk ke akun EsportsHub Anda",
        "Kunjungi halaman 'Komunitas' dan pilih tab 'Forum Diskusi'",
        "Jelajahi kategori forum yang tersedia atau gunakan pencarian untuk menemukan topik",
        "Untuk membuat topik baru, klik tombol 'Buat Topik Baru'",
        "Isi judul, pilih kategori, dan tulis konten topik Anda",
        "Untuk membalas topik yang ada, klik pada topik tersebut dan tulis komentar Anda",
        "Patuhi aturan forum dan berinteraksi dengan hormat dengan anggota lain",
        "Gunakan fitur 'Laporkan' jika menemukan konten yang melanggar aturan"
      ],
      category: "komunitas",
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      id: "guide-4",
      title: "Cara Mengelola Profil Pengguna",
      description: "Panduan untuk mengatur dan memperbarui profil Anda",
      steps: [
        "Masuk ke akun EsportsHub Anda",
        "Klik pada ikon profil di pojok kanan atas dan pilih 'Profil Saya'",
        "Untuk mengedit profil, klik tombol 'Edit Profil'",
        "Perbarui informasi pribadi seperti nama, bio, dan foto profil",
        "Tambahkan informasi game seperti username in-game dan statistik",
        "Atur preferensi privasi untuk menentukan informasi apa yang dapat dilihat oleh pengguna lain",
        "Tambahkan tautan media sosial jika diinginkan",
        "Simpan perubahan setelah selesai mengedit"
      ],
      category: "umum",
      icon: <User className="h-6 w-6" />
    },
    {
      id: "guide-5",
      title: "Cara Mengikuti Streaming Turnamen",
      description: "Panduan untuk menonton streaming langsung turnamen",
      steps: [
        "Masuk ke akun EsportsHub Anda (opsional, Anda dapat menonton tanpa login)",
        "Kunjungi halaman 'Turnamen' dan pilih turnamen yang sedang berlangsung",
        "Klik tab 'Live Stream' pada halaman detail turnamen",
        "Pilih stream yang ingin Anda tonton jika ada beberapa stream tersedia",
        "Gunakan kontrol player untuk mengatur volume dan kualitas video",
        "Berpartisipasi dalam chat langsung jika tersedia (memerlukan login)",
        "Aktifkan notifikasi untuk mendapatkan pemberitahuan saat stream dimulai",
        "Bookmark turnamen untuk akses cepat ke stream di lain waktu"
      ],
      category: "turnamen",
      icon: <Video className="h-6 w-6" />
    },
    {
      id: "guide-6",
      title: "Cara Menggunakan Sistem Leaderboard",
      description: "Panduan untuk memahami dan menggunakan leaderboard",
      steps: [
        "Kunjungi halaman 'Turnamen' dan pilih tab 'Leaderboard'",
        "Pilih game atau kategori leaderboard yang ingin Anda lihat",
        "Gunakan filter untuk menyaring berdasarkan periode waktu (mingguan, bulanan, all-time)",
        "Lihat peringkat tim atau pemain berdasarkan poin yang dikumpulkan",
        "Klik pada nama tim atau pemain untuk melihat detail statistik mereka",
        "Pantau perkembangan peringkat Anda atau tim Anda dari waktu ke waktu",
        "Pahami sistem poin yang digunakan untuk menentukan peringkat",
        "Gunakan informasi leaderboard untuk menganalisis performa dan area yang perlu ditingkatkan"
      ],
      category: "turnamen",
      icon: <BarChart2 className="h-6 w-6" />
    }
  ];
  
  // Filter FAQ berdasarkan kategori dan pencarian
  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Filter panduan berdasarkan kategori dan pencarian
  const filteredGuides = guideItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  // Toggle FAQ expansion
  const toggleFAQ = (id: string) => {
    setExpandedFAQs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pertanyaan yang Sering Diajukan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Temukan jawaban untuk pertanyaan umum dan panduan untuk membantu Anda menggunakan platform kami dengan maksimal.
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pertanyaan atau panduan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        <Button 
          variant={activeTab === "general" ? "default" : "outline"} 
          onClick={() => setActiveTab("general")}
          className="flex items-center gap-2"
        >
          <HelpCircle size={18} />
          Pertanyaan Umum
        </Button>
        <Button 
          variant={activeTab === "guides" ? "default" : "outline"} 
          onClick={() => setActiveTab("guides")}
          className="flex items-center gap-2"
        >
          <BookOpen size={18} />
          Panduan
        </Button>
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant={activeCategory === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveCategory("all")}
        >
          Semua
        </Button>
        <Button 
          variant={activeCategory === "umum" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveCategory("umum")}
        >
          Umum
        </Button>
        <Button 
          variant={activeCategory === "turnamen" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveCategory("turnamen")}
        >
          Turnamen
        </Button>
        <Button 
          variant={activeCategory === "tim" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveCategory("tim")}
        >
          Tim
        </Button>
        <Button 
          variant={activeCategory === "komunitas" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveCategory("komunitas")}
        >
          Komunitas
        </Button>
      </div>
      
      {/* Pertanyaan Umum */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <button
                  className={`w-full text-left p-6 flex justify-between items-center ${
                    expandedFAQs.includes(item.id) ? "border-b border-gray-200 dark:border-gray-700" : ""
                  }`}
                  onClick={() => toggleFAQ(item.id)}
                >
                  <h3 className="text-lg font-medium">{item.question}</h3>
                  {expandedFAQs.includes(item.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {expandedFAQs.includes(item.id) && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada hasil yang ditemukan</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coba gunakan kata kunci yang berbeda atau pilih kategori lain.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Panduan */}
      {activeTab === "guides" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGuides.length > 0 ? (
            filteredGuides.map(guide => (
              <Card key={guide.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{guide.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{guide.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Langkah-langkah:</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      {guide.steps.map((step, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 col-span-2">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada panduan yang ditemukan</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coba gunakan kata kunci yang berbeda atau pilih kategori lain.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Bantuan Tambahan */}
      <Card className="p-8 mt-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Masih Butuh Bantuan?</h2>
          <p className="text-lg opacity-90">
            Jika Anda tidak menemukan jawaban yang Anda cari, tim dukungan kami siap membantu.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
              Hubungi Kami
            </Button>
          </a>
          <a href="/support">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
              Dukungan Teknis
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}