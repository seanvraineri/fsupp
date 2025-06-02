"use client";

import { useState, useRef, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import DashboardShell from '../../components/DashboardShell';
import ChatMessage from '../../components/ChatMessage';
import QuickPromptBar from '../../components/QuickPromptBar';
import ChatInput from '../../components/ChatInput';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, isLoading: dataLoading } = useSWR('/api/chat/messages', fetcher);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [data?.messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const convo = data?.conversation_id;
    const messageText = input;
    setInput('');
    setIsLoading(true);

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, conversation_id: convo }),
      });
      
      // Refresh messages
      await mutate('/api/chat/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore input on error
      setInput(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col h-full max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 text-center">
          <h1 className="text-3xl font-semibold mb-2">AI Health Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about your supplement plan, health data, or general wellness topics.
          </p>
        </div>

        {/* Quick prompts */}
        <div className="flex-shrink-0">
          <QuickPromptBar onPromptClick={handlePromptClick} />
        </div>

        {/* Messages area with fixed height and scroll */}
        <div className="flex-1 min-h-0 mb-4">
          <ScrollArea.Root className="h-full">
            <ScrollArea.Viewport ref={scrollViewportRef} className="h-full w-full">
              <div className="space-y-6 p-4">
                {dataLoading && (
                  <div className="flex justify-center">
                    <div className="text-muted-foreground">Loading conversation...</div>
                  </div>
                )}
                
                {data?.messages?.length === 0 && !dataLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.7-.4l-3.675 1.225a.5.5 0 01-.637-.637L7.213 17.5A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-muted-foreground max-w-md">
                      Ask me anything about your supplement plan, drug interactions, dosage timing, or health questions.
                    </p>
                  </div>
                )}

                {data?.messages?.map((message: any) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}

                {/* Show loading message when sending */}
                {isLoading && (
                  <ChatMessage
                    role="assistant"
                    content=""
                    isLoading={true}
                  />
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar 
              className="flex select-none touch-none p-0.5 bg-muted transition-colors duration-[160ms] ease-out hover:bg-muted/80 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-border rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>

        {/* Bottom padding for fixed input */}
        <div className="h-40 flex-shrink-0" />
      </div>

      {/* Fixed input at bottom */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={sendMessage}
        isLoading={isLoading}
      />
    </DashboardShell>
  );
} 