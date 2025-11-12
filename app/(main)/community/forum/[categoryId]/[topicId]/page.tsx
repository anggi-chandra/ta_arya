import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/auth";
import { Suspense } from "react";
import ReplyForm from "./reply-form";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Always revalidate to get fresh replies

export default async function ForumTopicDetailPage({ params }: { params: { categoryId: string; topicId: string } }) {
  const supabase = getSupabaseClient();

  // Fetch topic - try with relationship first, fallback to separate queries
  let topic: any = null;
  let error: any = null;
  let author: any = null;
  let category: any = null;
  let replies: any[] = [];

  // Always fetch replies separately to ensure we get the latest data
  // First, fetch topic
  const { data: topicData, error: topicError } = await supabase
    .from("forum_topics")
    .select(
      `id, title, content, is_locked, is_pinned, created_at, category_id, author_id,
       author:profiles!forum_topics_author_id_fkey (id, username, full_name, avatar_url),
       category:forum_categories!forum_topics_category_id_fkey (id, name, icon)`
    )
    .eq("id", params.topicId)
    .single();

  if (topicError || !topicData) {
    console.error("Error fetching topic:", topicError);
    
    // Fallback: fetch topic without relationship
    const { data: topicSimple, error: topicSimpleError } = await supabase
      .from("forum_topics")
      .select("id, title, content, is_locked, is_pinned, created_at, category_id, author_id")
      .eq("id", params.topicId)
      .single();

    if (topicSimpleError || !topicSimple) {
      error = topicSimpleError;
      console.error("Error fetching topic:", topicSimpleError);
    } else {
      topic = topicSimple;

      // Fetch author separately
      if (topic.author_id) {
        const { data: authorData } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", topic.author_id)
          .single();
        author = authorData;
      }

      // Fetch category separately
      if (topic.category_id) {
        const { data: categoryData } = await supabase
          .from("forum_categories")
          .select("id, name, icon")
          .eq("id", topic.category_id)
          .single();
        category = categoryData;
      }
    }
  } else {
    // Success with relationship query
    topic = topicData;
    
    // Handle array responses from relationship
    author = Array.isArray(topic.author) ? topic.author[0] : topic.author;
    category = Array.isArray(topic.category) ? topic.category[0] : topic.category;
  }

  // Always fetch replies separately to ensure we get the latest data
  // Use a fresh query without any caching
  if (topic && topic.id) {
    try {
      // First, try to get all replies for this topic
      const { data: repliesData, error: repliesError, count } = await supabase
        .from("forum_replies")
        .select("id, content, created_at, author_id, topic_id", { count: 'exact' })
        .eq("topic_id", topic.id)
        .order("created_at", { ascending: true });

      if (repliesError) {
        console.error("Error fetching replies:", repliesError);
        if (process.env.NODE_ENV === 'development') {
          console.error("Replies error details:", {
            message: repliesError.message,
            code: repliesError.code,
            details: repliesError.details,
            hint: repliesError.hint
          });
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Topic ID: ${topic.id}`);
          console.log(`Replies count from query: ${count}`);
          console.log("Replies fetched:", repliesData?.length || 0);
          console.log("Replies data:", repliesData);
        }

        if (repliesData && repliesData.length > 0) {
          // Fetch authors for replies
          const authorIds = [...new Set(repliesData.map((r: any) => r.author_id).filter(Boolean))];
          
          if (authorIds.length > 0) {
            const { data: replyAuthors, error: authorsError } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url")
              .in("id", authorIds);

            if (authorsError) {
              console.error("Error fetching reply authors:", authorsError);
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.log("Reply authors fetched:", replyAuthors?.length || 0);
              }
            }

            const authorsMap = new Map(replyAuthors?.map((a: any) => [a.id, a]) || []);

            replies = repliesData.map((r: any) => ({
              ...r,
              author: authorsMap.get(r.author_id) || null
            }));
          } else {
            // No author IDs, but we have replies
            replies = repliesData.map((r: any) => ({
              ...r,
              author: null
            }));
          }
        } else {
          // No replies found - check if this is expected
          replies = [];
          if (process.env.NODE_ENV === 'development') {
            console.log(`No replies found for topic: ${topic.id}`);
            // Double-check by querying directly
            const { count: directCount } = await supabase
              .from("forum_replies")
              .select("*", { count: 'exact', head: true })
              .eq("topic_id", topic.id);
            console.log(`Direct count query result: ${directCount}`);
          }
        }
      }
    } catch (fetchError: any) {
      console.error("Exception while fetching replies:", fetchError);
      replies = [];
    }
  }

  // Handle error if topic not found
  if (error || !topic) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Topic fetch error:", error);
      console.log("Topic ID:", params.topicId);
      console.log("Category ID:", params.categoryId);
    }
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Topik tidak ditemukan</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Topik yang Anda cari mungkin telah dihapus atau tidak tersedia.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left text-xs">
              <p className="font-semibold mb-1">Error Details:</p>
              <p>Message: {error.message}</p>
              <p>Code: {error.code}</p>
              <p>Details: {JSON.stringify(error, null, 2)}</p>
            </div>
          )}
          <Link href={`/community/forum/${params.categoryId}`}>
            <Button>Kembali ke Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Verify category_id matches (in case URL category doesn't match topic category)
  if (topic.category_id && topic.category_id !== params.categoryId) {
    // Redirect to correct category if mismatch
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Kategori tidak sesuai</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Topik ini berada di kategori yang berbeda.
          </p>
          <Link href={`/community/forum/${topic.category_id}/${topic.id}`}>
            <Button>Lihat Topik di Kategori yang Benar</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If category was not fetched, fetch it now
  if (!category && topic.category_id) {
    const { data: categoryData } = await supabase
      .from("forum_categories")
      .select("id, name, icon")
      .eq("id", topic.category_id)
      .single();
    category = categoryData;
  }

  // Sort replies by creation date
  const sortedReplies = [...replies].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Topic found:', !!topic);
    console.log('Topic ID:', topic?.id);
    console.log('Category ID:', topic?.category_id);
    console.log('Author:', author);
    console.log('Category:', category);
    console.log('Replies count:', replies.length);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/community">Komunitas</Link> {" / "}
          <Link href={`/community/forum/${params.categoryId}`}>{category?.name || "Forum"}</Link> {" / "}
          <span>{topic.title}</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          {category?.icon && (
            <span className="text-2xl">{category.icon}</span>
          )}
          <h1 className="text-2xl font-bold">{topic.title}</h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {topic.is_pinned && (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Pinned</span>
          )}
          {topic.is_locked && (
            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Locked</span>
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