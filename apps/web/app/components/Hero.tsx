"use client";
import Link from 'next/link';

export default function Hero() {
  const scrollToHowItWorks = () => {
    const element = document.querySelector('#how-it-works-preview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50/90 to-white/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
          Personalized Health
          <span className="block mt-2 bg-gradient-to-r from-primary-from to-primary-to bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>
        
        {/* Micro-tagline */}
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">
          Less guessing. More living.
        </p>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Get personalized supplement recommendations based on your genetics, blood work, and health data. 
          Backed by science, tailored for you.
        </p>

        {/* Pricing */}
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          <span className="font-semibold">$20/month</span> for unlimited recommendations and AI health insights
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth?mode=signup"
            className="px-8 py-4 bg-gradient-to-r from-primary-from to-primary-to text-white text-lg font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Your Subscription
          </Link>
          <Link
            href="/how-it-works"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-from transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
        
        {/* Secondary CTA */}
        <div className="mt-6">
          <button
            onClick={scrollToHowItWorks}
            className="text-primary-from hover:text-primary-to transition-colors font-medium inline-flex items-center gap-1"
          >
            See a sample report
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </section>
  );
} 