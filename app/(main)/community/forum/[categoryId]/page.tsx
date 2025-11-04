import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ForumCategoryPage({ params }: { params: { categoryId: string } }) {
  const supabase = getSupabaseClient();

  const { data: category, error: catErr } = await supabase
    .from("forum_categories")
    .select("id, name, description")
    .eq("id", params.categoryId)
    .single();

  const { data: topics, error: topicsErr } = await supabase
    .from("forum_topics")
    .select(
      `id, title, is_locked, is_pinned, created_at,
       author:profiles!forum_topics_author_id_fkey (id, username, full_name)`
    )
    .eq("category_id", params.categoryId);

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

  const list = (topics || [])
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
        <h1 className="text-2xl font-bold">{category?.name || "Kategori Forum"}</h1>
        {category?.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{category.description}</p>
        )}
      </div>

      <div className="space-y-3">
        {list.map((t: any) => {
          const author = Array.isArray(t.author) ? t.author[0] : t.author;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/community/forum/${params.categoryId}/${t.id}`} className="text-lg font-semibold hover:underline">
                    {t.title}
                  </Link>
                  <div className="mt-1 text-xs text-gray-500">
                    Oleh {author?.username || author?.full_name || "Anon"} • {new Date(t.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.is_pinned && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Pinned</span>
                  )}
                  {t.is_locked && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Locked</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {list.length === 0 && (
          <Card className="p-6 text-center text-sm text-gray-500">Belum ada topik di kategori ini.</Card>
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