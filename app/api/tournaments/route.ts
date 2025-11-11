import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/tournaments - Get all tournaments (public access)
export async function GET(request: NextRequest) {
  // Use service role key for public access to tournaments
  const supabase = getSupabaseClient()
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  try {
    let query = supabase.from('tournaments').select('*', { count: 'exact' })
    
    // Filter by status from database field
    if (status) {
      query = query.eq('status', status)
    }
    // If no status filter, show all tournaments (upcoming, ongoing, completed)
    // Cancelled tournaments are excluded by default for public page
    
    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })
    
    const { data: tournaments, error, count } = await query
    
    if (error) {
      console.error('Error fetching tournaments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const totalPages = count ? Math.ceil(count / limit) : 0
    
    return NextResponse.json({
      tournaments: tournaments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error: any) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}