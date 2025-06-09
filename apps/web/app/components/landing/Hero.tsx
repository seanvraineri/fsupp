"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const FadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:py-32 lg:px-8">
        <motion.div variants={FadeIn} initial="hidden" animate="visible">
          <a
            href="/waitlist"
            className="group mx-auto mb-8 inline-flex items-center gap-x-3 rounded-full bg-gray-200/50 px-4 py-2 text-sm text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300/80 transition hover:bg-gray-200/70 dark:bg-gray-800/50 dark:text-gray-300 dark:ring-gray-700/80 dark:hover:bg-gray-800/70"
          >
            <span className="font-medium">Announcing our v1</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-gray-400 sm:text-6xl">
            Don&apos;t Guess. <span className="underline decoration-sky-500">Know.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            The supplement industry is a confusing, unregulated mess. Stop wasting money and risking your health. Scan any product and get a clear, science-backed safety and effectiveness report in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/signup"
              className="group inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-gray-800 hover:scale-105 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="group inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Learn More <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 z-0 opacity-10 dark:[&>div]:bg-white/10 [&>div]:absolute [&>div]:bg-black/5 [&>div]:blur-3xl">
        <div className="left-1/4 top-1/4 h-48 w-96 -translate-x-1/2 rounded-full" />
        <div className="right-1/4 top-1/2 h-64 w-64 translate-x-1/3 rounded-full" />
        <div className="left-1/2 bottom-1/4 h-32 w-80 translate-x-1/4 rounded-full" />
      </div>
    </section>
  );
}; 