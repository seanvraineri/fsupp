"use client";

import { motion } from 'framer-motion';

const starters = [
  "Summarize my plan",
  "Is magnesium safe?", 
  "What does my MTHFR mean?",
  "Explain my supplement interactions",
  "How should I time my supplements?",
  "What are the side effects?"
];

type QuickPromptBarProps = {
  onPromptClick: (prompt: string) => void;
};

export default function QuickPromptBar({ onPromptClick }: QuickPromptBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      {starters.map((prompt, index) => (
        <motion.button
          key={prompt}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.25 }}
          onClick={() => onPromptClick(prompt)}
          className="px-4 py-1.5 text-sm font-medium bg-white/60 dark:bg-white/10 border border-border rounded-full shadow-sm hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur disabled:opacity-50 transition-colors text-foreground"
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
} 