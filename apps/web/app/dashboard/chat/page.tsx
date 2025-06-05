"use client";

import { useState, useRef, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, Sparkles, Trash2, Send, User, Bot, Paperclip, X, FileText, MessageSquare, Loader2 } from 'lucide-react';
import DashboardShell from '../../components/DashboardShell';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

// Helper for conditional class names (simplified replacement for cn)
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const fileInputActualRef = useRef<HTMLInputElement>(null);

  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, isLoading: dataLoading, error: dataError } = useSWR('/api/chat/messages', fetcher);

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [data?.messages, optimisticMessages, pendingAssistantMessage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.type)) {
        setAttachedFile(file);
      } else {
        alert('Please upload a PDF, TXT, or image file');
        if (fileInputActualRef.current) fileInputActualRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputActualRef.current) {
      fileInputActualRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    
    const convo = data?.conversation_id;
    const messageText = input;
    const tempId = `temp-${Date.now()}`;
    
    const optimisticUserMessage = {
      id: tempId,
      role: 'user',
      content: messageText || `File: ${attachedFile?.name}`,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      file_name: attachedFile?.name,
      file_type: attachedFile?.type,
    };
    
    setOptimisticMessages(prev => [...prev, optimisticUserMessage]);
    setInput('');
    const currentFile = attachedFile;
    removeFile();
    setIsLoading(true);
    setPendingAssistantMessage(true);

    try {
      const formData = new FormData();
      formData.append('message', messageText || `Please analyze this file: ${currentFile?.name}`);
      if (convo) formData.append('conversation_id', convo);
      if (currentFile) formData.append('file', currentFile);

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to send message' }));
        throw new Error(errorData.detail || 'Failed to send message');
      }

      await response.json();
      
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setPendingAssistantMessage(false);
      await mutate('/api/chat/messages');
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setPendingAssistantMessage(false);
      setInput(messageText);
      if (currentFile) setAttachedFile(currentFile);
      
      const errorMessageContent = error.message || 'Sorry, I encountered an error. Please try again.';
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorMessageContent,
        created_at: new Date().toISOString(),
        isError: true
      };
      setOptimisticMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = async () => {
    try {
      setOptimisticMessages([]);
      setPendingAssistantMessage(false);
      setIsLoading(false);
      removeFile();
      setInput('');
      await mutate('/api/chat/messages', { messages: [], conversation_id: null }, true);
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const clearConversation = async () => {
    if (!data?.conversation_id && allMessages.length === 0) return;
    
    try {
      if (data?.conversation_id) {
        await fetch(`/api/chat/clear?conversation_id=${data.conversation_id}`, {
          method: 'DELETE',
        });
      }
      setOptimisticMessages([]);
      setPendingAssistantMessage(false);
      setIsLoading(false);
      removeFile();
      setInput('');
      await mutate('/api/chat/messages', { messages: [], conversation_id: data?.conversation_id }, true);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const preProcessForMarkdown = (content: string): string => {
    let processedContent = content;
    // Keep specific pre-processing for things ReactMarkdown won't naturally handle or needs help with
    // Example: Custom PMID link format if AI doesn't output standard Markdown links for them
    processedContent = processedContent.replace(/PMID:\s*(\d+)/gi, '<a href="https://pubmed.ncbi.nlm.nih.gov/$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">PMID: $1</a>');
    // Example: Custom dosage notation (this might be better handled by AI outputting actual multiplication symbol)
    // processedContent = processedContent.replace(/\s+x\s+(\d+)\b/g, ' × $1/day');
    return processedContent;
  };

  const allMessages = [...(data?.messages || []), ...optimisticMessages];
  
  const quickPrompts = [
    "What's the best magnesium for sleep?",
    "Can I take vitamin D with calcium?",
    "What supplements help with anxiety?",
    "Review my current supplement stack"
  ];

  // Custom components for ReactMarkdown
  const markdownComponents = {
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="leading-snug" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    // strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
    // em: ({node, ...props}) => <em className="italic" {...props} />,
    // del: ({node, ...props}) => <del className="line-through" {...props} />,
  };

  if (dataLoading && !data) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Loading chat...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-shrink-0 border-b bg-background shadow-sm">
          <div className="px-4 md:px-6 py-3 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">SupplementScribe AI</h1>
                <p className="text-xs text-muted-foreground">
                  Personalized supplement guidance
                  {(isLoading || pendingAssistantMessage) && <span className="ml-2 text-purple-500 animate-pulse"> Typing...</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startNewConversation}
                disabled={isLoading}
                className="hidden sm:flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
              {allMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-destructive flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div ref={scrollViewportRef} className="flex-grow overflow-y-auto bg-muted/10">
          <div className="px-4 md:px-6 py-6 space-y-4">
            {allMessages.length === 0 && !pendingAssistantMessage && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Start a Conversation</h2>
                <p className="text-muted-foreground mb-6">How can SupplementScribe AI help you today?</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {quickPrompts.map(prompt => (
                    <Button 
                      key={prompt} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {setInput(prompt); /* Consider calling sendMessage here or letting user hit send */}}
                      className="bg-background hover:bg-muted text-sm"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {allMessages.map((msg, index) => {
              const processedContent = msg.role === 'assistant' && msg.content ? preProcessForMarkdown(msg.content) : msg.content;
              const sanitizedHtml = msg.role === 'assistant' && processedContent && !msg.isError ? DOMPurify.sanitize(processedContent) : null;
              const markdownToRender = msg.isError ? msg.content : (processedContent || '');

              return (
                <div
                  key={msg.id || index}
                  className={cn(
                    "flex items-end gap-2.5 w-full", // Reduced gap slightly
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3.5 rounded-lg max-w-[75%] shadow-md text-sm leading-relaxed prose prose-sm dark:prose-invert", // Added prose for markdown styling
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-background text-foreground rounded-bl-none border border-border", // Added border for AI bubble
                      msg.isOptimistic && "opacity-80",
                      msg.isError && "bg-destructive text-destructive-foreground prose-p:text-destructive-foreground prose-strong:text-destructive-foreground"
                    )}
                  >
                    {msg.content || msg.file_name ? (
                       <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]} // CAUTION: Ensure AI output is trusted or further sanitized if it can inject script tags etc.
                          components={markdownComponents}
                          children={markdownToRender}
                        />
                    ) : null}
                    {msg.file_name && msg.role === 'user' && !msg.content && (
                      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-primary-foreground/30">
                        <FileText className="w-4 h-4 text-primary-foreground/80" /> 
                        <span>{msg.file_name}</span>
                      </div>
                    )}
                     {msg.isError && !msg.content && <p className='text-xs mt-1 opacity-90'>An error occurred.</p>} {/* Fallback for error with no content */}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border shadow-md">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
            {pendingAssistantMessage && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="p-3.5 rounded-lg bg-background text-foreground rounded-bl-none border border-border shadow-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex-shrink-0 border-t bg-background p-3 md:p-4">
          {attachedFile && (
            <div className="mb-2 px-3 py-2 text-sm bg-muted rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{attachedFile.name}</span> 
                <span className="text-muted-foreground">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} className="w-6 h-6 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2 md:gap-3"
          >
            <Button 
              variant="outline"
              size="icon"
              type="button"
              onClick={() => fileInputActualRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <input
              ref={fileInputActualRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.jpg,.jpeg,.png"
              className="hidden"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about supplements, interactions, or health goals..."
              disabled={isLoading}
              className="flex-grow h-10 md:h-11 text-sm md:text-base focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 bg-primary hover:bg-primary/90"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            AI recommendations are for educational purposes only. Always consult your healthcare provider.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
} 
