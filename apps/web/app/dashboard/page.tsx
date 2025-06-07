"use client";
import DashboardShell from '../components/DashboardShell';
import Link from 'next/link';
import { Check, Database, Dna, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
const HealthScoreCard = dynamic(()=>import('../components/HealthScoreCard'),{ ssr:false });

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to your health dashboard</p>
        </div>

        {/* Subscription Status */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Active Subscription</p>
              <p className="text-xs text-green-600 dark:text-green-400">$20/month • Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
        </div>

        {/* Health Score */}
        <div className="mb-8 max-w-xs">
          <HealthScoreCard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Assessment</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Not Complete</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete assessment to get recommendations</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplements</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0 Active</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">No recommendations yet</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">-</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">No data uploaded yet</p>
          </div>
        </div>

        {/* Comprehensive Analysis Feature Highlight */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Database className="w-8 h-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🚀 Comprehensive Health Analysis
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                  Our expanded knowledge base now covers <strong>22 genetic variants</strong> across 20+ metabolic pathways and <strong>40+ biomarkers</strong> 
                  including complete blood count, comprehensive metabolic panel, hormones, and vitamins. Get precision-targeted supplement recommendations 
                  based on your unique genetic and lab data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Dna className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-purple-800 dark:text-purple-200">Genetic Analysis</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300">MTHFR, COMT, APOE, VDR, HFE & more</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">Lab Analysis</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300">CBC, CMP, lipids, hormones, vitamins</div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard/analysis"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-medium"
                >
                  <Database className="w-4 h-4" />
                  Explore Comprehensive Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <div className="max-w-2xl">
          <div className="bg-gradient-to-br from-primary-from to-primary-to rounded-lg shadow-lg p-8 text-white">
            <h3 className="text-2xl font-semibold mb-4">Complete Your Health Assessment</h3>
            <p className="mb-6 text-white/90">
              Answer a few questions about your health and optionally upload genetic data and blood work results to receive personalized supplement recommendations backed by science.
            </p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="text-sm">5-minute assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="text-sm">Science-backed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="text-sm">Personalized</span>
              </div>
            </div>
            <Link
              href="/dashboard/questionnaire"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-from rounded-lg font-medium hover:bg-gray-100 transition-all"
            >
              Start Health Assessment
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 
