"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: string | null;
  type: "blog" | "news" | "article" | "page";
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  author?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
};

type BlogPostResponse = {
  content: BlogPost;
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data, isLoading, isError, error } = useQuery<BlogPostResponse>({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      console.log(`Fetching blog post with slug: ${slug}`);
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error fetching blog post:", errorData);
        if (res.status === 404) {
          throw new Error("Artikel tidak ditemukan");
        }
        throw new Error(errorData.error || "Gagal memuat artikel");
      }
      const result = await res.json();
      console.log("Fetched blog post:", result);
      return result;
    },
    enabled: !!slug,
  });

  const post = data?.content;

  // Calculate read time (average reading speed: 200 words per minute)
  const calculateReadTime = (content: string): string => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} menit`;
  };

  // Format date
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Artikel yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">
              {error instanceof Error ? error.message : "Terjadi kesalahan"}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Slug: {slug}
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Blog
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.full_name || post.author.username || "Admin"}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{calculateReadTime(post.content)}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      {/* Back to Blog */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link href="/blog">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Blog
          </Button>
        </Link>
      </div>
    </div>
  );
}

