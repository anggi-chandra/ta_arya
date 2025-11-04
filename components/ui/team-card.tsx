"use client";

import Image from "next/image";
import { Users, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  id: string;
  name: string;
  logo: string;
  game: string;
  memberCount: number;
  achievements: number;
  description: string;
  isRecruiting: boolean;
  className?: string;
}

export function TeamCard({
  id,
  name,
  logo,
  game,
  memberCount,
  achievements,
  description,
  isRecruiting,
  className,
}: TeamCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={logo}
              alt={`${name} logo`}
              width={64}
              height={64}
              className="object-cover"
              onError={(e) => {
                // Fallback for missing images
                e.currentTarget.src = "/images/teams/team-default.svg";
              }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground">{game}</p>
          </div>
        </div>
        
        <p className="text-sm mb-4">{description}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{memberCount} Anggota</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>{achievements} Prestasi</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="default">Lihat Detail</Button>
          {isRecruiting && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              Membuka Rekrutmen
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}