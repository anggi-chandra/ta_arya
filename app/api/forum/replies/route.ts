import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseClient } from '@/lib/auth';

// POST /api/forum/replies - Create a new forum reply
export async function POST(req: NextRequest) {
  try {
    // Get user from NextAuth session
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, topic_id } = body;

    // Validate required fields
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!topic_id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Get Supabase client (service role key bypasses RLS)
    const supabase = getSupabaseClient();
    
    // Verify topic exists and get category_id for validation
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select('id, is_locked, category_id')
      .eq('id', topic_id)
      .single();

    if (topicError || !topic) {
      console.error('Error fetching topic:', topicError);
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Check if topic is locked
    if (topic.is_locked) {
      return NextResponse.json(
        { error: 'This topic is locked and cannot receive new replies' },
        { status: 403 }
      );
    }

    // Verify user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', token.sub)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay for new users
      console.error('Error checking profile:', profileError);
    }

    // Create reply
    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .insert({
        content: content.trim(),
        topic_id,
        author_id: token.sub
      })
      .select()
      .single();

    if (replyError) {
      console.error('Error creating forum reply:', replyError);
      console.error('Reply error details:', {
        message: replyError.message,
        code: replyError.code,
        details: replyError.details,
        hint: replyError.hint
      });
      return NextResponse.json(
        { error: `Failed to create reply: ${replyError.message}` },
        { status: 400 }
      );
    }

    console.log('Reply created successfully:', reply);
    console.log('Reply ID:', reply?.id);
    console.log('Reply topic_id:', reply?.topic_id);
    console.log('Reply author_id:', reply?.author_id);

    // Verify the reply was created by fetching it back
    const { data: verifyReply, error: verifyError } = await supabase
      .from('forum_replies')
      .select('id, content, topic_id, author_id, created_at')
      .eq('id', reply.id)
      .single();

    if (verifyError) {
      console.error('Error verifying reply:', verifyError);
    } else {
      console.log('Reply verified:', verifyReply);
    }

    return NextResponse.json({
      message: 'Reply created successfully',
      reply: verifyReply || reply
    });
  } catch (error: any) {
    console.error('Error in create forum reply API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

