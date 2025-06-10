"use client";
import DashboardShell from '../../components/DashboardShell';
import { Upload } from 'lucide-react';

export default function UploadPage() {
  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Upload Your Health Data</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your genetic test results and lab reports to unlock personalized health insights.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
} 