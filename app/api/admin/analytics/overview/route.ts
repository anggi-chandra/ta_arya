import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// GET /api/admin/analytics/overview - Get website overview statistics
export const GET = withAdminAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const period = searchParams.get('period') || '30' // days
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (usersError) {
      console.error('Error counting users:', usersError)
    }

    // Get new users in period
    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    if (newUsersError) {
      console.error('Error counting new users:', newUsersError)
    }

    // Get total events count
    const { count: totalEvents, error: eventsError } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })

    if (eventsError) {
      console.error('Error counting events:', eventsError)
    }

    // Get active events count
    const { count: activeEvents, error: activeEventsError } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('end_date', new Date().toISOString())

    if (activeEventsError) {
      console.error('Error counting active events:', activeEventsError)
    }

    // Get total teams count
    const { count: totalTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })

    if (teamsError) {
      console.error('Error counting teams:', teamsError)
    }

    // Get total registrations count
    const { count: totalRegistrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })

    if (registrationsError) {
      console.error('Error counting registrations:', registrationsError)
    }

    // Get new registrations in period
    const { count: newRegistrations, error: newRegistrationsError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    if (newRegistrationsError) {
      console.error('Error counting new registrations:', newRegistrationsError)
    }

    // Get total content count
    const { count: totalContent, error: contentError } = await supabase
      .from('content')
      .select('id', { count: 'exact', head: true })

    if (contentError) {
      console.error('Error counting content:', contentError)
    }

    // Get published content count
    const { count: publishedContent, error: publishedContentError } = await supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')

    if (publishedContentError) {
      console.error('Error counting published content:', publishedContentError)
    }

    // Get forum topics count
    const { count: forumTopics, error: forumTopicsError } = await supabase
      .from('forum_topics')
      .select('id', { count: 'exact', head: true })

    if (forumTopicsError) {
      console.error('Error counting forum topics:', forumTopicsError)
    }

    // Get forum replies count
    const { count: forumReplies, error: forumRepliesError } = await supabase
      .from('forum_replies')
      .select('id', { count: 'exact', head: true })

    if (forumRepliesError) {
      console.error('Error counting forum replies:', forumRepliesError)
    }

    // Calculate growth percentages (mock calculation for demonstration)
    const userGrowth = totalUsers && newUsers ? ((newUsers / totalUsers) * 100).toFixed(1) : '0'
    const eventGrowth = totalEvents && totalEvents > 0 ? '12.5' : '0' // Mock data
    const registrationGrowth = totalRegistrations && newRegistrations ? 
      ((newRegistrations / totalRegistrations) * 100).toFixed(1) : '0'

    return NextResponse.json({
      overview: {
        users: {
          total: totalUsers || 0,
          new: newUsers || 0,
          growth: `${userGrowth}%`
        },
        events: {
          total: totalEvents || 0,
          active: activeEvents || 0,
          growth: `${eventGrowth}%`
        },
        teams: {
          total: totalTeams || 0,
          growth: '8.3%' // Mock data
        },
        registrations: {
          total: totalRegistrations || 0,
          new: newRegistrations || 0,
          growth: `${registrationGrowth}%`
        },
        content: {
          total: totalContent || 0,
          published: publishedContent || 0,
          draft: (totalContent || 0) - (publishedContent || 0)
        },
        community: {
          topics: forumTopics || 0,
          replies: forumReplies || 0,
          engagement: forumReplies && forumTopics ? 
            (forumReplies / forumTopics).toFixed(1) : '0'
        }
      },
      period: `${period} days`
    })
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})