import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/forum/categories/[id] - Get specific category
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: category, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/forum/categories/[id] - Update category
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      name,
      description,
      color,
      icon,
      is_active,
      sort_order
    } = body

    // Check if category exists
    const { data: existingCategory, error: categoryError } = await supabase
      .from('forum_categories')
      .select('id, name')
      .eq('id', params.id)
      .single()

    if (categoryError || !existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Update name and slug if name changed
    if (name && name !== existingCategory.name) {
      updateData.name = name
      // Generate new slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug conflicts with existing categories
      const { data: slugConflict } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single()

      if (slugConflict) {
        updateData.slug = `${slug}-${Date.now()}`
      } else {
        updateData.slug = slug
      }
    }

    if (description !== undefined) updateData.description = description
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon
    if (is_active !== undefined) updateData.is_active = is_active
    if (sort_order !== undefined) updateData.sort_order = sort_order

    const { data, error } = await supabase
      .from('forum_categories')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json(
        { error: `Failed to update category: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Category updated successfully',
      category: data
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/forum/categories/[id] - Delete category
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from('forum_categories')
      .select('id, name')
      .eq('id', params.id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has topics
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id')
      .eq('category_id', params.id)
      .limit(1)

    if (topicsError) {
      console.error('Error checking topics:', topicsError)
    }

    if (topics && topics.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has topics. Please delete or move topics first, or deactivate the category instead.' },
        { status: 400 }
      )
    }

    // Delete category
    const { error } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json(
        { error: `Failed to delete category: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Category "${category.name}" deleted successfully`
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

