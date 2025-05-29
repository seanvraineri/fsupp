export default function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* DNA Helix */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5F5CFF" />
          <stop offset="100%" stopColor="#BC65F1" />
        </linearGradient>
      </defs>
      
      {/* Left strand */}
      <path 
        d="M 50 20 
           C 50 40, 80 60, 80 80
           C 80 100, 50 120, 50 140
           C 50 160, 80 180, 80 200
           C 80 220, 50 240, 50 260"
        stroke="url(#logoGradient)"
        strokeWidth="12"
        fill="none"
      />
      
      {/* Right strand */}
      <path 
        d="M 150 20 
           C 150 40, 120 60, 120 80
           C 120 100, 150 120, 150 140
           C 150 160, 120 180, 120 200
           C 120 220, 150 240, 150 260"
        stroke="url(#logoGradient)"
        strokeWidth="12"
        fill="none"
      />
      
      {/* Connecting rungs */}
      <line x1="65" y1="50" x2="135" y2="50" stroke="url(#logoGradient)" strokeWidth="6" opacity="0.5" />
      <line x1="65" y1="110" x2="135" y2="110" stroke="url(#logoGradient)" strokeWidth="6" opacity="0.5" />
      <line x1="65" y1="170" x2="135" y2="170" stroke="url(#logoGradient)" strokeWidth="6" opacity="0.5" />
      <line x1="65" y1="230" x2="135" y2="230" stroke="url(#logoGradient)" strokeWidth="6" opacity="0.5" />
      
      {/* Pen nib at bottom */}
      <path 
        d="M 100 260 
           L 70 300
           L 70 340
           L 100 380
           L 130 340
           L 130 300
           Z"
        fill="url(#logoGradient)"
      />
      
      {/* Pen tip detail */}
      <circle cx="100" cy="340" r="8" fill="white" />
      <line x1="100" y1="260" x2="100" y2="340" stroke="white" strokeWidth="3" />
    </svg>
  );
} 