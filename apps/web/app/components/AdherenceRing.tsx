import React from 'react';

interface Props {
  percent: number; // 0-100
  size?: number; // diameter in px
}

export default function AdherenceRing({ percent, size = 64 }: Props) {
  const radius = (size - 8) / 2; // leave stroke width room
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB" // gray-200
        strokeWidth="8"
        fill="none"
      />
      {/* progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#4F46E5" // indigo-600
        strokeWidth="8"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* label */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-xs font-semibold fill-gray-800 dark:fill-gray-200"
      >
        {percent}%
      </text>
    </svg>
  );
} 