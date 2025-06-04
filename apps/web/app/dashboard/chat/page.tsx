"use client";

import { useState, useRef, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, Sparkles, Trash2, Send, User, Bot, Paperclip, X, FileText } from 'lucide-react';
import DashboardShell from '../../components/DashboardShell';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, isLoading: dataLoading } = useSWR('/api/chat/messages', fetcher);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages, optimisticMessages, pendingAssistantMessage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only allow PDF, TXT, and image files
      const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.type)) {
        setAttachedFile(file);
      } else {
        alert('Please upload a PDF, TXT, or image file');
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
    
    // Handle file upload if present
    let fileInfo = null;
    if (attachedFile) {
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(attachedFile);
      });
      
      fileInfo = {
        name: attachedFile.name,
        type: attachedFile.type,
        size: attachedFile.size,
        content: fileContent
      };
    }
    
    // Add optimistic user message
    const optimisticUserMessage = {
      id: tempId,
      role: 'user',
      content: messageText || `[Uploaded file: ${attachedFile?.name}]`,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      file: fileInfo
    };
    
    setOptimisticMessages(prev => [...prev, optimisticUserMessage]);
    setInput('');
    removeFile();
    setIsLoading(true);
    setPendingAssistantMessage(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText || `Please analyze this file: ${attachedFile?.name}`, 
          conversation_id: convo,
          file: fileInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Clear optimistic messages and refresh
      setOptimisticMessages([]);
      setPendingAssistantMessage(false);
      await mutate('/api/chat/messages');
      
    } catch (error) {
      console.error('Error sending message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setPendingAssistantMessage(false);
      setInput(messageText);
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
        isError: true
      };
      setOptimisticMessages(prev => [...prev, errorMessage]);
      
      setTimeout(() => {
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== errorMessage.id));
      }, 3000);
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
      await mutate('/api/chat/messages', { messages: [], conversation_id: null }, false);
      setInput('');
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const clearConversation = async () => {
    if (!data?.conversation_id) return;
    
    try {
      await fetch(`/api/chat/clear?conversation_id=${data.conversation_id}`, {
        method: 'DELETE',
      });
      
      setOptimisticMessages([]);
      setPendingAssistantMessage(false);
      setIsLoading(false);
      removeFile();
      await mutate('/api/chat/messages');
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  // Format message content with proper links and formatting
  const formatMessageContent = (content: string) => {
    // Convert PMID references to links and basic sanitization helpers
    content = content.replace(/PMID:\s*(\d+)/gi, '<a href="https://pubmed.ncbi.nlm.nih.gov/$1" target="_blank" rel="noopener" class="text-blue-500 hover:text-blue-600 underline">PMID: $1</a>');
    // Convert dosage frequency notation "x N" to "× N/day"
    content = content.replace(/\s+x\s+(\d+)\b/g, ' × $1/day');
    
    // Convert markdown-style formatting
    content = content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n## (.+)/g, '\n<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/\n### (.+)/g, '\n<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n\d+\. /g, '\n• ')
      .replace(/\n/g, '<br>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-500 hover:text-blue-600 underline">$1</a>');
    
    return content;
  };

  // Combine all messages
  const allMessages = [...(data?.messages || []), ...optimisticMessages];

  const sanitizeMarkdown = (md: string) => DOMPurify.sanitize(md, { ADD_ATTR: ['target', 'rel', 'class'] });

  const quickPrompts = [
    "What's the best magnesium for sleep?",
    "Can I take vitamin D with calcium?",
    "What supplements help with anxiety?",
    "Review my current supplement stack"
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">SupplementScribe AI</h1>
                  <p className="text-xs text-gray-500">
                    Personalized supplement guidance
                    {isLoading && <span className="ml-2 text-purple-500">• Thinking...</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewConversation}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Chat
                </button>
                
                {allMessages.length > 0 && (
                  <button
                    onClick={clearConversation}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
          <div className="px-4 py-4">
            {dataLoading && allMessages.length === 0 && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                  Loading conversation...
                </div>
              </div>
            )}
            
            {allMessages.length === 0 && !dataLoading && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm">
                  Get personalized supplement recommendations based on your health profile. Upload lab results or health documents for deeper analysis.
                </p>
                
                {/* Quick prompts */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Evidence-based</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">PMID citations</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Personalized</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">Product links</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 max-w-3xl mx-auto">
              {allMessages.map((message: any) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {message.file && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-white/20 dark:bg-black/20 rounded-lg">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{message.file.name}</span>
                        </div>
                      )}
                      <div className={`prose prose-sm ${message.role === 'user' ? 'prose-invert' : 'dark:prose-invert'} max-w-none`}>
                        {message.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline" />
                            }}
                          >
                            {sanitizeMarkdown(formatMessageContent(message.content))}
                          </ReactMarkdown>
                        ) : (
                          <span className="opacity-50">Thinking...</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 px-2">
                      {new Date(message.created_at || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center order-2">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              ))}

              {pendingAssistantMessage && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-4">
            <div className="max-w-3xl mx-auto">
              {attachedFile && (
                <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{attachedFile.name}</span>
                  <button
                    onClick={removeFile}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about supplements, interactions, or health goals..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-24 bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  <button
                    aria-label="Attach file"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 flex items-center justify-center"
                  >
                    <span className="sr-only">Attach file</span>
                    <Paperclip className="w-4 h-4" />
                  </button>
                  
                  <button
                    aria-label="Send message"
                    type="submit"
                    disabled={(!input.trim() && !attachedFile) || isLoading}
                    className="w-8 h-8 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                AI recommendations are for educational purposes only. Always consult your healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 