"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  game?: string;
  date?: string;
  participants?: number;
  maxParticipants?: number;
  price?: number;
  image?: string;
  location?: string;
  status?: "upcoming" | "ongoing" | "completed";
}

export function EventCard({
  id,
  title,
  description,  
  game = "Unknown Game",
  date = "TBA",
  participants = 0,
  maxParticipants = 0,
  price = 0,
  image = "/window.svg",
  location = "TBA",
  status = "upcoming",
}: EventCardProps) {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800">
        <div className={`absolute top-2 right-2 z-10 rounded-full px-3 py-1 text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        {image && (image.startsWith('http') || image.startsWith('//')) ? (
          // External image - use regular img tag
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/hero-esports.svg";
            }}
          />
        ) : (
          // Internal image - use Next.js Image component
          <Image
            src={image || "/images/hero-esports.svg"}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/hero-esports.svg";
            }}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{game}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {participants}/{maxParticipants} Teams
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Trophy className="h-4 w-4 mr-2" />
            <span>{price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : "Gratis"}</span>
          </div>
        </div>
        
        <Link href={`/events/${id}`} className="mt-4 inline-block w-full">
          <button className="w-full rounded bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            View Details
          </button>
        </Link>
      </div>
    </Card>
  );
}