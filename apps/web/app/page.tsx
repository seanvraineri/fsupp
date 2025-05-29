"use client";
import Layout from './components/Layout';
import Hero from './components/Hero';
import DNAAnimation from './components/DNAAnimation';
import { useState } from 'react';
import { ChevronDown, Shield, Brain, RefreshCw, Check } from 'lucide-react';

export default function HomePage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need DNA data to get started?",
      answer: "No! While genetic data enhances our recommendations, you can start with just a health questionnaire. You can always add DNA data later."
    },
    {
      question: "Is my health data safe?",
      answer: "Absolutely. We use bank-level encryption and are HIPAA compliant. Your data is never sold and you can delete it anytime."
    },
    {
      question: "How quickly will I see results?",
      answer: "Most users report improved energy within 2-4 weeks. Blood markers typically show improvement in 60-90 days."
    },
    {
      question: "Can I use FSA/HSA funds?",
      answer: "Many users successfully use FSA/HSA funds for our service. We provide detailed receipts for reimbursement."
    },
    {
      question: "What if I'm on medications?",
      answer: "Our AI checks for drug-nutrient interactions automatically. We flag any concerns and recommend discussing with your doctor."
    }
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      quote: "My energy levels are through the roof. Wish I'd found this sooner!",
      avatar: "👩‍💼"
    },
    {
      name: "James T.",
      quote: "The drug interaction warnings alone are worth the subscription.",
      avatar: "👨‍⚕️"
    },
    {
      name: "Maria L.",
      quote: "Finally, recommendations that actually work for MY body.",
      avatar: "👩‍🔬"
    }
  ];

  return (
    <Layout>
      {/* DNA Animation Background */}
      <DNAAnimation />
      
      {/* Page Content */}
      <div className="relative">
        <Hero />
        
        {/* How It Works Preview */}
        <section id="how-it-works-preview" className="py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary-from rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Share Your Data</h3>
                <p className="text-gray-600 dark:text-gray-400">Upload your genetic data, blood work, and complete a health questionnaire</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary-from rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">Our AI analyzes your data against thousands of research papers</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary-from rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
                <p className="text-gray-600 dark:text-gray-400">Receive personalized supplement recommendations with scientific backing</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <a href="/how-it-works" className="text-primary-from hover:text-primary-to transition-colors font-medium">
                Dive deeper →
              </a>
            </div>
          </div>
        </section>

        {/* Core Benefits */}
        <section className="py-20 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Why Choose SupplementScribe
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Brain className="w-12 h-12 text-primary-from mb-4" />
                <h3 className="text-xl font-semibold mb-3">Personalized to Your Biology</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cuts wasted spend on supplements that don't work for your unique genetics and biomarkers
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Shield className="w-12 h-12 text-primary-from mb-4" />
                <h3 className="text-xl font-semibold mb-3">Evidence-Based & Safe</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Auto drug-interaction guard protects you from dangerous combinations
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <RefreshCw className="w-12 h-12 text-primary-from mb-4" />
                <h3 className="text-xl font-semibold mb-3">Always Up-to-Date</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Plan refines with every new lab upload, keeping your recommendations current
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Snapshot */}
        <section className="py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Simple, Transparent Pricing
            </h2>
            
            <div className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    billingPeriod === 'monthly' 
                      ? 'bg-primary-from text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    billingPeriod === 'annual' 
                      ? 'bg-primary-from text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Annual
                </button>
              </div>
              
              <div className="mb-6">
                {billingPeriod === 'monthly' ? (
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">$20/month</p>
                ) : (
                  <div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">$199/year</p>
                    <p className="text-sm text-green-600 mt-1">Save 17%</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => window.location.href = '/auth?mode=signup'}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Your Subscription
              </button>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              What Our Users Say
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{testimonial.name}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/95 backdrop-blur-sm text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">SupplementScribe</h3>
                <p className="text-sm text-gray-400">Personalized health, powered by AI.</p>
              </div>
              <div>
                <h4 className="font-medium mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="/hipaa" className="hover:text-white transition-colors">HIPAA Notice</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="/why-important" className="hover:text-white transition-colors">Why It's Important</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="https://twitter.com" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="https://linkedin.com" className="hover:text-white transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
              © 2024 SupplementScribe. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
