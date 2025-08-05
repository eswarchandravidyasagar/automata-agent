import { NextRequest } from 'next/server';
import { defaultConfig } from '@/lib/ai-config';
import { callGitHubModelStream, githubModels } from '@/lib/github-models';
import { conversationDb } from '@/lib/database';
import { ChatRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationId, config } = body;

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required', success: false }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await conversationDb.findById(conversationId);
      if (!conversation) {
        return new Response(
          JSON.stringify({ error: 'Conversation not found', success: false }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
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

    // Create a readable stream for server-sent events
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            conversationId: conversation.id,
            model: aiConfig.model,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // For now, we'll simulate streaming since GitHub Models doesn't provide streaming in our current implementation
          // In a real implementation, you'd call a streaming version of the GitHub Models API
          
          // Get the full response first
          const aiResponseText = await callGitHubModelStream(
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

          fullResponse = aiResponseText;

          // Simulate streaming by sending words with delays
          const words = aiResponseText.split(' ');
          let currentText = '';

          for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            
            const chunk = {
              type: 'content',
              content: currentText,
              delta: words[i] + (i < words.length - 1 ? ' ' : ''),
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Save the complete message to the database
          const aiMessage = await conversationDb.addMessage(conversation.id, {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
          });

          // Send completion message
          const completion = {
            type: 'complete',
            message: aiMessage,
            conversationId: conversation.id,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`));
          
          // End the stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred', 
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
