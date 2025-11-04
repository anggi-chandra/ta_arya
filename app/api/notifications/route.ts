import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, withNextAuthSession } from '@/lib/auth'

// GET /api/notifications - List current user's notifications
export const GET = withNextAuthSession(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ notifications: data || [] })
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/notifications - Mark notifications as read
// Body: { action: 'markAllRead' } or { action: 'markRead', id: '<uuid>' }
export const PUT = withNextAuthSession(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()

  try {
    const body = await req.json().catch(() => ({}))
    const { action, id } = body || {}

    if (action === 'markAllRead') {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    if (action === 'markRead' && id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Error updating notifications:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})