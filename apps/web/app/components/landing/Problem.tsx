"use client";
import { motion } from "framer-motion";
import { AlertTriangle, HelpCircle, Biohazard } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const problemCards = [
  {
    icon: AlertTriangle,
    title: "Hidden Dangers",
    description: "Many supplements contain unlisted ingredients, heavy metals, or prescription drugs.",
    color: "text-red-500",
  },
  {
    icon: HelpCircle,
    title: "Misleading Claims",
    description: "The $50B supplement industry is unregulated, and most marketing claims are unproven.",
    color: "text-yellow-500",
  },
  {
    icon: Biohazard,
    title: "Personal Risks",
    description: "A supplement that works for one person could be ineffective or even harmful for you.",
    color: "text-orange-500",
  },
];

export const Problem = () => {
  return (
    <section className="py-20 sm:py-32 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-sky-600 dark:text-sky-400">
            The Uncomfortable Truth
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Why you can&apos;t trust the label.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            From contaminated products to exaggerated marketing, the supplement industry is designed to confuse you. We bring the clarity you need to make safe choices.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {problemCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  className="flex flex-col rounded-2xl bg-gray-50 p-8 ring-1 ring-inset ring-gray-900/5 dark:bg-gray-800/50 dark:ring-white/10"
                >
                  <div className="flex items-center gap-x-3">
                    <div className={`rounded-md p-2 ring-1 ring-inset ring-gray-900/10 dark:ring-white/20 ${card.color}`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                      {card.title}
                    </h3>
                  </div>
                  <p className="mt-4 flex-auto text-base leading-7 text-gray-600 dark:text-gray-300">
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}; 