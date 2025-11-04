import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/teams/[id]/achievements/[achievementId] - Get specific achievement
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string, achievementId: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: achievement, error } = await supabase
      .from('team_achievements')
      .select(`
        *,
        team:teams (
          id,
          name,
          game
        )
      `)
      .eq('id', params.achievementId)
      .eq('team_id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ achievement })
  } catch (error) {
    console.error('Error fetching achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/teams/[id]/achievements/[achievementId] - Update achievement
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string, achievementId: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      description,
      achievement_date,
      rank_position,
      tournament_name,
      prize_amount
    } = body

    // Check if achievement exists
    const { data: existingAchievement, error: achievementError } = await supabase
      .from('team_achievements')
      .select('id')
      .eq('id', params.achievementId)
      .eq('team_id', params.id)
      .single()

    if (achievementError) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    // Validate achievement date if provided
    const achievementDate = achievement_date ? new Date(achievement_date) : undefined
    if (achievementDate && isNaN(achievementDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid achievement date' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (achievementDate) updateData.achievement_date = achievementDate.toISOString()
    if (rank_position !== undefined) updateData.rank_position = rank_position
    if (tournament_name !== undefined) updateData.tournament_name = tournament_name
    if (prize_amount !== undefined) updateData.prize_amount = prize_amount

    const { data, error } = await supabase
      .from('team_achievements')
      .update(updateData)
      .eq('id', params.achievementId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update achievement: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Achievement updated successfully',
      achievement: data
    })
  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/teams/[id]/achievements/[achievementId] - Delete achievement
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string, achievementId: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if achievement exists
    const { data: achievement, error: achievementError } = await supabase
      .from('team_achievements')
      .select('id, title')
      .eq('id', params.achievementId)
      .eq('team_id', params.id)
      .single()

    if (achievementError) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('team_achievements')
      .delete()
      .eq('id', params.achievementId)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete achievement: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Achievement "${achievement.title}" deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})