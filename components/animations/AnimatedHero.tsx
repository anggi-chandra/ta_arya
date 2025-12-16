"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AnimatedHeroProps {
  formattedStats: {
    users: string;
    teams: string;
    completedEvents: string;
  };
}

export function AnimatedHero({ formattedStats }: AnimatedHeroProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Badge animation
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
      );
    }

    // Title animation
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
      );
    }

    // Description animation
    if (descRef.current) {
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power2.out" }
      );
    }

    // Buttons animation
    if (buttonsRef.current) {
      gsap.fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        }
      );
    }

    // Stats animation
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 1.0,
          stagger: 0.1,
          ease: "back.out(1.2)",
        }
      );
    }
  }, []);

  return (
    <div className="md:w-1/2 mb-10 md:mb-0 z-10">
      <div
        ref={badgeRef}
        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 shadow-lg border border-white/20"
      >
        🏆 Platform Esports #1 di Indonesia
      </div>
      <h1
        ref={titleRef}
        className="text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl"
      >
        <span className="text-white">Wujudkan Impian</span>
        <span className="text-primary drop-shadow-lg"> Esports</span>
        <span className="text-white"> Anda</span>
      </h1>
      <p
        ref={descRef}
        className="text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg"
      >
        Bergabunglah dengan komunitas esports terbesar di Indonesia. Ikuti
        turnamen, bentuk tim impian, dan raih prestasi tertinggi dalam dunia
        gaming kompetitif.
      </p>
      <div ref={buttonsRef} className="flex flex-wrap gap-4">
        <Link href="/events">
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl"
          >
            🎮 Jelajahi Event
          </Button>
        </Link>
        <Link href="/register">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold"
          >
            Daftar Sekarang
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div
        ref={statsRef}
        className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-start">
            {formattedStats.users}
          </div>
          <div className="text-sm text-gray-300">Pengguna Aktif</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-end">
            {formattedStats.completedEvents}
          </div>
          <div className="text-sm text-gray-300">Event Selesai</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gradient-primary bg-clip-text text-transparent">
            {formattedStats.teams}
          </div>
          <div className="text-sm text-gray-300">Tim Terdaftar</div>
        </div>
      </div>
    </div>
  );
}

