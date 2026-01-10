export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Clipboard base with gradient */}
      <defs>
        <linearGradient id="clipboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      
      {/* Clipboard clip */}
      <rect x="12" y="6" width="24" height="6" rx="2" fill="#22c55e" />
      
      {/* Main document shape with gradient border */}
      <rect x="8" y="14" width="32" height="32" rx="4" fill="white" stroke="url(#clipboardGradient)" strokeWidth="2" />
      
      {/* Checklist bullet points */}
      <circle cx="14" cy="22" r="1.5" fill="#3b82f6" />
      <line x1="18" y1="22" x2="26" y2="22" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="28" r="1.5" fill="#3b82f6" />
      <line x1="18" y1="28" x2="26" y2="28" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="34" r="1.5" fill="#3b82f6" />
      <line x1="18" y1="34" x2="26" y2="34" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="40" r="1.5" fill="#3b82f6" />
      <line x1="18" y1="40" x2="26" y2="40" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Large checkmark with gradient */}
      <path
        d="M 16 30 L 20 34 L 32 22"
        stroke="url(#checkmarkGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 16 30 L 20 34 L 32 22"
        stroke="#22c55e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* Sparkle/Star */}
      <path
        d="M 32 16 L 33 19 L 36 19 L 33.5 21 L 34.5 24 L 32 22 L 29.5 24 L 30.5 21 L 28 19 L 31 19 Z"
        fill="#60a5fa"
      />
    </svg>
  );
}

