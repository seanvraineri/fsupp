"use client";
import Layout from './components/Layout';
import Hero from './components/Hero';
import DNAAnimation from './components/DNAAnimation';
import KeyBenefits from './components/KeyBenefits';
import ScrollAnimation from './components/ScrollAnimation';
import { useState } from 'react';
import { ChevronDown, Dna, Brain, Shield, FileText, Lock, Microscope, Check } from 'lucide-react';

export default function HomePage() {
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

  const howItWorks = [
    {
      icon: FileText,
      title: "Upload Your Data",
      description: "Securely upload genetic data and/or blood work results"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our system analyzes your data against current research"
    },
    {
      icon: Shield,
      title: "Get Recommendations",
      description: "Receive personalized, science-backed supplement suggestions"
    }
  ];

  const features = [
    {
      icon: Microscope,
      title: "Evidence-Based",
      description: "Every recommendation links to peer-reviewed studies"
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description: "Your data is encrypted and never shared"
    },
    {
      icon: Dna,
      title: "Genetic Insights",
      description: "Understand how your genes affect nutrient needs"
    }
  ];

  return (
    <Layout>
      <DNAAnimation />
      <div className="relative z-20">
        <Hero />
        
        <ScrollAnimation animation="fade-up" delay={100}>
          <KeyBenefits />
        </ScrollAnimation>

        {/* How It Works */}
        <ScrollAnimation animation="fade-up" delay={200}>
          <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Three simple steps to personalized recommendations
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {howItWorks.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-from to-primary-to rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollAnimation>

        {/* Key Features */}
        <ScrollAnimation animation="fade-up" delay={300}>
          <section className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Built for Your Privacy and Health
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-from to-primary-to rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollAnimation>

        {/* Pricing */}
        <ScrollAnimation animation="fade-up" delay={400}>
          <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                Start your personalized health journey today
              </p>
              
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md mx-auto shadow-xl">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  $20<span className="text-2xl font-normal text-gray-600 dark:text-gray-400">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Cancel anytime, no hidden fees
                </p>
                
                <ul className="text-left mb-8 space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Unlimited data uploads</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Personalized recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Drug interaction checks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Research citations included</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => window.location.href = '/auth?mode=signup'}
                  className="w-full px-8 py-4 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </section>
        </ScrollAnimation>

        {/* FAQs */}
        <ScrollAnimation animation="fade-up" delay={500}>
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

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-from to-primary-to bg-clip-text text-transparent">
                SupplementScribe
              </h3>
              <p className="text-gray-400 mb-8">
                Personalized supplement recommendations based on your genetics and biomarkers
              </p>
              <div className="flex justify-center gap-8 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              </div>
              <p className="mt-8 text-sm text-gray-500">
                © 2024 SupplementScribe. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
} 