import { NextRequest, NextResponse } from 'next/server';
import { conversationDb } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const conversation = await conversationDb.findById(id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      conversation, 
      success: true 
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const success = await conversationDb.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Conversation not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation', success: false },
      { status: 500 }
    );
  }
}
