"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Eye, Clock } from "lucide-react";

interface UpcomingEvent {
  id: string;
  title: string;
  game: string;
  date: string;
  attending: number;
}

interface ForumPost {
  id: string;
  title: string;
  categoryId: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  category: string;
  categoryIcon?: string | null;
}

export default function CommunityPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunityData() {
      try {
        const res = await fetch("/api/community/data");
        const data = await res.json();
        
        if (res.ok) {
          setUpcomingEvents(data.upcomingEvents || []);
          setForumPosts(data.forumPosts || []);
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunityData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Komunitas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bergabung, berdiskusi, dan berkembang bersama komunitas esports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upcoming Community Events */}
        <Card className="p-6 bg-gray-900 dark:bg-gray-800 text-white">
          <h2 className="text-2xl font-bold mb-6">Upcoming Community Events</h2>
          
          {loading ? (
            <div className="text-gray-400">Memuat...</div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={event.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      {event.attending} attending
                    </div>
                  </div>
                  {index < upcomingEvents.length - 1 && (
                    <div className="border-t border-gray-700 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Belum ada event yang akan datang.</div>
          )}
          
          <div className="mt-6">
            <Link href="/events">
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-white hover:bg-gray-700"
              >
                View All Events
              </Button>
            </Link>
          </div>
        </Card>

        {/* Community Forum */}
        <Card className="p-6 bg-gray-900 dark:bg-gray-800 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-500">Community Forum</h2>
            <Link href="/community/forum">
              <Button 
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                New Post
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-gray-400">Memuat...</div>
          ) : forumPosts.length > 0 ? (
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="p-4 bg-gray-800 dark:bg-gray-700 border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                        {post.categoryIcon || post.category.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2 line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-2">
                        <span>by {post.author}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last activity {post.lastActivity}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href={`/community/forum/${post.categoryId}/${post.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Belum ada post di forum.</div>
          )}
          
          <div className="mt-6">
            <Link href="/community/forum">
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-white hover:bg-gray-700"
              >
                View All Threads
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
