"use client";

export default function Debug() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return (
    <pre suppressHydrationWarning>
      {JSON.stringify(process.env, null, 2)}
    </pre>
  );
} 