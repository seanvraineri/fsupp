"use client";

export default function Debug() {
  return (
    <pre suppressHydrationWarning>
      {JSON.stringify(process.env, null, 2)}
    </pre>
  );
} 