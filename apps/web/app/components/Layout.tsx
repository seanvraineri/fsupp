"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuth = pathname?.startsWith('/auth');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show nav on dashboard or auth pages
  if (isDashboard || isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white dark:bg-gray-900 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo className="h-10 w-auto" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                SupplementScribe
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-primary-from transition">
                How it Works
              </Link>
              <Link href="/why-important" className="text-gray-700 dark:text-gray-300 hover:text-primary-from transition">
                Why It's Important
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-from transition"
              >
                Sign In
              </Link>
              <button 
                onClick={() => router.push('/auth?mode=signup')}
                className="px-4 py-2 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </>
  );
} 