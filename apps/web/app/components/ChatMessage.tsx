"use client";

import { User, Bot, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';

type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
  isLoading?: boolean;
};

const TypingLoader = () => (
  <div className="flex space-x-1 items-center p-3">
    <Circle className="w-2 h-2 fill-current animate-pulse" />
    <Circle className="w-2 h-2 fill-current animate-pulse" style={{ animationDelay: '0.2s' }} />
    <Circle className="w-2 h-2 fill-current animate-pulse" style={{ animationDelay: '0.4s' }} />
  </div>
);

export default function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      {/* Message bubble */}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'bg-white/60 dark:bg-white/10 border border-border text-foreground'
      }`}>
        {isLoading ? (
          <TypingLoader />
        ) : (
          <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom styling for markdown elements
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                code: ({ children, className, ...props }) => {
                  const isInline = !className?.includes('language-');
                  return isInline ? (
                    <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-black/5 dark:bg-white/5 p-3 rounded-md text-sm font-mono overflow-x-auto" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-current/20 pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
} 