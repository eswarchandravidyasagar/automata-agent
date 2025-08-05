'use client';

import { useState } from 'react';
import { StreamingChatInterface } from '@/components/streaming-chat-interface';
import { ConversationSidebar } from '@/components/conversation-sidebar';
import { Conversation } from '@/types';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>();

  const handleNewConversation = () => {
    setSelectedConversation(undefined);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversationCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 border-r">
        <ConversationSidebar
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <StreamingChatInterface
          conversation={selectedConversation}
          onNewConversation={handleNewConversationCreated}
        />
      </div>
    </div>
  );
} 