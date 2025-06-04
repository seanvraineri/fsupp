"use client";
import useSWR from "swr";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

export default function HealthScoreCard(){
  const { data } = useSWR("/api/health-score", fetcher, { refreshInterval: 60000 });
  const score = data?.score ?? 50;
  const trend:number[] = data?.trend ?? [];
  const components = data?.components ?? {};

  // naive improvement suggestions
  const suggestions: string[] = [];
  if (components.inflam_lipids < 60) suggestions.push("Improve anti-inflammatory diet and essential fatty acids");
  if (components.adherence < 70) suggestions.push("Log supplement intake to boost adherence");
  if (components.micronutrients < 60) suggestions.push("Upload recent labs to refine micronutrient status");

  const pct = score;
  const brandStroke = "#7c3aed"; // Tailwind purple-600 (primary-from)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm w-full">
      <h3 className="text-sm font-medium mb-2">Health Score</h3>
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
            <path d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <path d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" fill="none" stroke={brandStroke} strokeWidth="4" strokeDasharray={`${pct},100`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-purple-600 dark:text-purple-400">{score}</div>
        </div>
      </div>
      {/* Breakdown */}
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p className="font-medium text-gray-800 dark:text-gray-200">Breakdown</p>
        {Object.keys(components).length===0 ? (
          <p className="italic text-gray-500">Complete your health assessment to generate a breakdown.</p>
        ) : (
          (Object.entries(components) as [string,number][]).map(([k,v])=> (
            <div key={k} className="flex justify-between">
              <span className="capitalize">{k}</span>
              <span>{v}</span>
            </div>
          ))
        )}
      </div>
      {suggestions.length>0 && (
        <div className="mt-4 text-xs">
          <p className="font-medium mb-1">How to improve</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
          </ul>
        </div>
      )}

      {/* Sparkline */}
      {trend.length>1 && (
        <div className="mt-4">
          <svg viewBox="0 0 100 40" className="w-full h-10 text-purple-600 dark:text-purple-400">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points={trend.map((v,i)=>`${(i/(trend.length-1))*100},${40-(v/100)*40}`).join(" ")} />
          </svg>
        </div>
      )}
    </div>
  );
} 