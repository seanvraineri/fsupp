"use client";
import { motion } from "framer-motion";
import { ScanLine, FlaskConical, ShieldCheck } from "lucide-react";

const steps = [
  {
    name: "Step 1",
    title: "Scan Anything",
    description: "Use your phone to scan a supplement's barcode or label, or simply search by name.",
    icon: ScanLine,
  },
  {
    name: "Step 2",
    title: "Get Your Report",
    description: "Our AI analyzes ingredients, checks for harmful interactions, and verifies scientific claims.",
    icon: FlaskConical,
  },
  {
    name: "Step 3",
    title: "Make Confident Choices",
    description: "Receive a simple, color-coded score and a detailed report to make an informed decision.",
    icon: ShieldCheck,
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 1,
      ease: [0.22, 1, 0.36, 1], // A smoother, more refined ease
    },
  }),
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-sky-600 dark:text-sky-400">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Clarity in three simple steps.
          </p>
        </div>
        <div className="relative mt-16 sm:mt-20">
          {/* Decorative line */}
          <div
            className="absolute left-1/2 top-4 -ml-px h-[calc(100%-2rem)] w-px bg-gray-200 dark:bg-gray-800"
            aria-hidden="true"
          />
          <div className="relative space-y-12 lg:space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.name}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative flex items-start lg:grid lg:grid-cols-3 lg:gap-x-8"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sky-500 text-white ring-8 ring-gray-50 dark:ring-black lg:mx-auto">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-6 lg:ml-0 lg:col-span-2 lg:text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 