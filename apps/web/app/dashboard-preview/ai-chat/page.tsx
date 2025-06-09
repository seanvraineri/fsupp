"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Plus, Trash2, Paperclip, X, FileText, User, Bot, Loader2, Zap, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/app/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import useSWR, { mutate } from 'swr';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  isOptimistic?: boolean;
  isError?: boolean;
  file_name?: string;
  file_type?: string;
}

export default function AiChatPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    
    const convo = data?.conversation_id;
    const messageText = input;
    const tempId = `temp-${Date.now()}`;
    
    const optimisticUserMessage: Message = {
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
      let requestBody: any = {
        message: messageText,
      };
      if (convo) {
        requestBody.conversation_id = convo;
      }

      if (currentFile) {
        const base64File = await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(currentFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        
        if (base64File) {
          requestBody.filePayload = {
            name: currentFile.name,
            type: currentFile.type,
            content: (base64File as string).split(',')[1],
          };
        }
      }

      if (!requestBody.message && requestBody.filePayload) {
        requestBody.message = `Please analyze this file: ${requestBody.filePayload.name}`;
      }

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
      const errorMessage: Message = {
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

  const allMessages = [...(data?.messages || []), ...optimisticMessages];
  
  const quickPrompts = [
    { icon: Brain, text: "What's the best magnesium for sleep?", category: "Sleep" },
    { icon: Zap, text: "Can I take vitamin D with calcium?", category: "Interactions" },
    { icon: TrendingUp, text: "What supplements help with anxiety?", category: "Mood" },
    { icon: AlertCircle, text: "Review my current supplement stack", category: "Analysis" }
  ];

  const markdownComponents = {
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="leading-snug text-gray-800 dark:text-gray-200" {...props} />,
    a: ({node, ...props}: any) => <a className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
  };

  if (dataLoading && !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading AI Chat</h3>
            <p className="text-gray-600 dark:text-gray-400">Preparing your personalized supplement assistant...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {(isLoading || pendingAssistantMessage) && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  SupplementScribe AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your personalized supplement expert
                  {(isLoading || pendingAssistantMessage) && (
                    <span className="ml-2 text-purple-600 dark:text-purple-400 animate-pulse font-medium">
                      • Analyzing...
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startNewConversation}
                disabled={isLoading}
                className="flex items-center gap-2"
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
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div 
          ref={scrollViewportRef} 
          className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/50"
        >
          <div className="p-6 space-y-6">
            {allMessages.length === 0 && !pendingAssistantMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Welcome to SupplementScribe AI
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                  Get personalized supplement recommendations, interaction checks, and evidence-based guidance tailored to your health profile.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {quickPrompts.map((prompt, index) => (
                    <motion.div
                      key={prompt.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                        onClick={() => setInput(prompt.text)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <prompt.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="text-left">
                            <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full text-gray-600 dark:text-gray-400 mb-2">
                              {prompt.category}
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {prompt.text}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {allMessages.map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-end gap-4 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : msg.isError
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-bl-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                    } ${msg.isOptimistic ? 'opacity-70' : ''}`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                    
                    {msg.file_name && msg.role === 'user' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-400">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs">{msg.file_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}

              {pendingAssistantMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-4 justify-start"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Analyzing your request...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4"
        >
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {attachedFile.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
          
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-3"
          >
            <Button 
              variant="outline"
              size="icon"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.jpg,.jpeg,.png"
              className="hidden"
            />
            
            <div className="flex-grow relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about supplements, interactions, or health goals..."
                disabled={isLoading}
                className="pr-12 h-12 text-base"
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
                className="absolute right-1 top-1 h-10 w-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            AI recommendations are for educational purposes only. Always consult your healthcare provider.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 