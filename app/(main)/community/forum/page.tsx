import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ForumIndexPage() {
  const supabase = getSupabaseClient();

  const { data: categories, error } = await supabase
    .from("forum_categories")
    .select("id, name, description, icon, color")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Forum</h1>
        <Card className="p-6 text-red-600">Gagal memuat kategori: {error.message}</Card>
      </div>
    );
  }

  const list = categories || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/community">Komunitas</Link> {" / "}
          <span>Forum</span>
        </div>
        <h1 className="text-2xl font-bold">Forum</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Pilih kategori untuk melihat topik diskusi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((c) => (
          <Card key={c.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-2">
              {c.icon && (
                <span className="text-3xl flex-shrink-0">{c.icon}</span>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{c.name}</h3>
                {c.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{c.description}</p>
                )}
              </div>
            </div>
            <Link href={`/community/forum/${c.id}`}>
              <Button size="sm">Lihat Topik</Button>
            </Link>
          </Card>
        ))}

        {list.length === 0 && (
          <Card className="p-6 text-center text-sm text-gray-500">Belum ada kategori forum.</Card>
        )}
      </div>
    </div>
  );
}