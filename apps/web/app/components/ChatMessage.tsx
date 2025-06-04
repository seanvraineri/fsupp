"use client";

import { User, Sparkles, Circle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';

type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
  isLoading?: boolean;
  timestamp?: string;
  id?: string;
};

const TypingLoader = () => (
  <div className="flex space-x-1 items-center p-3">
    <motion.div
      className="w-2 h-2 bg-purple-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-purple-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-purple-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
    />
    <span className="ml-2 text-sm text-gray-500">SupplementScribe is thinking...</span>
  </div>
);

// Skip very short messages that look like test messages
const isTestMessage = (content: string) => {
  const trimmed = content.trim().toLowerCase();
  return trimmed.length <= 3 || 
         trimmed === 'hi' || 
         trimmed === 'hello' || 
         trimmed === 'test' ||
         trimmed.startsWith('hello! how can i assist you today?');
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins < 1 ? 'just now' : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function ChatMessage({ role, content, isLoading, timestamp, id }: ChatMessageProps) {
  const isUser = role === "user";
  
  // Skip rendering test messages
  if (!isLoading && isTestMessage(content)) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 max-w-full ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
          : 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>
      
      {/* Message content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender label */}
        <div className={`text-xs font-medium mb-1 ${
          isUser ? 'text-right text-blue-600' : 'text-left text-purple-600'
        }`}>
          {isUser ? 'You' : 'SupplementScribe'}
        </div>
        
        {/* Message bubble */}
        <div className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
          {isLoading ? (
            <TypingLoader />
          ) : (
            <div className={`prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
              isUser ? 'prose-invert' : 'dark:prose-invert'
            }`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom styling for markdown elements
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  code: ({ children, className, ...props }) => {
                    const isInline = !className?.includes('language-');
                    return isInline ? (
                      <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                        isUser 
                          ? 'bg-blue-400/30 text-blue-100' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`} {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm font-mono overflow-x-auto" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 pl-4 italic my-2 ${
                      isUser 
                        ? 'border-blue-300 text-blue-100' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {children}
                    </blockquote>
                  ),
                  // Improve link styling
                  a: ({ children, href, ...props }) => (
                    <a 
                      href={href} 
                      className={`underline hover:no-underline transition-all ${
                        isUser 
                          ? 'text-blue-100 hover:text-white' 
                          : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                      }`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {timestamp && !isLoading && (
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(timestamp)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
} 
