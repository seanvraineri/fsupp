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
  if (components.symptoms < 60) suggestions.push("Track symptoms daily to improve consistency");
  if (components.adherence < 70) suggestions.push("Log supplement intake to boost adherence");
  if (components.biomarkers < 70) suggestions.push("Upload recent lab work to refine biomarkers");

  const pct = score;
  const color = pct>70?"text-green-600":pct>50?"text-yellow-500":"text-red-500";
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm w-full">
      <h3 className="text-sm font-medium mb-2">Health Score</h3>
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
            <path d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <path d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${pct},100`} />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-2xl font-semibold ${color}`}>{score}</div>
        </div>
      </div>
      {/* Breakdown */}
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p className="font-medium text-gray-800 dark:text-gray-200">Breakdown</p>
        {(Object.entries(components) as [string,number][]).map(([k,v])=> (
          <div key={k} className="flex justify-between">
            <span className="capitalize">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      {suggestions.length>0 && (
        <div className="mt-4 text-xs">
          <p className="font-medium mb-1">How to improve</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
} 