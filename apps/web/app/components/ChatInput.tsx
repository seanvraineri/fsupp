"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading,
  placeholder = "Ask about supplements, interactions, or health goals..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [rows, setRows] = useState(1);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), 1), 6);
      setRows(newRows);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50">
      {/* Container that matches the chat content padding exactly */}
      <div className="px-4 py-4">
        {/* Status indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-3 text-sm text-purple-600 dark:text-purple-400"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>SupplementScribe is analyzing your question and finding products...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative">
          <div className={`relative flex items-end bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 ${
            isFocused 
              ? 'border-purple-300 dark:border-purple-600 shadow-purple-100 dark:shadow-purple-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}>
            
            {/* Input area */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={isLoading}
                rows={rows}
                className={`w-full px-4 py-3 pr-12 bg-transparent resize-none outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 transition-all ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  minHeight: '3rem',
                  maxHeight: '8rem',
                  lineHeight: '1.5rem'
                }}
              />
              
              {/* Character count for longer messages */}
              {value.length > 200 && (
                <div className={`absolute bottom-1 right-14 text-xs ${
                  value.length > 1000 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {value.length}/1000
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex-shrink-0 p-2">
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.05 } : {}}
                whileTap={canSubmit ? { scale: 0.95 } : {}}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  canSubmit
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Tips */}
          <AnimatePresence>
            {isFocused && !isLoading && value.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2 mt-3"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">💡 Tips:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                    Press Enter to send
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                    Include your health goals
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                    Mention current supplements
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
} 