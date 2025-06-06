"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <div className="bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Ready to take control?
            <br />
            Start your free analysis today.
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Stop guessing and start knowing. Your health is too important for uncertainty.
          </p>
        </motion.div>
        <motion.div
          className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <a
            href="/signup"
            className="group inline-flex items-center justify-center rounded-full bg-sky-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-sky-500 hover:scale-105"
          >
            Create an Account
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}; 