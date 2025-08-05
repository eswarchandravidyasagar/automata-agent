import { NextRequest, NextResponse } from 'next/server';
import { defaultConfig } from '@/lib/ai-config';
import { callGitHubModel, githubModels } from '@/lib/github-models';
import { conversationDb } from '@/lib/database';
import { ChatRequest, ChatResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationId, config } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required', success: false },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await conversationDb.findById(conversationId);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found', success: false },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      conversation = await conversationDb.create({
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
        userId: 1, // Default user for demo
      });
    }

    // Add user message to conversation
    await conversationDb.addMessage(conversation.id, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Prepare AI configuration
    const aiConfig = {
      ...defaultConfig,
      ...config,
    };

    // Get the GitHub Models model name
    const modelName = githubModels[aiConfig.model as keyof typeof githubModels] || githubModels['gpt-4o-mini'];

    // Build conversation history for context
    const conversationHistory = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Generate AI response using GitHub Models
    const aiResponseText = await callGitHubModel(
      modelName,
      [
        {
          role: 'system',
          content: aiConfig.systemPrompt,
        },
        ...conversationHistory,
      ],
      {
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
      }
    );

    // Add AI response to conversation
    const aiMessage = await conversationDb.addMessage(conversation.id, {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date(),
    });

    if (!aiMessage) {
      throw new Error('Failed to save AI response');
    }

    const response: ChatResponse = {
      message: aiMessage,
      conversationId: conversation.id,
      usage: {
        promptTokens: 0, // GitHub Models doesn't return usage info in our simplified implementation
        completionTokens: 0,
        totalTokens: 0,
      },
    };

    return NextResponse.json({
      data: response,
      success: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific AI SDK errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please check API keys.', success: false },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.', success: false },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process chat message', success: false },
      { status: 500 }
    );
  }
}
