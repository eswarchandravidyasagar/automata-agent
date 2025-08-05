'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from '@/components/model-selector';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Message, Conversation } from '@/types';
import { defaultConfig } from '@/lib/ai-config';
import { 
  UserIcon, 
  SparklesIcon, 
  DocumentDuplicateIcon, 
  ClockIcon,
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';

interface StreamingChatInterfaceProps {
  conversation?: Conversation;
  onNewConversation?: (conversation: Conversation) => void;
}

export function StreamingChatInterface({ conversation }: StreamingChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(conversation?.id);
  const [selectedModel, setSelectedModel] = useState(defaultConfig.model);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversation.id);
    }
  }, [conversation]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height based on content, with min and max limits
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 48), 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

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
    setStreamingMessage('');

    try {
      // Use the streaming endpoint
      const response = await fetch('/api/chat/stream', {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let conversationIdFromStream: string | undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'metadata') {
                  conversationIdFromStream = parsed.conversationId;
                } else if (parsed.type === 'content') {
                  setStreamingMessage(parsed.content);
                } else if (parsed.type === 'complete') {
                  // Add the complete message to the messages array
                  setMessages(prev => [...prev, parsed.message]);
                  setStreamingMessage('');
                  
                  // Update conversation ID if this was a new conversation
                  if (!currentConversationId && conversationIdFromStream) {
                    setCurrentConversationId(conversationIdFromStream);
                    
                    // Note: We could fetch conversation details here for sidebar updates,
                    // but it's not critical for chat functionality
                  }
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error);
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
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
      setStreamingMessage('');
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full animate-pulse [animation-delay:1s]"></div>
      </div>

      {/* Modern Header */}
      <div className="relative border-b border-white/20 bg-white/30 backdrop-blur-xl shadow-lg z-40">
        <div className="p-6 relative z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <span className="text-white text-2xl font-bold">AI</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    AI Agent Studio
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Powered by GitHub Models • Real-time AI Chat</p>
                </div>
              </div>
              
              <div className="h-12 w-px bg-gradient-to-b from-purple-300 to-pink-300"></div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">Active Model:</span>
                <div className="w-80 relative z-50">
                  <ModelSelector
                    currentModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-700">Online</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                <span className="text-sm font-bold text-gray-700">Free Tier</span>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 relative scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="text-center mt-20 relative">
            {/* Floating animation elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-ping"></div>
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl w-full h-full flex items-center justify-center shadow-2xl">
                  <span className="text-white text-4xl">🤖</span>
                </div>
              </div>
              
              <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to AI Agent Studio!
              </h2>
              <p className="text-xl text-gray-600 mb-12 font-medium max-w-4xl mx-auto leading-relaxed">
                Experience the power of multiple AI models in one beautiful interface. 
                Choose your model and start creating amazing conversations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                {[
                  { icon: '💡', title: 'Ask Anything', desc: 'Get intelligent answers from cutting-edge AI models', color: 'from-yellow-400 to-orange-500' },
                  { icon: '📝', title: 'Create Content', desc: 'Generate articles, stories, code, and creative content', color: 'from-green-400 to-emerald-500' },
                  { icon: '🔍', title: 'Deep Research', desc: 'Explore complex topics with detailed analysis', color: 'from-blue-400 to-cyan-500' },
                  { icon: '⚡', title: 'Multi-Model', desc: 'Switch between GPT, Llama, Phi, and Mistral models', color: 'from-purple-400 to-pink-500' }
                ].map((feature, index) => (
                  <div key={index} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                    <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { icon: '✅', text: 'All models verified', color: 'from-green-500 to-emerald-600' },
                  { icon: '🔄', text: 'Real-time streaming', color: 'from-blue-500 to-cyan-600' },
                  { icon: '🎨', text: 'Markdown support', color: 'from-purple-500 to-pink-600' },
                  { icon: '🆓', text: 'Free with GitHub', color: 'from-orange-500 to-red-600' }
                ].map((badge, index) => (
                  <div key={index} className={`px-4 py-2 bg-gradient-to-r ${badge.color} text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    {badge.icon} {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="group animate-in slide-in-from-bottom-2 duration-300">
                <div className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''} max-w-none`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-300/30' 
                      : 'bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-purple-300/30'
                  }`}>
                    {message.role === 'user' ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <SparklesIcon className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`relative rounded-2xl px-6 py-4 transition-all duration-300 hover:shadow-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border border-blue-400/30 backdrop-blur-sm'
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl text-gray-900 hover:bg-white'
                    }`}>
                      {/* Glassmorphism glow effect */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-400/30 to-blue-600/30' 
                          : 'bg-gradient-to-br from-white/30 to-purple-100/20'
                      }`}></div>
                      
                      <div className="relative">
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
                        ) : (
                          <MarkdownRenderer 
                            content={message.content}
                            className="text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_pre]:bg-gray-100/80 [&_pre]:backdrop-blur-sm [&_code]:bg-gray-100/60 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-md [&_code]:border [&_code]:border-gray-200/50"
                          />
                        )}
                      </div>
                      
                      {/* Copy button for assistant messages */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-gray-100/80 bg-gray-50/80 backdrop-blur-sm shadow-sm border border-gray-200/50"
                          title="Copy message"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4 text-gray-700" />
                        </button>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-xs text-gray-500/80 mt-2 px-3 flex items-center gap-1 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <ClockIcon className="w-3 h-3" />
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {(isLoading || streamingMessage) && (
              <div className="group animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-4">
                  {/* AI Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-lg border-2 border-purple-300/30 backdrop-blur-sm">
                    <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
                  </div>

                  {/* Streaming Content */}
                  <div className="flex-1">
                    <div className="relative rounded-2xl px-6 py-4 bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:bg-white transition-all duration-300">
                      {/* Glassmorphism glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-accent-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                      
                      <div className="relative">
                        {streamingMessage ? (
                          <div className="relative">
                            <MarkdownRenderer 
                              content={streamingMessage}
                              className="text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_pre]:bg-gray-100/80 [&_pre]:backdrop-blur-sm [&_code]:bg-gray-100/60 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-md [&_code]:border [&_code]:border-gray-200/50"
                            />
                            {/* Enhanced typing cursor */}
                            <span className="inline-block w-0.5 h-5 bg-purple-500 ml-1 animate-pulse shadow-sm"></span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="text-gray-800 font-medium">AI is thinking</div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce shadow-sm"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s] shadow-sm"></div>
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-sm"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Streaming indicator */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-75 shadow-lg"></div>
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="backdrop-blur-xl bg-white/80 border-t border-white/30 p-6 shadow-lg">
        <div className="w-full">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="w-full resize-none rounded-2xl bg-white/90 backdrop-blur-xl border-2 border-gray-200/50 px-6 py-4 pr-16 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 min-h-[56px] max-h-[120px] shadow-xl hover:bg-white hover:border-gray-300/50"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-4 bottom-3 flex items-center gap-2">
                {input.length > 0 && (
                  <span className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200/50 shadow-sm">
                    {input.length} chars
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-2xl px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 min-h-[56px] border border-blue-400/30 backdrop-blur-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Send</span>
                </div>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs font-mono border border-gray-200/50 shadow-sm">Enter</kbd>
                <span>to send</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs font-mono border border-gray-200/50 shadow-sm">Shift</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs font-mono border border-gray-200/50 shadow-sm">Enter</kbd>
                <span>for new line</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span>Current model:</span>
              <span className="font-semibold text-gray-900 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm">
                {selectedModel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
