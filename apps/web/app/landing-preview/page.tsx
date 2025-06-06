"use client";
import { Hero } from "@/app/components/landing/Hero";
import { Problem } from "@/app/components/landing/Problem";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { Features } from "@/app/components/landing/Features";
import { CTA } from "@/app/components/landing/CTA";
import { Footer } from "@/app/components/landing/Footer";

export default function LandingPreviewPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
} 