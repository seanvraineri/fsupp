"use client";

import { motion } from 'framer-motion';

const starters = [
  "Sleep supplements?",
  "Vitamin D dosage?",
  "Drug interactions?",
  "Energy & focus?",
  "B12 deficiency signs?",
  "Best time for magnesium?"
];

type QuickPromptBarProps = {
  onPromptClick: (prompt: string) => void;
};

export default function QuickPromptBar({ onPromptClick }: QuickPromptBarProps) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-3 text-center">Quick topics:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {starters.map((prompt, index) => (
          <motion.button
            key={prompt}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            onClick={() => onPromptClick(prompt)}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
} 