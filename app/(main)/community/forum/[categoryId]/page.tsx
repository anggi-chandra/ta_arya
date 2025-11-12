import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ForumCategoryPage({ params }: { params: { categoryId: string } }) {
  const supabase = getSupabaseClient();

  const { data: category, error: catErr } = await supabase
    .from("forum_categories")
    .select("id, name, description, icon, color")
    .eq("id", params.categoryId)
    .single();

  // Fetch topics - handle potential relationship issues
  let topics: any[] = [];
  let topicsErr: any = null;
  
  // Try with relationship first
  const { data: topicsData, error: topicsError } = await supabase
    .from("forum_topics")
    .select(
      `id, title, is_locked, is_pinned, created_at, category_id,
       author:profiles!forum_topics_author_id_fkey (id, username, full_name)`
    )
    .eq("category_id", params.categoryId);

  if (topicsError) {
    console.error("Error fetching topics with relationship:", topicsError);
    // If relationship fails, try without relationship
    const { data: topicsSimple, error: topicsSimpleError } = await supabase
      .from("forum_topics")
      .select("id, title, is_locked, is_pinned, created_at, category_id, author_id")
      .eq("category_id", params.categoryId);
    
    if (topicsSimpleError) {
      topicsErr = topicsSimpleError;
      console.error("Error fetching topics:", topicsSimpleError);
    } else {
      // Fetch author data separately
      const authorIds = topicsSimple?.map((t: any) => t.author_id).filter(Boolean) || [];
      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", authorIds);
        
        const authorsMap = new Map(authors?.map((a: any) => [a.id, a]) || []);
        topics = topicsSimple?.map((t: any) => ({
          ...t,
          author: authorsMap.get(t.author_id) || null
        })) || [];
      } else {
        topics = topicsSimple || [];
      }
    }
  } else {
    // Handle array response from relationship
    topics = topicsData?.map((topic: any) => {
      const author = Array.isArray(topic.author) ? topic.author[0] : topic.author;
      return { ...topic, author };
    }) || [];
  }

  if (catErr) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/community">Komunitas</Link> {" / "}
          <Link href="/community/forum">Forum</Link>
        </div>
        <Card className="p-6 text-red-600">Kategori tidak ditemukan: {catErr.message}</Card>
      </div>
    );
  }

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Category ID:', params.categoryId);
    console.log('Topics found:', topics?.length || 0);
    console.log('Topics data:', topics);
    if (topicsErr) {
      console.error("Topics error:", topicsErr);
    }
  }

  // Show error if exists (but don't block page)
  if (topicsErr) {
    console.error("Topics error:", topicsErr);
  }

  const list = (topics || [])
    .filter((t: any) => {
      // Double-check category_id matches (in case of data inconsistency)
      return t.category_id === params.categoryId;
    })
    .sort((a: any, b: any) => {
      // Pinned first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/community">Komunitas</Link> {" / "}
          <Link href="/community/forum">Forum</Link> {" / "}
          <span>{category?.name || "Kategori"}</span>
        </div>
        <div className="flex items-center gap-3">
          {category?.icon && (
            <span className="text-4xl">{category.icon}</span>
          )}
          <div>
            <h1 className="text-2xl font-bold">{category?.name || "Kategori Forum"}</h1>
            {category?.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {topicsErr && (
        <Card className="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Peringatan: {topicsErr.message}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {list.map((t: any) => {
          const author = Array.isArray(t.author) ? t.author[0] : t.author;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/community/forum/${params.categoryId}/${t.id}`} className="text-lg font-semibold hover:underline">
                    {t.title}
                  </Link>
                  <div className="mt-1 text-xs text-gray-500">
                    Oleh {author?.username || author?.full_name || "Anon"} • {new Date(t.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.is_pinned && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Pinned</span>
                  )}
                  {t.is_locked && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Locked</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {list.length === 0 && !topicsErr && (
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Belum ada topik di kategori ini.</p>
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <p>Kategori ID: {params.categoryId}</p>
              <p>Total topik ditemukan: {topics?.length || 0}</p>
              {process.env.NODE_ENV === 'development' && topics && topics.length > 0 && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-left">
                  <p className="font-semibold mb-1">Debug Info:</p>
                  {topics.map((t: any, idx: number) => (
                    <p key={idx} className="text-xs">
                      Topic {idx + 1}: {t.title} (category_id: {t.category_id}, match: {t.category_id === params.categoryId ? '✓' : '✗'})
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-4">
                Admin dapat membuat topik baru di halaman{" "}
                <Link href="/admin/forum" className="text-primary hover:underline">
                  Kelola Forum
                </Link>
              </p>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <Link href="/community/forum">
          <Button variant="outline">Kembali ke Forum</Button>
        </Link>
      </div>
    </div>
  );
}