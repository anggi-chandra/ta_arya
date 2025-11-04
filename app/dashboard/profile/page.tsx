"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";

const profileSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional().nullable(),
  discord_username: z.string().max(100).optional().nullable(),
  instagram_username: z.string().max(100).optional().nullable(),
  twitter_username: z.string().max(100).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      username: "",
      bio: "",
      discord_username: "",
      instagram_username: "",
      twitter_username: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.email)
          .single();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            full_name: data.full_name || "",
            username: data.username || "",
            bio: data.bio || "",
            discord_username: data.discord_username || "",
            instagram_username: data.instagram_username || "",
            twitter_username: data.twitter_username || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchProfile();
  }, [session, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!session?.user?.email) {
      setMessage({ type: "error", text: "Anda harus login untuk memperbarui profil" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: session.user.email,
          full_name: data.full_name,
          username: data.username,
          bio: data.bio || null,
          discord_username: data.discord_username || null,
          instagram_username: data.instagram_username || null,
          twitter_username: data.twitter_username || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({ type: "success", text: "Profil berhasil diperbarui" });
      
      // Update session with new profile data
      await update({
        ...session,
        user: {
          ...session.user,
          name: data.full_name,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Gagal memperbarui profil. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah</p>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Lengkap
            </label>
            <input
              {...form.register("full_name")}
              type="text"
              id="full_name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
            />
            {form.formState.errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              {...form.register("username")}
              type="text"
              id="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
            />
            {form.formState.errors.username && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              {...form.register("bio")}
              id="bio"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
            ></textarea>
            {form.formState.errors.bio && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="discord_username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discord Username
              </label>
              <input
                {...form.register("discord_username")}
                type="text"
                id="discord_username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label htmlFor="instagram_username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instagram Username
              </label>
              <input
                {...form.register("instagram_username")}
                type="text"
                id="instagram_username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label htmlFor="twitter_username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter Username
              </label>
              <input
                {...form.register("twitter_username")}
                type="text"
                id="twitter_username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
