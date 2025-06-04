"use client";
import useSWR from "swr";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

export default function HealthScoreCard(){
  const { data } = useSWR("/api/health-score", fetcher, { refreshInterval: 60000 });
  const score = data?.score ?? 50;
  const trend:number[] = data?.trend ?? [];
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
    </div>
  );
} 