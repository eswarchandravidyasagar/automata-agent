'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types';

interface ConversationSidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Array<Conversation & { messageCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = async (conversationSummary: Conversation & { messageCount: number }) => {
    try {
      // Fetch the full conversation with messages
      const response = await fetch(`/api/conversations/${conversationSummary.id}`);
      const data = await response.json();
      
      if (data.success) {
        onSelectConversation(data.conversation);
      }
    } catch (error) {
      console.error('Failed to fetch conversation details:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-80 border-r bg-gray-50 p-4">
        <div className="animate-pulse">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <Button 
          onClick={onNewConversation}
          className="w-full"
        >
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-100 border-blue-300 border'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-sm truncate">
                  {conversation.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {conversation.messageCount} messages
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
