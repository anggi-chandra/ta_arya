import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Mark as dynamic to avoid client reference manifest issues
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              minHeight: '100%',
              filter: 'brightness(1.1) contrast(1.05)'
            }}
          >
            <source src="/hero-video-2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay sangat ringan - video lebih terlihat, hanya overlay tipis untuk kontras teks */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 z-10 animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 shadow-lg border border-white/20 animate-fade-in-down">
                🏆 Platform Esports #1 di Indonesia
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl animate-fade-in-up stagger-1">
                <span className="text-white">Wujudkan Impian</span>
                <span className="text-gradient-primary drop-shadow-lg"> Esports</span>
                <span className="text-white"> Anda</span>
              </h1>
              <p className="text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg animate-fade-in-up stagger-2">
                Bergabunglah dengan komunitas esports terbesar di Indonesia. Ikuti turnamen, bentuk tim impian, dan raih prestasi tertinggi dalam dunia gaming kompetitif.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Link href="/events">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                    🎮 Jelajahi Event
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold hover:scale-105">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20 animate-fade-in-up stagger-4">
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary-start">50K+</div>
                  <div className="text-sm text-gray-300">Gamers Aktif</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary-end">200+</div>
                  <div className="text-sm text-gray-300">Event Selesai</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-gradient-primary bg-clip-text text-transparent">1M+</div>
                  <div className="text-sm text-gray-300">Total Prize Pool</div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 relative animate-fade-in-right">
              <div className="relative h-96 md:h-[500px] w-full animate-float">
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-primary opacity-30 rounded-3xl blur-3xl animate-pulse-slow"></div>
                <Image
                  src="/images/hero-esports.svg"
                  alt="Esports Tournament"
                  fill
                  className="object-contain relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight Event Terbaru */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary-start/10 dark:bg-primary-start/20 rounded-full text-primary-start dark:text-primary-start text-sm font-medium mb-4 animate-scale-in">
              🔥 Event Terpopuler
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-primary animate-fade-in-up stagger-1">
              Event Terbaru & Terhangat
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-fade-in-up stagger-2">
              Jangan lewatkan kesempatan emas untuk berkompetisi di turnamen esports terbesar dan meraih hadiah jutaan rupiah!
            </p>
          </div>
          
          {/* Featured Event (Large) */}
          <div className="mb-12 animate-fade-in-up stagger-3">
            <Card className="overflow-hidden bg-gradient-primary text-white border-0 shadow-2xl card-hover hover-glow">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 p-8 lg:p-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">🏆 FEATURED</span>
                    <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">LIVE</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4">Mobile Legends World Championship 2024</h3>
                  <p className="text-lg mb-6 text-blue-100">
                    Turnamen Mobile Legends terbesar tahun ini dengan total hadiah Rp 2.5 Miliar! 
                    Saksikan pertarungan tim-tim terbaik dari seluruh Asia Tenggara.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>15-20 Des 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>Jakarta, Indonesia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span>Rp 2.5M Prize Pool</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      <span>128 Tim Terdaftar</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link href="/events/mlbb-world-championship-2024">
                      <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
                        Daftar Sekarang
                      </Button>
                    </Link>
                    <Link href="/events/mlbb-world-championship-2024">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-[400px]">
                  <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-white/90">Tonton Highlight</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Other Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Event Card 1 */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group card-hover animate-fade-in-up stagger-1">
              <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/90 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                  Valorant
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">VCT</div>
                  <div className="text-sm opacity-90">Indonesia Open</div>
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-3 group-hover:text-red-600 transition-colors">Valorant Champions Tour Indonesia</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>10-12 Des 2024</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Bandung, Indonesia</span>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Rp 500M Prize Pool</span>
                  </div>
                </div>
                <Link href="/events/valorant-indonesia-open">
                  <Button className="w-full group-hover:bg-red-600 transition-colors">Daftar Event</Button>
                </Link>
              </div>
            </Card>

            {/* Event Card 2 */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-600 overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/90 text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                  PUBG Mobile
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">PMPL</div>
                  <div className="text-sm opacity-90">Season 6</div>
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-3 group-hover:text-green-600 transition-colors">PUBG Mobile Pro League S6</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>5-10 Jan 2025</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Surabaya, Indonesia</span>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Rp 750M Prize Pool</span>
                  </div>
                </div>
                <Link href="/events/pubgm-pro-league-season-6">
                  <Button className="w-full group-hover:bg-green-600 transition-colors">Daftar Event</Button>
                </Link>
              </div>
            </Card>

            {/* Event Card 3 */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group card-hover animate-fade-in-up stagger-3">
              <div className="relative h-48 bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/90 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                  Free Fire
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">FFWS</div>
                  <div className="text-sm opacity-90">2024</div>
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-3 group-hover:text-purple-600 transition-colors">Free Fire World Series 2024</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>20-25 Feb 2025</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Yogyakarta, Indonesia</span>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Rp 1M Prize Pool</span>
                  </div>
                </div>
                <Link href="/events/free-fire-world-series-2024">
                  <Button className="w-full group-hover:bg-purple-600 transition-colors">Daftar Event</Button>
                </Link>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/events">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">
                🎯 Lihat Semua Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Komunitas & Tim */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
              🏆 Komunitas Terbaik
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tim & Komunitas Terdepan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Bergabunglah dengan komunitas esports terbesar di Indonesia dan temukan tim impianmu untuk berkompetisi di level tertinggi.
            </p>
          </div>

          {/* Featured Teams */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tim Esports Unggulan</h3>
              <Link href="/teams">
                <Button variant="outline" className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600">
                  Lihat Semua Tim
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Team Card 1 */}
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-blue-600">RRQ</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    AKTIF
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">RRQ Hoshi</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Tim Mobile Legends profesional dengan prestasi internasional</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">👥 12 Anggota</span>
                    <span className="text-green-600 font-semibold">🏆 15 Juara</span>
                  </div>
                </div>
              </Card>

              {/* Team Card 2 */}
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative h-32 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-red-600">EVOS</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    AKTIF
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors">EVOS Legends</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Organisasi esports multi-game dengan divisi terlengkap</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">👥 25 Anggota</span>
                    <span className="text-green-600 font-semibold">🏆 22 Juara</span>
                  </div>
                </div>
              </Card>

              {/* Team Card 3 */}
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative h-32 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-purple-600">ONIC</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    AKTIF
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">ONIC Esports</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Tim esports dengan fokus pengembangan talenta muda</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">👥 18 Anggota</span>
                    <span className="text-green-600 font-semibold">🏆 11 Juara</span>
                  </div>
                </div>
              </Card>

              {/* Team Card 4 */}
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative h-32 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-green-600">BTR</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    AKTIF
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">Bigetron Alpha</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Tim PUBG Mobile terkuat dengan rekor juara dunia</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">👥 8 Anggota</span>
                    <span className="text-green-600 font-semibold">🏆 18 Juara</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Community Stats & Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Komunitas yang Berkembang Pesat
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Bergabunglah dengan ribuan gamer Indonesia yang telah menemukan passion mereka dalam dunia esports. 
                Dari pemula hingga profesional, semua memiliki tempat di komunitas kami.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Anggota Aktif</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">200+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tim Terdaftar</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Match Dimainkan</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Game Didukung</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link href="/community">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Gabung Komunitas
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button size="lg" variant="outline" className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600">
                    Buat Tim
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-0">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Temukan Tim Impianmu
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Sistem matchmaking canggih yang menghubungkan kamu dengan pemain yang memiliki skill dan visi yang sama.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Skill Matching</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Game Preference</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Schedule Sync</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Platform kami menyediakan berbagai fitur untuk memudahkan pengelolaan event esports Anda.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Pendaftaran Event</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistem pendaftaran yang mudah dan cepat untuk peserta individu maupun tim dengan verifikasi otomatis.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Bracket Turnamen</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Buat dan kelola bracket turnamen dengan mudah, update skor secara real-time, dan publikasikan hasil.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Manajemen Tim</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola tim esports dengan mudah, termasuk profil pemain, jadwal latihan, dan pencapaian tim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Berita Terkini */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-4">
              📰 Berita Terbaru
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Update Dunia Esports
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Dapatkan informasi terkini seputar dunia esports Indonesia dan internasional. Dari hasil turnamen hingga transfer pemain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured News */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    BREAKING NEWS
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className="bg-white/20 px-2 py-1 rounded">Mobile Legends</span>
                      <span>•</span>
                      <span>2 jam yang lalu</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-200 transition-colors">
                      RRQ Hoshi Juara M5 World Championship 2024
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Tim Indonesia berhasil mengalahkan Blacklist International dengan skor 4-2 dalam grand final yang berlangsung sengit...
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">ES</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Esports Indonesia</div>
                        <div className="text-gray-500 text-xs">Official Reporter</div>
                      </div>
                    </div>
                    <Link href="/blog/rrq-hoshi-juara-m5">
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-600">
                        Baca Selengkapnya
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

            {/* News List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Berita Lainnya</h3>
                <Link href="/blog">
                  <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300 hover:text-green-600">
                    Lihat Semua
                  </Button>
                </Link>
              </div>

              {/* News Item 1 */}
              <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VALORANT</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                      <span>Valorant</span>
                      <span>•</span>
                      <span>4 jam yang lalu</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                      EVOS Esports Rekrut Pemain Baru untuk VCT 2025
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      Organisasi esports ternama Indonesia mengumumkan rekrutmen dua pemain baru...
                    </p>
                  </div>
                </div>
              </Card>

              {/* News Item 2 */}
              <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PUBGM</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                      <span>PUBG Mobile</span>
                      <span>•</span>
                      <span>6 jam yang lalu</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                      Bigetron Alpha Siap Hadapi PMGC 2024
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      Tim juara dunia Indonesia mempersiapkan strategi khusus untuk turnamen global...
                    </p>
                  </div>
                </div>
              </Card>

              {/* News Item 3 */}
              <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">FF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                      <span>Free Fire</span>
                      <span>•</span>
                      <span>8 jam yang lalu</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                      Update Meta Free Fire: Karakter Baru Diluncurkan
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      Garena menghadirkan karakter baru dengan ability unik yang mengubah meta...
                    </p>
                  </div>
                </div>
              </Card>

              {/* News Item 4 */}
              <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">DOTA</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                      <span>Dota 2</span>
                      <span>•</span>
                      <span>1 hari yang lalu</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      The International 2025 Akan Digelar di Indonesia
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      Valve mengumumkan Indonesia sebagai tuan rumah turnamen Dota 2 terbesar...
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="mt-16">
            <Card className="p-8 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Jangan Lewatkan Berita Terbaru!</h3>
                <p className="text-green-100 mb-6">
                  Berlangganan newsletter kami dan dapatkan update terkini seputar dunia esports langsung di inbox kamu.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Masukkan email kamu"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-6">
                    Berlangganan
                  </Button>
                </div>
                <p className="text-xs text-green-200 mt-3">
                  Dengan berlangganan, kamu setuju dengan kebijakan privasi kami.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimoni Pengguna */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-4">
              ⭐ Testimoni
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Kata Mereka Tentang Kami
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Dengarkan pengalaman langsung dari para gamer dan tim esports yang telah bergabung dengan platform kami.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Platform ini benar-benar mengubah cara saya bermain esports. Dari yang awalnya main solo, sekarang punya tim solid dan udah menang beberapa turnamen lokal!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Ahmad Rizki</div>
                  <div className="text-sm text-gray-500">Pro Player Mobile Legends</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 2 */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Sebagai team manager, platform ini sangat membantu dalam mengorganisir turnamen dan mengelola tim. Interface-nya user-friendly dan fiturnya lengkap!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Sari Dewi</div>
                  <div className="text-sm text-gray-500">Team Manager EVOS Ladies</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 3 */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Komunitas di sini sangat supportive! Banyak belajar dari player-player senior dan sekarang skill Valorant saya meningkat drastis."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Dika Pratama</div>
                  <div className="text-sm text-gray-500">Valorant Enthusiast</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 4 */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Turnamen yang diselenggarakan selalu profesional dan fair play. Prize pool-nya juga menarik, bikin semangat untuk terus berkompetisi!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Rina Salsabila</div>
                  <div className="text-sm text-gray-500">PUBG Mobile Player</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 5 */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Platform yang bagus untuk networking dengan sesama gamer. Cuma kadang server agak lemot saat peak hours, tapi overall recommended!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Bayu Setiawan</div>
                  <div className="text-sm text-gray-500">Content Creator</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 6 */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Sebagai pemula di dunia esports, platform ini memberikan guidance yang sangat baik. Dari tutorial hingga mentoring, semuanya tersedia!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Lisa Anggraini</div>
                  <div className="text-sm text-gray-500">Rookie Player</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Overall Stats */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rating Kepuasan Pengguna</h3>
              <p className="text-gray-600 dark:text-gray-400">Berdasarkan 2,847 ulasan pengguna aktif</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">4.8</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating Keseluruhan</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">96%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tingkat Kepuasan</div>
                <div className="text-xs text-gray-500">Pengguna Puas</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">89%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rekomendasi</div>
                <div className="text-xs text-gray-500">Akan Merekomendasikan</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">92%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Retention Rate</div>
                <div className="text-xs text-gray-500">Pengguna Aktif Kembali</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:60px_60px]"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
        🚀 Bergabung Sekarang
      </div>
      <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Siap Menjadi
        <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Esports Legend?
        </span>
      </h2>
      <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
        Bergabunglah dengan ribuan gamer Indonesia dan mulai perjalanan esports Anda.
        Dari turnamen lokal hingga kompetisi internasional, semuanya dimulai dari sini.
      </p>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {/* Daftar Event Card */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8 hover:bg-white/20 transition-all duration-300 group">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Daftar Event</h3>
          <p className="text-blue-100 mb-6">
            Ikuti turnamen dan event esports terbaru. Raih kesempatan memenangkan hadiah jutaan rupiah!
          </p>
          <Link href="/events">
            <Button size="lg" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 font-semibold">
              Lihat Event Tersedia
            </Button>
          </Link>
        </div>
      </Card>

      {/* Bergabung Komunitas Card */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8 hover:bg-white/20 transition-all duration-300 group">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Bergabung Komunitas</h3>
          <p className="text-blue-100 mb-6">
            Temukan tim, buat strategi, dan berkembang bersama komunitas esports terbesar di Indonesia.
          </p>
          <Link href="/community">
            <Button size="lg" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 font-semibold">
              Gabung Komunitas
            </Button>
          </Link>
        </div>
      </Card>
    </div>

    {/* Main CTA Buttons */}
    <div className="text-center">
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link href="/register">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Daftar Sekarang - GRATIS
          </Button>
        </Link>
        <Link href="/contact">
          <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Hubungi Kami
          </Button>
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>100% Gratis Bergabung</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>50,000+ Gamer Aktif</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Support 24/7</span>
        </div>
      </div>
    </div>
  </div>
      </section>
    </div>
  );
}