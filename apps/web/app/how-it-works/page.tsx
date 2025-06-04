"use client";
import Layout from '../components/Layout';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Tell Us About You",
      whatHappens: [
        "90-second questionnaire",
        "Optional upload of labs & raw DNA"
      ],
      whyItMatters: "Precision starts with context.",
      benefits: [
        "A holistic intake lets the AI see the whole you—goals, lifestyle, meds, biomarkers.",
        "Optional uploads unlock deeper insights, but nothing is required; you stay in control.",
        "Data-minimization + bank-level encryption mean only the info you volunteer is ever stored."
      ]
    },
    {
      number: 2,
      title: "AI-Powered Analysis",
      whatHappens: [
        "LLMs trained on 500+ studies",
        "Cross-checks 20k drug–nutrient interactions"
      ],
      whyItMatters: "Science at super-human speed.",
      benefits: [
        "Combines your genetics, bloodwork, and goals with the latest peer-reviewed evidence in seconds—something no clinician can replicate manually.",
        "Interaction engine flags hidden risks (e.g., magnesium + certain antibiotics) for safety you can trust.",
        "Dosing algorithms adjust for bio-availability, gender, and co-factor synergy so you don't under- or over-supplement."
      ]
    },
    {
      number: 3,
      title: "Personalized Plan Delivered",
      whatHappens: [
        "Stack, dosing schedule, & timing",
        "One-click purchase links"
      ],
      whyItMatters: "From \"maybe\" to actionable.",
      benefits: [
        "Transparent citations show exactly why each nutrient made the list—no black box.",
        "Direct-to-cart links save ~23 min per order and steer you away from counterfeit or low-grade products.",
        "Cost-per-benefit calculator highlights economical swaps so you can optimize without overspending."
      ]
    },
    {
      number: 4,
      title: "Track & Refine",
      whatHappens: [
        "In-app logging & chatbot",
        "Auto-updates with new data"
      ],
      whyItMatters: "Health is dynamic—so is your plan.",
      benefits: [
        "Feedback loop turns subjective feelings (energy, sleep) into quantifiable scores you can watch improve.",
        "Every new lab upload retrains your slice of the model, keeping recommendations fresh—like recalibrating GPS after a detour.",
        "Habit nudges and SMS reminders boost adherence by 42% versus static PDF reports."
      ]
    }
  ];

  return (
    <Layout>
      <section className="pt-24 pb-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Four simple steps to personalized health recommendations
            </p>
          </div>
          
          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 w-px h-20 bg-gray-200 dark:bg-gray-800"></div>
                )}
                
                <div className="flex gap-8">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-from to-primary-to text-white rounded-xl flex items-center justify-center font-semibold text-lg shadow-sm">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 -mt-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {step.title}
                    </h2>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* What Happens */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                          What Happens
                        </h3>
                        <ul className="space-y-2">
                          {step.whatHappens.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                              <span className="text-primary-from mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Why It Matters */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                          Why It Matters
                        </h3>
                        <p className="text-sm font-medium text-primary-from mb-4">
                          {step.whyItMatters}
                        </p>
                        <ul className="space-y-3">
                          {step.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple CTA */}
          <div className="mt-24 text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                $20/month
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Cancel anytime • 30-day guarantee
              </p>
              <button 
                onClick={() => window.location.href = '/auth?mode=signup'}
                className="px-8 py-3 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 
