import React from 'react';

interface ApsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'watermark';
  showText?: boolean;
  className?: string;
}

export const ApsLogo: React.FC<ApsLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  if (size === 'watermark') {
    return (
      <div className={`pointer-events-none select-none opacity-[0.07] ${className}`}>
        <svg
          viewBox="0 0 300 200"
          className="w-full h-full max-w-[400px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Oval Rings */}
          <ellipse
            cx="150"
            cy="100"
            rx="120"
            ry="75"
            stroke="#1b5e20"
            strokeWidth="12"
            transform="rotate(-15 150 100)"
          />
          <path
            d="M 60 70 C 90 30, 210 30, 240 70"
            stroke="#b71c1c"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text
            x="150"
            y="120"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="900"
            fontSize="78"
            fill="#1e3a1e"
            textAnchor="middle"
            letterSpacing="-2"
          >
            APS
          </text>
        </svg>
      </div>
    );
  }

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Visual Logo Badge */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-full transition-transform ${iconSizes[size]}`}
      >
        <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow-xs" fill="none">
          {/* Gradient & Ring definition */}
          <defs>
            <linearGradient id="apsGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <linearGradient id="apsRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>

          {/* Oval Badge background subtle glow */}
          <ellipse
            cx="60"
            cy="45"
            rx="52"
            ry="36"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            transform="rotate(-8 60 45)"
          />

          {/* Upper Red Crescent Swoop */}
          <path
            d="M 22 34 C 36 12, 84 10, 102 30"
            stroke="url(#apsRed)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Lower Green Crescent Swoop */}
          <path
            d="M 18 52 C 28 74, 76 78, 100 58"
            stroke="url(#apsGreen)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Inner APS Text */}
          <text
            x="60"
            y="54"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontWeight="900"
            fontSize="30"
            fill="#0f172a"
            textAnchor="middle"
            letterSpacing="-0.5"
          >
            APS
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-extrabold text-base sm:text-lg leading-tight">
            <span className="text-[#15803d]">AGILITY </span>
            <span className="text-[#dc2626] ml-1">POWER </span>
            <span className="text-[#15803d] ml-1">SYSTEM</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-tight line-clamp-1">
            CNG, Compressor, Generator & Automation Spare Parts
          </span>
        </div>
      )}
    </div>
  );
};
