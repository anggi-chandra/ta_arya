import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions = {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          name: (data.user.user_metadata as any)?.full_name ?? data.user.email?.split("@")[0],
          email: data.user.email,
          image: (data.user.user_metadata as any)?.avatar_url ?? null,
          // attach supabase access token for later use
          supabaseAccessToken: data.session?.access_token,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user?.supabaseAccessToken) {
        token.supabaseAccessToken = (user as any).supabaseAccessToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      (session as any).supabaseAccessToken = token.supabaseAccessToken;
      return session;
    },
  },
  events: {
    async signIn({ user }: { user?: any }) {
      try {
        const supa = getSupabaseClient((user as any)?.supabaseAccessToken);
        const userId = (user as any)?.id;
        const userEmail = (user as any)?.email as string | undefined;
        const fullName = (user as any)?.name as string | undefined;

        if (!userId) return;

        // Ensure profile exists
        const { data: existingProfile } = await supa
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (!existingProfile) {
          await supa
            .from('profiles')
            .insert({
              id: userId,
              full_name: fullName || (userEmail ? userEmail.split('@')[0] : 'User'),
              username: userEmail ? userEmail.split('@')[0] : null,
            });
        }

        // Ensure default 'user' role exists
        const { data: existingRole } = await supa
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role', 'user')
          .single();

        if (!existingRole) {
          await supa
            .from('user_roles')
            .insert({ user_id: userId, role: 'user' });
        }
      } catch (e) {
        console.error('NextAuth signIn event error:', e);
      }
    },
    async signOut() {
      // Clear Supabase session on logout
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out from Supabase:', e);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };