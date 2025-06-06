"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  DatabaseZap,
  Fingerprint,
  FileCheck2,
  BookOpenCheck,
} from "lucide-react";

const features = [
  {
    name: "Evidence-Based Analysis",
    description:
      "We cross-reference ingredients against millions of data points from peer-reviewed scientific studies, FDA warnings, and clinical trials.",
    icon: BookOpenCheck,
  },
  {
    name: "Personalized Safety Scores",
    description:
      "Get a simple, color-coded safety score based on your unique health profile, allergies, and medication interactions.",
    icon: Fingerprint,
  },
  {
    name: "Complete Ingredient Breakdown",
    description:
      "See what&apos;s really inside. We identify every ingredient, including hidden fillers and potential contaminants.",
    icon: FileCheck2,
  },
  {
    name: "Real-Time Data",
    description:
      "Our database is constantly updated with the latest research and product recalls to ensure you always have the most current information.",
    icon: DatabaseZap,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const Features = () => {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-sky-600 dark:text-sky-400">
                Your Pocket Scientist
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need, nothing you don&apos;t.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                We do the hard work of research and analysis so you can focus on your health. Our platform is built on transparency and scientific rigor.
              </p>
              <motion.dl
                className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.name}
                    className="relative pl-9"
                    variants={itemVariants}
                  >
                    <dt className="inline font-semibold text-gray-900 dark:text-white">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5 text-sky-600 dark:text-sky-400"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </dd>
                  </motion.div>
                ))}
              </motion.dl>
            </div>
          </div>
          <motion.div 
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="https://placehold.co/600x600/000000/FFFFFF?text=App+Screenshot"
              alt="Product screenshot"
              className="w-[30rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[40rem] md:-ml-4 lg:-ml-0"
              width={2432}
              height={1442}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 