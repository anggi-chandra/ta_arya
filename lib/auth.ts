import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'vip' | 'user'
  granted_by: string | null
  granted_at: string
}

export interface AuthUser {
  id: string
  email: string
  roles: UserRole[]
}

// Create Supabase client for server-side operations
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Get current user with roles (simplified for testing)
export async function getCurrentUser(authHeader?: string): Promise<AuthUser | null> {
  // For testing purposes, return a mock admin user
  // In production, you would parse the JWT token from authHeader
  return {
    id: 'mock-admin-id',
    email: 'admin@example.com',
    roles: [{
      id: 'role-1',
      user_id: 'mock-admin-id',
      role: 'admin',
      granted_by: null,
      granted_at: new Date().toISOString()
    }]
  }
}

// Get current user from NextAuth session
export async function getCurrentUserFromSession(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return null;
    }
    
    const supabase = createSupabaseClient();
    
    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', token.sub);
      
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return null;
    }
    
    return {
      id: token.sub,
      email: token.email as string,
      roles: userRoles || []
    };
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

// Check if user has specific role
export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.roles.some(r => r.role === role) || false
}

// Check if user is admin
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin')
}

// Check if user is moderator or admin
export function isModerator(user: AuthUser | null): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'moderator')
}

// Middleware for API routes
export function withAuth(handler: Function, requiredRole?: string) {
  return async (req: NextRequest, context?: any) => {
    try {
      const authHeader = req.headers.get('authorization') ?? undefined
      const user = await getCurrentUser(authHeader)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check role if required
      if (requiredRole && !hasRole(user, requiredRole)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        )
      }

      // Call handler with user context
      return await handler(req, user, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Middleware for API routes using NextAuth session
export function withNextAuthSession(handler: Function, requiredRole?: string) {
  return async (req: NextRequest, context?: any) => {
    try {
      const user = await getCurrentUserFromSession(req)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please sign in' },
          { status: 401 }
        )
      }

      // Check role if required
      if (requiredRole && !hasRole(user, requiredRole)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        )
      }

      // Call handler with user context
      return await handler(req, user, context)
    } catch (error) {
      console.error('NextAuth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Admin only middleware
export function withAdminAuth(handler: Function) {
  return withAuth(handler, 'admin')
}

// Moderator or admin middleware
export function withModeratorAuth(handler: Function) {
  return async (req: NextRequest, context?: any) => {
    try {
      const authHeader = req.headers.get('authorization') ?? undefined
      const user = await getCurrentUser(authHeader)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      if (!isModerator(user)) {
        return NextResponse.json(
          { error: 'Forbidden - Moderator access required' },
          { status: 403 }
        )
      }

      return await handler(req, user, context)
    } catch (error) {
      console.error('Moderator auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Helper function to create admin user (for initial setup)
export async function createAdminUser(userId: string, grantedBy?: string) {
  const supabase = createSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
        granted_by: grantedBy || null,
        granted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

// Get Supabase client for use in API routes
export function getSupabaseClient() {
  return createSupabaseClient()
}