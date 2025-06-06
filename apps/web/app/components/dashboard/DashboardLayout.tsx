"use client";
import React, { useState } from 'react';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  Settings,
  Users,
  Menu,
  Search,
  FlaskConical,
  HeartPulse,
  Beaker,
  MessageCircle,
  Stethoscope,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const navItems = [
    { href: '/dashboard-preview', icon: Home, label: 'Overview' },
    { href: '/dashboard-preview/health-assessment', icon: HeartPulse, label: 'Health Assessment' },
    { href: '/dashboard-preview/recommendations', icon: LineChart, label: 'Recommendations' },
    { href: '/dashboard-preview/order-tests', icon: Beaker, label: 'Order Tests' },
    { href: '/dashboard-preview/ai-chat', icon: MessageCircle, label: 'AI Chat' },
    { href: '/dashboard-preview/product-checker', icon: FlaskConical, label: 'Product Checker' },
    { href: '/dashboard-preview/symptom-tracker', icon: Stethoscope, label: 'Symptom Tracker' },
];

const settingsNav = { href: '/dashboard-preview/settings', icon: Settings, label: 'Settings' };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const MobileNav = () => (
    <nav className="fixed inset-y-0 left-0 z-50 flex w-full flex-col border-r bg-background sm:hidden">
        {/* Mobile Nav Content */}
    </nav>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">SupplementScribe</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                  href={settingsNav.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground`}
                >
                  <settingsNav.icon className="h-4 w-4" />
                  {settingsNav.label}
                </Link>
                 <Link
                  href="#"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
} 