'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from '@/components/model-selector';
import { Message, Conversation } from '@/types';
import { defaultConfig } from '@/lib/ai-config';

interface ChatInterfaceProps {
  conversation?: Conversation;
  onNewConversation?: (conversation: Conversation) => void;
}

export function ChatInterface({ conversation, onNewConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversation?.id);
  const [selectedModel, setSelectedModel] = useState(defaultConfig.model);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversation.id);
    }
  }, [conversation]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversationId,
          config: {
            model: selectedModel,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      const { message: aiMessage, conversationId } = data.data;
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation ID if this was a new conversation
      if (!currentConversationId && conversationId) {
        setCurrentConversationId(conversationId);
        
        // Fetch the full conversation to get the title
        if (onNewConversation) {
          try {
            const convResponse = await fetch(`/api/conversations/${conversationId}`);
            const convData = await convResponse.json();
            if (convData.success) {
              onNewConversation(convData.conversation);
            }
          } catch (error) {
            console.error('Failed to fetch conversation details:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Model Selector Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Model:</span>
            <div className="w-64">
              <ModelSelector
                currentModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Powered by GitHub Models
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Welcome to AI Agent!</p>
            <p>Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Thinking...</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
