import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'light' | 'dark';
}

export default function Logo({ className = '', iconOnly = false, size = 'md', variant = 'auto' }: LogoProps) {
  const sizeClasses = {
    xs: 'w-5 h-5 rounded-[6px]',
    sm: 'w-8 h-8 rounded-[8px]',
    md: 'w-9 h-9 rounded-[10px]',
    lg: 'w-20 h-20 rounded-[20px]'
  };

  const iconClasses = {
    xs: 'w-[10px] h-[10px]',
    sm: 'w-[16px] h-[16px]',
    md: 'w-[18px] h-[18px]',
    lg: 'w-[40px] h-[40px]'
  };

  const textClasses = {
    xs: 'text-[14px]',
    sm: 'text-[16px]',
    md: 'text-[18px]',
    lg: 'text-[32px]'
  };

  // Icon bg and SVG icon color
  const iconBg =
    variant === 'light' ? 'bg-gray-900' :
    variant === 'dark'  ? 'bg-white' :
    'bg-gray-900 dark:bg-white';

  const iconColor =
    variant === 'light' ? 'text-white' :
    variant === 'dark'  ? 'text-gray-900' :
    'text-white dark:text-gray-900';

  // Text color
  // 'light' = always dark text (for white/light backgrounds)
  // 'dark'  = always white text (for dark backgrounds)
  // 'auto'  = follows theme via dark: utility
  const textColor =
    variant === 'light' ? 'text-gray-900' :
    variant === 'dark'  ? 'text-white' :
    'text-gray-900 dark:text-white';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon container */}
      <div className={`relative flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden ${sizeClasses[size]} ${iconBg}`}>
        
        {/* Abstract Lens F & Glassy lowercase s */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`z-10 ${iconClasses[size]} ${iconColor}`}>
          {/* The Capital 'F' - Highlighted & Solid */}
          {/* Main vertical stroke (F Stem) */}
          <path 
            d="M5 3.5 C5 2.67 5.67 2 6.5 2 L9.5 2 C10.33 2 11 2.67 11 3.5 L11 20.5 C11 21.33 10.33 22 9.5 22 L6.5 22 C5.67 22 5 21.33 5 20.5 Z" 
            fill="currentColor"
          />
          {/* Top sweeping curve (Lens Swoop / F Top Bar) */}
          <path 
            d="M11 2 C16 2 20 5.5 20 10 C20 10.83 19.33 11.5 18.5 11.5 L11 11.5 L11 2 Z" 
            fill="currentColor" 
          />
          
          {/* The lowercase 's' - Glassy & Toned down */}
          <path 
            d="M19 14.5 C19 12.5 17 11.5 15.5 11.5 C13.5 11.5 12.5 12.5 12.5 14.5 C12.5 16.5 19 16.5 19 19 C19 21 17 22 15.5 22 C13.5 22 12.5 21 12.5 19" 
            stroke="currentColor" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            fill="none"
            className="opacity-[0.45]"
          />
        </svg>

        {/* Ambient inner glow for detail */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      </div>
      
      {/* Text */}
      {!iconOnly && (
        <span className={`${textClasses[size]} font-black tracking-tight ${textColor}`}>
          FinSight
        </span>
      )}
    </div>
  );
}
