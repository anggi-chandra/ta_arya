"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReplyForm({ topicId, categoryId }: { topicId: string; categoryId: string }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is authenticated
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ReplyForm - Session status:', status);
      console.log('ReplyForm - Session data:', session);
      console.log('ReplyForm - Is authenticated:', isAuthenticated);
    }
  }, [status, session, isAuthenticated]);

  useEffect(() => {
    // Clear error when session status changes
    if (status === "authenticated" && error === "Anda harus login untuk membalas") {
      setError("");
    }
  }, [status, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Balasan tidak boleh kosong");
      return;
    }

    if (!isAuthenticated) {
      setError("Anda harus login untuk membalas");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create reply via API route (uses NextAuth session)
      const response = await fetch("/api/forum/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies for NextAuth session
        body: JSON.stringify({
          content,
          topic_id: topicId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambahkan balasan");
      }

      // Reset form
      setContent("");
      setError("");
      
      // Show success message (optional - can be removed if you prefer)
      // alert("Balasan berhasil dikirim!");
      
      // Force a hard refresh to get the latest replies
      // This ensures the server component re-fetches all data from database
      window.location.href = window.location.href;
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan balasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="text-center text-sm text-gray-500">
          Memuat...
        </div>
      </Card>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="p-4">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Anda harus login untuk membalas.{" "}
            <a href="/login" className="underline font-medium">
              Login di sini
            </a>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
            placeholder="Tulis balasan Anda..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={5}
          />
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Balasan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}