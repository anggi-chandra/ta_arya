import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

import { getToken } from 'next-auth/jwt'

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const supabaseToken = typeof token?.supabaseAccessToken === 'string' ? token!.supabaseAccessToken : ''
  if (!token || !supabaseToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseClient(supabaseToken)
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  try {
    let query = supabase.from('events').select('*', { count: 'exact' })
    
    // Filter by status
    if (status) {
      const now = new Date().toISOString()
      if (status === 'upcoming') {
        query = query.gt('starts_at', now)
      } else if (status === 'ongoing') {
        query = query.lte('starts_at', now).gte('ends_at', now)
      } else if (status === 'completed') {
        query = query.lt('ends_at', now)
      }
    }
    
    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('starts_at', { ascending: false })
    
    const { data: events, error, count } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const totalPages = count ? Math.ceil(count / limit) : 0
    
    return NextResponse.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}