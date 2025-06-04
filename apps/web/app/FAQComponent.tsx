"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import ScrollAnimation from "./components/ScrollAnimation";

export default function FAQComponent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What data do I need to provide?",
      answer: "You can upload genetic data from services like 23andMe or AncestryDNA, along with recent blood work results. If you don't have genetic data, you can still get recommendations based on your blood work and health questionnaire alone."
    },
    {
      question: "How are supplement recommendations generated?",
      answer: "Our AI analyzes your genetic variations and biomarkers against peer-reviewed research to identify potential deficiencies and beneficial supplements. Each recommendation includes citations to the supporting scientific literature."
    },
    {
      question: "Is my health data secure?",
      answer: "Yes. We use end-to-end encryption for all health data. Your information is stored securely and is never sold or shared with third parties. You maintain full control and can delete your data at any time."
    },
    {
      question: "Will this work with my current medications?",
      answer: "Our system checks for known drug-nutrient interactions based on your medication list. However, we always recommend consulting with your healthcare provider before starting any new supplements."
    },
    {
      question: "How often should I update my data?",
      answer: "We recommend updating blood work results every 3-6 months to track changes and refine recommendations. Genetic data only needs to be uploaded once."
    },
    {
      question: "What makes this different from generic supplement advice?",
      answer: "Generic advice assumes everyone is the same. We analyze your specific genetic variants (like MTHFR, VDR, COMT) and current nutrient levels to provide truly personalized recommendations."
    }
  ];

  return (
    <ScrollAnimation animation="fade-up" delay={200}>
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-6 h-6 text-primary-from transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
} 
