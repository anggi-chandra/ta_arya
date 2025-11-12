import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/community/data - Get community data (upcoming events and latest forum posts)
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Fetch upcoming events (limit 5, ordered by starts_at)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, starts_at, game')
      .eq('status', 'upcoming')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(5)

    if (eventsError) {
      console.error('Error fetching upcoming events:', eventsError)
    }

    // Get participant counts for events
    const eventIds = events?.map(e => e.id) || []
    let participantCounts: Record<string, number> = {}
    
    if (eventIds.length > 0) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds)

      if (registrations) {
        registrations.forEach((reg: any) => {
          participantCounts[reg.event_id] = (participantCounts[reg.event_id] || 0) + 1
        })
      }
    }

    // Format events with participant counts
    const upcomingEvents = (events || []).map(event => ({
      id: event.id,
      title: event.title,
      game: event.game,
      date: new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      attending: participantCounts[event.id] || 0
    }))

    // Fetch latest forum topics with stats (limit 4, ordered by created_at desc)
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        category_id,
        created_at,
        view_count,
        author:profiles!forum_topics_author_id_fkey (
          id,
          username,
          full_name
        ),
        category:forum_categories!forum_topics_category_id_fkey (
          id,
          name,
          icon
        )
      `)
      .order('created_at', { ascending: false })
      .limit(4)

    if (topicsError) {
      console.error('Error fetching forum topics:', topicsError)
    }

    // Get reply counts for topics
    const topicIds = topics?.map(t => t.id) || []
    let replyCounts: Record<string, number> = {}
    let lastActivity: Record<string, string> = {}

    if (topicIds.length > 0) {
      // Get reply counts
      const { data: replies } = await supabase
        .from('forum_replies')
        .select('topic_id, created_at')
        .in('topic_id', topicIds)

      if (replies) {
        replies.forEach((reply: any) => {
          replyCounts[reply.topic_id] = (replyCounts[reply.topic_id] || 0) + 1
          
          // Track last activity (most recent reply or topic creation)
          const replyDate = new Date(reply.created_at).toISOString()
          if (!lastActivity[reply.topic_id] || replyDate > lastActivity[reply.topic_id]) {
            lastActivity[reply.topic_id] = replyDate
          }
        })
      }

      // Also check topic creation date for last activity
      topics?.forEach((topic: any) => {
        const topicDate = new Date(topic.created_at).toISOString()
        if (!lastActivity[topic.id] || topicDate > lastActivity[topic.id]) {
          lastActivity[topic.id] = topicDate
        }
      })
    }

    // Format topics with stats
    const forumPosts = (topics || []).map((topic: any) => {
      const author = Array.isArray(topic.author) ? topic.author[0] : topic.author
      const category = Array.isArray(topic.category) ? topic.category[0] : topic.category
      
      const lastActivityDate = lastActivity[topic.id] || topic.created_at
      const now = new Date()
      const activityDate = new Date(lastActivityDate)
      const diffMs = now.getTime() - activityDate.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      let activityText = ''
      if (diffHours < 1) {
        activityText = 'Just now'
      } else if (diffHours < 24) {
        activityText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else {
        activityText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      }

      return {
        id: topic.id,
        title: topic.title,
        categoryId: topic.category_id,
        author: author?.username || author?.full_name || 'Anonymous',
        replies: replyCounts[topic.id] || 0,
        views: topic.view_count || 0,
        lastActivity: activityText,
        category: category?.name || 'General',
        categoryIcon: category?.icon || null
      }
    })

    return NextResponse.json({
      upcomingEvents,
      forumPosts
    })
  } catch (error: any) {
    console.error('Error in community data API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

