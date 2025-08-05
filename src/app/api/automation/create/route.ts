import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';

export async function POST(request: NextRequest) {
  const { url, goal } = await request.json();

  if (!url || !goal) {
    return NextResponse.json({ error: 'URL and goal are required' }, { status: 400 });
  }

  let agent: AgentService | null = null;
  let streamClosed = false;

  const readableStream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        if (streamClosed) return; // Don't send if client has disconnected
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          console.error('Error sending event (stream might have been closed):', e);
        }
      };

      agent = new AgentService(goal, sendEvent);
      
      try {
        await agent.run(url);
        sendEvent({ type: 'thought', content: 'Automation finished.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        sendEvent({ type: 'error', error: `Failed to process automation: ${message}` });
      } finally {
        if (!streamClosed) {
          await agent.close();
          controller.close();
        }
      }
    },
    async cancel(reason) {
      console.log('Stream cancelled by client.', reason);
      streamClosed = true;
      if (agent) {
        await agent.close();
      }
    }
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
