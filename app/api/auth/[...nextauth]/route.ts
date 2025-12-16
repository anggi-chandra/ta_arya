import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authOptions = {
  // Ensure correct base URL for production
  trustHost: true, // Trust Vercel's host
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days (default, can be extended with remember me)
  },
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // Handle Google OAuth sign in - create/update user in Supabase
      if (account?.provider === "google") {
        console.log("[Google OAuth] Starting sign in process for:", user.email);
        
        try {
          const supabase = getSupabaseClient();
          
          if (!user.email) {
            console.error("[Google OAuth] Email is missing");
            return false;
          }

          // Check if user exists in Supabase Auth by email
          let supabaseUserId = user.id;
          let userCreatedInSupabase = false;
          
          // Try to use Supabase Admin API if available (requires SERVICE_ROLE_KEY)
          if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            try {
              console.log("[Google OAuth] Attempting to use Supabase Admin API");
              
              // Try to get user from Supabase Auth by email
              const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
              
              if (listError) {
                console.warn("[Google OAuth] Error listing users:", listError.message);
              } else {
                const existingUser = existingUsers?.users?.find((u: any) => u.email === user.email);
                
                if (existingUser) {
                  // User exists in Supabase Auth, use their ID
                  supabaseUserId = existingUser.id;
                  console.log("[Google OAuth] Found existing Supabase user:", supabaseUserId);
                } else {
                  // Create new user in Supabase Auth
                  console.log("[Google OAuth] Creating new user in Supabase Auth");
                  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email: user.email,
                    email_confirm: true,
                    user_metadata: {
                      full_name: user.name,
                      avatar_url: user.image,
                      provider: "google",
                    },
                  });

                  if (createError) {
                    console.error("[Google OAuth] Error creating Supabase user:", createError.message);
                  } else if (newUser?.user) {
                    supabaseUserId = newUser.user.id;
                    userCreatedInSupabase = true;
                    console.log("[Google OAuth] Created new Supabase user:", supabaseUserId);
                  }
                }
              }
            } catch (adminError: any) {
              console.warn("[Google OAuth] Admin API error (this is OK if SERVICE_ROLE_KEY not set):", adminError?.message || adminError);
            }
          } else {
            console.warn("[Google OAuth] SUPABASE_SERVICE_ROLE_KEY not set, using NextAuth user ID");
          }

          // Update user.id to match Supabase user ID for consistency
          user.id = supabaseUserId;
          console.log("[Google OAuth] Using user ID:", supabaseUserId);

          // Check if profile already exists (using service role to bypass RLS)
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', supabaseUserId)
            .single();

          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            // PGRST116 = not found, which is OK
            console.error("[Google OAuth] Error checking profile:", profileCheckError.message);
          }

          if (!existingProfile) {
            // Create profile for Google user
            console.log("[Google OAuth] Creating profile in database");
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: supabaseUserId,
                full_name: user.name || (user.email ? user.email.split('@')[0] : 'User'),
                username: user.email ? user.email.split('@')[0] : null,
                avatar_url: user.image || null,
              });

            if (profileError) {
              console.error("[Google OAuth] Error creating profile:", profileError.message);
              console.error("[Google OAuth] Profile error details:", JSON.stringify(profileError, null, 2));
            } else {
              console.log("[Google OAuth] Profile created successfully");
            }
          } else {
            console.log("[Google OAuth] Profile already exists, updating if needed");
            // Update profile if needed
            const profileData: any = {};
            if (user.name && user.name !== existingProfile.full_name) {
              profileData.full_name = user.name;
            }
            if (user.image && user.image !== existingProfile.avatar_url) {
              profileData.avatar_url = user.image;
            }
            
            if (Object.keys(profileData).length > 0) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', supabaseUserId);

              if (updateError) {
                console.error("[Google OAuth] Error updating profile:", updateError.message);
              } else {
                console.log("[Google OAuth] Profile updated successfully");
              }
            }
          }

          // Ensure default 'user' role exists
          console.log("[Google OAuth] Checking user role");
          const { data: existingRole, error: roleCheckError } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', supabaseUserId)
            .eq('role', 'user')
            .single();

          if (roleCheckError && roleCheckError.code !== 'PGRST116') {
            console.error("[Google OAuth] Error checking role:", roleCheckError.message);
          }

          if (!existingRole) {
            console.log("[Google OAuth] Creating default user role");
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: supabaseUserId, 
                role: 'user',
                granted_at: new Date().toISOString(),
              });

            if (roleError) {
              console.error("[Google OAuth] Error creating user role:", roleError.message);
              console.error("[Google OAuth] Role error details:", JSON.stringify(roleError, null, 2));
            } else {
              console.log("[Google OAuth] User role created successfully");
            }
          } else {
            console.log("[Google OAuth] User role already exists");
          }

          console.log("[Google OAuth] Sign in process completed successfully");
          return true;
        } catch (error: any) {
          console.error("[Google OAuth] Fatal error in sign in callback:", error?.message || error);
          console.error("[Google OAuth] Error stack:", error?.stack);
          // Still allow sign in even if database operations fail
          // This ensures user can still login, but data might not be saved
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // For Google OAuth, store user info in token
      if (account?.provider === "google" && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      } else if (user?.supabaseAccessToken) {
        token.supabaseAccessToken = (user as any).supabaseAccessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      (session as any).supabaseAccessToken = token.supabaseAccessToken;
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Jika URL adalah relative, gunakan baseUrl
      if (url.startsWith("/")) {
        // Biarkan middleware handle role-based redirect
        // Redirect ke dashboard, middleware akan redirect admin ke /admin
        return `${baseUrl}/dashboard`;
      }
      // Jika URL adalah absolute dan dalam domain yang sama, allow
      if (url.startsWith(baseUrl)) return url;
      // Default redirect ke dashboard
      return `${baseUrl}/dashboard`;
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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
        // Max age 30 days for remember me functionality
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };