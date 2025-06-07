"use client";
import { Menu, Home, FileText, MessageSquare, User, X, LogOut, Zap, Upload, Settings, Database } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Health Assessment', href: '/dashboard/questionnaire', icon: FileText },
    { name: 'Comprehensive Analysis', href: '/dashboard/analysis', icon: Database },
    { name: 'Recommendations', href: '/dashboard/recommendations', icon: Zap },
    { name: 'Order Tests', href: '/dashboard/tests', icon: Upload },
    { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Product Checker', href: '/dashboard/product-checker', icon: Zap },
    { name: 'Symptom Tracker', href: '/dashboard/symptoms', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <button
              aria-label="Toggle sidebar navigation"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <span className="sr-only">Toggle sidebar</span>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.name}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition mb-2"
                >
                  <Icon size={20} />
                  {sidebarOpen ? <span>{item.name}</span> : <span className="sr-only">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 
