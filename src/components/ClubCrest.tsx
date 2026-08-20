import React from 'react';

interface ClubCrestProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const ClubCrest: React.FC<ClubCrestProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-10',
    md: 'w-10 h-12',
    lg: 'w-16 h-20',
    xl: 'w-24 h-28',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex-shrink-0 group`}>
        {/* Subtle Cyan Atmosphere Glow */}
        <div className="absolute inset-0 bg-[#00ADEF]/25 rounded-2xl blur-md group-hover:bg-[#00ADEF]/45 transition-all duration-300" />
        
        {/* Exact De Anza Force Shield Crest Vector */}
        <svg
          viewBox="0 0 380 470"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-xl select-none"
        >
          {/* Cyan Shield Fill */}
          <path
            d="M190 8 C280 8 368 46 368 150 C368 310 240 420 190 458 C140 420 12 310 12 150 C12 46 100 8 190 8 Z"
            fill="#00ADEF"
          />

          {/* Outer Black Border */}
          <path
            d="M190 8 C280 8 368 46 368 150 C368 310 240 420 190 458 C140 420 12 310 12 150 C12 46 100 8 190 8 Z"
            stroke="#000000"
            strokeWidth="14"
            strokeLinejoin="round"
          />

          {/* Inner Black Contour Stripe */}
          <path
            d="M190 34 C265 34 340 68 340 152 C340 290 230 388 190 422 C150 388 40 290 40 152 C40 68 115 34 190 34 Z"
            fill="none"
            stroke="#000000"
            strokeWidth="20"
            strokeLinejoin="round"
          />

          {/* Top Star */}
          <polygon
            points="190,52 201,84 235,84 207,104 218,136 190,116 162,136 173,104 145,84 179,84"
            fill="#000000"
          />

          {/* FORCE Wordmark */}
          <text
            x="190"
            y="224"
            textAnchor="middle"
            fontFamily="'Impact', 'Barlow Condensed', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="96"
            fill="#000000"
            letterSpacing="-1"
          >
            FORCE
          </text>

          {/* SOCCER CLUB Subtext */}
          <text
            x="190"
            y="274"
            textAnchor="middle"
            fontFamily="'Barlow Condensed', 'Arial Black', 'Impact', sans-serif"
            fontWeight="900"
            fontSize="28"
            fill="#000000"
            letterSpacing="4"
          >
            SOCCER CLUB
          </text>

          {/* Bottom 3 Vertical Stripes / Pillars */}
          <rect x="151" y="306" width="16" height="114" rx="2" fill="#000000" />
          <rect x="182" y="306" width="16" height="134" rx="2" fill="#000000" />
          <rect x="213" y="306" width="16" height="114" rx="2" fill="#000000" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-condensed font-black tracking-wider text-xl uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
            DE ANZA FORCE
            <span className="inline-block w-2 h-2 rounded-full bg-[#00ADEF] animate-pulse" />
          </span>
          <span className="text-xs font-semibold text-[#00ADEF] tracking-widest uppercase">
            U16 ECNL • NORCAL
          </span>
        </div>
      )}
    </div>
  );
};

