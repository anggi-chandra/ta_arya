"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ReplyForm({ topicId, categoryId }: { topicId: string; categoryId: string }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Balasan tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Anda harus login untuk membalas");
        setIsSubmitting(false);
        return;
      }

      // Add reply
      const { error: replyError } = await supabase
        .from("forum_replies")
        .insert({
          content,
          topic_id: topicId,
          author_id: user.id
        });

      if (replyError) {
        throw replyError;
      }

      // Reset form and refresh
      setContent("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan balasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
            placeholder="Tulis balasan Anda..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Balasan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}