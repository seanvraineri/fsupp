"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/20 via-transparent to-blue-100/20 dark:from-purple-900/10 dark:to-blue-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-from/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-to/10 via-transparent to-transparent"></div>
      </div>
      
      {/* Dynamic gradient orbs that follow mouse */}
      <div 
        className="absolute w-[800px] h-[800px] bg-gradient-to-r from-primary-from/20 to-primary-to/20 rounded-full filter blur-[150px]"
        style={{
          left: `${mousePosition.x * 0.05}px`,
          top: `${mousePosition.y * 0.05}px`,
          transition: 'left 2s ease-out, top 2s ease-out',
        }}
      ></div>
      
      {/* Static gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full filter blur-[130px]"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-blue-400/20 to-indigo-400/20 rounded-full filter blur-[130px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20 pt-32 pb-20">
        {/* Premium badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered Health Revolution</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
          <span className="block text-gray-900 dark:text-white">
            Personalized Health
          </span>
          <span className="block mt-2 bg-gradient-to-r from-primary-from via-purple-500 to-primary-to bg-clip-text text-transparent animate-gradient bg-300%">
            Powered by AI
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-2xl font-light text-gray-700 dark:text-gray-300 mb-8 tracking-wide">
          Less guessing. More living.
        </p>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Get <span className="font-medium text-gray-900 dark:text-white">personalized supplement recommendations</span> based on 
          your genetics, blood work, and health data. <span className="font-medium">Backed by science, tailored for you.</span>
        </p>

        {/* Pricing badge */}
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 backdrop-blur-xl rounded-full px-8 py-4 mb-12 shadow-xl border border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Starting at</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">$20</span>
          <span className="text-gray-600 dark:text-gray-400">/month</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">• Cancel anytime</span>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/auth?mode=signup"
            className="group relative px-10 py-5 bg-gradient-to-r from-primary-from to-primary-to text-white text-lg font-medium rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-to to-primary-from opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10">Start Your Journey</span>
          </Link>
          <Link
            href="/how-it-works"
            className="group px-10 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white text-lg font-medium rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-primary-from/50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text group-hover:from-primary-from group-hover:to-primary-to transition-all duration-300">
              See How It Works
            </span>
          </Link>
        </div>
        
        {/* Secondary CTA */}
        <button
          onClick={() => window.location.href = '#how-it-works'}
          className="group text-gray-600 hover:text-primary-from dark:text-gray-400 dark:hover:text-primary-from transition-all duration-300 font-medium inline-flex items-center gap-2"
        >
          <span className="relative">
            View sample report
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-from to-primary-to group-hover:w-full transition-all duration-300"></span>
          </span>
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Science-Based</span>
          </div>
        </div>
      </div>

      {/* Gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        
        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </section>
  );
} 
