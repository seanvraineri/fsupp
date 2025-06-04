"use client";
import Layout from '../components/Layout';
import { Check, ExternalLink, Shield, TrendingUp } from 'lucide-react';

export default function WhyImportantPage() {
  return (
    <Layout>
      <section className="pt-24 pb-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Personalized Supplements Matter
          </h1>
          
          {/* Problem Section */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              The Problem
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              75% of adults are deficient in at least one micronutrient.
            </p>
            <a 
              href="https://pubmed.ncbi.nlm.nih.gov/28140320/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-from hover:text-primary-to transition-colors"
            >
              <ExternalLink size={16} />
              View PubMed Study
            </a>
          </div>

          {/* Cost & Time Waste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Cost of Ineffective Supplements</h3>
              <p className="text-3xl font-bold text-red-600 mb-2">$421/year</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average wasted on supplements that don&apos;t work for your body</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Time Lost</h3>
              <p className="text-3xl font-bold text-primary-from mb-2">6+ months</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trial and error to find what actually works</p>
            </div>
          </div>

          {/* Evidence-Based Recommendations */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Evidence-Based Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Genetic Personalization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tailored to your DNA variants</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Drug-Interaction Safety Net</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatic interaction checks</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Peer-Reviewed Citations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Every recommendation backed by science</p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Solution */}
          <div className="bg-gradient-to-br from-primary-from/10 to-primary-to/10 dark:from-primary-from/20 dark:to-primary-to/20 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Our Solution</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              SupplementScribe combines your genetic data, blood work, and health history to create a truly personalized supplement plan. 
              Our AI analyzes over 500 peer-reviewed studies to ensure every recommendation is backed by science.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              With continuous optimization based on your latest lab results and real-world feedback, your supplement plan evolves with you. 
              No more guesswork, no more wasted money on supplements that don&apos;t work for your unique biology.
            </p>
          </div>

          {/* Outcome Stories */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Real Results from Real Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Emily, 34</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Marketing Executive</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-primary-from mb-2">+43% Ferritin</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increased ferritin levels from 22 to 31 ng/mL in just 90 days with personalized iron protocol
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Mark, 52</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Software Engineer</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-primary-from mb-2">+15 Sleep Score</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Better sleep quality with magnesium glycinate timing optimization
                </p>
              </div>
            </div>
          </div>

          {/* Data Security Callout */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-8 mb-12 text-white">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Your Data is Safe
            </h2>
            <p className="mb-6 text-gray-300">
              We take your privacy seriously. All health data is encrypted at rest and in transit using bank-level security protocols. 
              We&apos;re fully HIPAA compliant and undergo regular security audits.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm">SOC2 Type II</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm">256-bit Encryption</span>
              </div>
            </div>
          </div>

          {/* Subscription Module */}
          <div className="text-center bg-gradient-to-br from-primary-from/10 to-primary-to/10 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Health?</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Join thousands of subscribers for just
            </p>
            <p className="text-3xl font-bold text-primary-from mb-6">$20/month</p>
            <button 
              onClick={() => window.location.href = '/auth?mode=signup'}
              className="px-8 py-4 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Start Your Subscription
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
} 
