import { NextRequest, NextResponse } from 'next/server';
import { conversationDb } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    const conversations = await conversationDb.findAll(
      userId ? parseInt(userId) : undefined
    );
    
    return NextResponse.json({ 
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
      })),
      success: true 
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, userId } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required', success: false },
        { status: 400 }
      );
    }

    const conversation = await conversationDb.create({
      title: title.trim(),
      messages: [],
      userId: userId || 1, // Default user for demo
    });

    return NextResponse.json({ 
      conversation, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation', success: false },
      { status: 500 }
    );
  }
}
