import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/auth";
import { Suspense } from "react";
import ReplyForm from "./reply-form";

export const dynamic = "force-dynamic";

export default async function ForumTopicDetailPage({ params }: { params: { categoryId: string; topicId: string } }) {
  const supabase = getSupabaseClient();

  // Fetch topic with author and replies
  const { data: topic, error } = await supabase
    .from("forum_topics")
    .select(
      `id, title, content, is_locked, is_pinned, created_at,
       author:profiles!forum_topics_author_id_fkey (id, username, full_name, avatar_url),
       category:forum_categories!forum_topics_category_id_fkey (id, name),
       forum_replies (id, content, created_at, author:profiles (id, username, full_name, avatar_url))`
    )
    .eq("id", params.topicId)
    .single();

  // Handle error if topic not found
  if (error || !topic) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Topik tidak ditemukan</h1>
          <p className="mb-6">Topik yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
          <Link href={`/community/forum/${params.categoryId}`}>
            <Button>Kembali ke Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Sort replies by creation date
  const sortedReplies = [...(topic.forum_replies || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Safely read possibly-array relations from Supabase
  const category = Array.isArray(topic.category) ? topic.category[0] : topic.category;
  const author = Array.isArray(topic.author) ? topic.author[0] : topic.author;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/community">Komunitas</Link> {" / "}
          <Link href={`/community/forum/${params.categoryId}`}>{category?.name || "Forum"}</Link> {" / "}
          <span>{topic.title}</span>
        </div>
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          {topic.is_pinned && (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Pinned</span>
          )}
          {topic.is_locked && (
            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Locked</span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Oleh {author?.username || author?.full_name || "Anon"} • {new Date(topic.created_at).toLocaleString()}
        </div>
      </div>

      <Card className="p-6 mb-8">
        <div className="prose dark:prose-invert max-w-none">
          {(typeof topic.content === "string" ? topic.content.split("\n") : []).map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Balasan ({sortedReplies.length})</h2>
        <Link href={`/community/forum/${params.categoryId}`}>
          <Button variant="outline">Kembali ke Topik</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {sortedReplies.map((r: any) => (
          <Card key={r.id} className="p-4">
            <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-medium">{r.author?.username || r.author?.full_name || "Anon"}</span>
              <span className="text-xs text-gray-500"> • {new Date(r.created_at).toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-100">
              {(typeof r.content === "string" ? r.content.split("\n") : []).map((paragraph: string, i: number) => (
                <p key={i} className="mb-2">{paragraph}</p>
              ))}
            </div>
          </Card>
        ))}
        {sortedReplies.length === 0 && (
          <Card className="p-6 text-center text-sm text-gray-500">Belum ada balasan.</Card>
        )}
      </div>

      {!topic.is_locked && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Tambahkan Balasan</h3>
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <ReplyForm topicId={params.topicId} categoryId={params.categoryId} />
          </Suspense>
        </div>
      )}
      
      {topic.is_locked && (
        <Card className="p-4 mt-8 text-center">
          <p className="text-sm text-gray-500">Topik ini telah dikunci dan tidak menerima balasan baru.</p>
        </Card>
      )}
    </div>
  );
}