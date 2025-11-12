import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/blog/[slug] - Get single blog post by slug (public)
// This is a public endpoint, so we use service role key to bypass RLS
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Use service role key for public access (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { slug } = params

  try {
    console.log(`Fetching blog post with slug: ${slug}`)

    // Fetch content first without relationship
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published') // Only published content
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      if (error.code === 'PGRST116') {
        // Not found - no rows returned
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch blog post', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    if (!content) {
      console.log(`No content found for slug: ${slug}`)
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    console.log(`Found content: ${content.title} (status: ${content.status})`)

    // Fetch author separately if author_id exists
    let author = null
    if (content.author_id) {
      try {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .eq('id', content.author_id)
          .single()
        
        if (authorError) {
          console.error(`Error fetching author for content ${content.id}:`, authorError)
        } else {
          author = authorData
        }
      } catch (err) {
        console.error(`Error fetching author for content ${content.id}:`, err)
      }
    }

    // Return content with author
    const blogPost = {
      id: content.id,
      title: content.title,
      slug: content.slug,
      content: content.content,
      excerpt: content.excerpt,
      featured_image: content.featured_image,
      type: content.type,
      status: content.status,
      published_at: content.published_at,
      created_at: content.created_at,
      updated_at: content.updated_at,
      author: author
    }

    return NextResponse.json({ content: blogPost })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

