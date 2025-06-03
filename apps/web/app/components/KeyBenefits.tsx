"use client";
import { Check } from 'lucide-react';

export default function KeyBenefits() {
  const benefits = [
    {
      title: "Personalized to Your Data",
      description: "Get recommendations based on your actual genetic markers and blood work results"
    },
    {
      title: "Science-Based Approach",
      description: "Every recommendation is backed by peer-reviewed research and clinical studies"
    },
    {
      title: "Drug Interaction Checks",
      description: "Automatic screening for potential interactions with your current medications"
    },
    {
      title: "Privacy First",
      description: "Your health data is encrypted and never shared with third parties"
    }
  ];

  return (
    <section className="relative py-20 bg-white dark:bg-gray-900 transition-all duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Key Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            A Smarter Approach to Supplements
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Stop guessing. Start knowing what works for your body.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How We're Different */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Unlike generic supplement advice, we analyze <span className="font-semibold text-gray-900 dark:text-white">your specific genetic variations</span> and 
            <span className="font-semibold text-gray-900 dark:text-white"> current biomarkers</span> to identify what your body actually needs.
          </p>
        </div>
      </div>
    </section>
  );
} 