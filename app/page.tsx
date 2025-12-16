import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPlatformStats } from "@/lib/stats";
import { formatStatCount } from "@/lib/format";
import { GSAPWrapper } from "@/components/animations/GSAPWrapper";
import { GSAPButtonSetup } from "@/components/animations/GSAPButtonSetup";

export default async function LandingPage() {
    const stats = await getPlatformStats();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
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
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/30"></div>
            </div>

            {/* Content Overlay */}
            <GSAPWrapper animation="fadeInUp" duration={1} delay={0.2} scrollTrigger={false} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
                        BAGOES <span className="text-red-500">ESPORTS</span>
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-200 font-light tracking-wide max-w-3xl mx-auto">
                        Platform Manajemen Event Esports Terdepan di Indonesia
                    </p>
                </div>

                <GSAPWrapper animation="fadeInUp" duration={0.8} delay={0.4} scrollTrigger={false} className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
                    <Link href="/login">
                        <Button
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white px-12 py-8 text-2xl font-bold rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-red-500/60"
                            id="login-button"
                        >
                            MASUK
                        </Button>
                    </Link>
                    <GSAPButtonSetup buttonId="login-button" hoverScale={1.05} glowColor="rgba(220, 38, 38, 0.8)" />
                </GSAPWrapper>

                <GSAPWrapper animation="fadeInUp" duration={0.8} delay={0.6} stagger={0.15} scrollTrigger={false} className="mt-24 flex flex-wrap gap-12 justify-center text-white/70 text-sm font-medium tracking-widest uppercase">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                            {stats.users > 0 ? `${formatStatCount(stats.users)}+` : "0"}
                        </span>
                        <span>Pengguna</span>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                            {stats.completedEvents > 0 ? `${formatStatCount(stats.completedEvents)}+` : "0"}
                        </span>
                        <span>Event Selesai</span>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                            {stats.teams > 0 ? `${formatStatCount(stats.teams)}+` : "0"}
                        </span>
                        <span>Tim Terdaftar</span>
                    </div>
                </GSAPWrapper>
            </GSAPWrapper>

            {/* Footer minimal */}
            <div className="absolute bottom-8 text-white/40 text-xs tracking-widest">
                &copy; 2025 BAGOES ESPORTS. ALL RIGHTS RESERVED.
            </div>
        </div>
    );
}
