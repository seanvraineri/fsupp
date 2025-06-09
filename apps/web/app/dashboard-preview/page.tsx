"use client";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Check, Activity, BarChart3, Pill } from "lucide-react";
import Link from 'next/link';
import dynamic from 'next/dynamic';

const HealthScoreCard = dynamic(() => import('@/app/components/HealthScoreCard'), { ssr: false });

const statsCards = [
  {
    title: "Health Assessment",
    value: "Not Complete",
    description: "Complete to get recommendations",
    icon: Activity
  },
  {
    title: "Supplements",
    value: "0 Active",
    description: "No recommendations yet",
    icon: Pill
  },
  {
    title: "Last Update",
    value: "-",
    description: "No data uploaded yet",
    icon: BarChart3
  },
]

export default function DashboardPreviewPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome to your health dashboard.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mt-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Active Subscription
            </CardTitle>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium rounded-full">
              Active
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$20/month</div>
            <p className="text-xs text-muted-foreground">
              Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
            <HealthScoreCard />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-6">
        {statsCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold tracking-tight">Get Started</h2>
        <div className="max-w-2xl mt-4">
            <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
                <CardHeader>
                    <CardTitle>Complete Your Health Assessment</CardTitle>
                    <CardDescription className="text-white/90">
                        Answer a few questions to receive personalized supplement recommendations backed by science.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href="/dashboard/questionnaire"
                        className="inline-flex items-center px-6 py-3 bg-white text-sky-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                        >
                        Start Health Assessment
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 