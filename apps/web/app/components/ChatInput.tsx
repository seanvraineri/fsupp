"use client";

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
};

export default function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Max 4 rows
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) {
        // CMD/CTRL + Enter sends
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSubmit();
        }
      } else if (!e.shiftKey) {
        // Plain Enter sends (unless Shift is held for new line)
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSubmit();
        }
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Handle file upload (bloodwork PDFs, etc.)
      console.log('File selected:', file.name);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="fixed bottom-0 right-0 md:left-64 left-0 bg-background z-30 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-4xl mx-auto p-4">
        <div className="relative flex items-center gap-3 bg-white/70 dark:bg-white/10 backdrop-blur rounded-full pl-4 pr-3 py-2 w-full max-w-3xl mx-auto shadow-md border border-border">
          {/* File upload button */}
          <button
            type="button"
            onClick={handleFileClick}
            className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/30"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help?"
            className="flex-1 resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />

          {/* Send button */}
          <motion.button
            type="button"
            onClick={() => {
              if (value.trim() && !isLoading) {
                onSubmit();
              }
            }}
            disabled={!value.trim() || isLoading}
            className="flex-shrink-0 p-1.5 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Helper text */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
} 