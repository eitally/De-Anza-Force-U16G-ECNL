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
        
        {/* Official Force Logo Graphic */}
        <img
          src="/logo.png"
          alt="De Anza Force Soccer Club"
          className="relative w-full h-full object-contain select-none drop-shadow-md"
        />
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

