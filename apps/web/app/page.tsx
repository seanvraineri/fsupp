"use client";
import Layout from './components/Layout';
import DNAAnimation from './components/DNAAnimation';
import KeyBenefits from './components/KeyBenefits';
import ScrollAnimation from './components/ScrollAnimation';
import { useState } from 'react';
import { ChevronDown, Dna, Brain, Shield, FileText, Lock, Microscope, Check } from 'lucide-react';
import Hero from './components/Hero';

export default function HomePage() {
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
    <Layout>
      <DNAAnimation />
      <div className="relative z-20">
        <Hero />
        
        <ScrollAnimation animation="fade-up" delay={100}>
          <KeyBenefits />
        </ScrollAnimation>
        
        
        {/* Simple Footer */}
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
