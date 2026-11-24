'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';

export type FinSightVariant =
  | 'gradient'
  | 'flat'
  | 'mono-dark'
  | 'mono-light'
  | 'currentColor'
  | 'auto'
  | 'light'
  | 'dark';

export interface FinSightIconProps extends React.SVGProps<SVGSVGElement> {
  /** Visual color treatment of the mark */
  variant?: FinSightVariant;
  /** Width and height in pixels (defaults to 32) */
  size?: number | string;
  /** Enable dynamic hover / float animations */
  animated?: boolean;
}

export interface FinSightLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual color treatment of the icon and wordmark */
  variant?: FinSightVariant;
  /** Size preset or pixel number */
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  /** Render only the icon mark */
  iconOnly?: boolean;
  /** Wordmark text color override */
  textColor?: string;
  /** Extra class names */
  className?: string;
  /** Enable dynamic hover animations on the icon bars */
  animated?: boolean;
}

const BRAND_COLORS = {
  lavender: '#C084FC',
  indigo: '#818CF8',
  emerald: '#34D399',
  charcoal: '#1E232A',
} as const;

/**
 * Exact isometric paths (30° angle, uniform 10px stem spacing, 18px arithmetic height progression)
 * with quadratic Bézier corner rounding (r = 3).
 */
const BAR_PATHS = {
  // Left bar (height: 24)
  left: 'M 34 69.00 L 18.62 63.46 Q 16 62 18.62 60.54 L 31.38 53.46 Q 34 52 36.62 53.46 L 49.38 60.54 Q 52 62 52 65.00 L 52 83.00 Q 52 86 49.38 87.46 L 36.62 94.54 Q 34 96 34 93.00 L 34 75.00 Q 34 72 31.38 70.54 Z',
  // Middle bar (height: 42)
  middle:
    'M 62 51.00 L 46.62 45.46 Q 44 44 46.62 42.54 L 59.38 35.46 Q 62 34 64.62 35.46 L 77.38 42.54 Q 80 44 80 47.00 L 80 83.00 Q 80 86 77.38 87.46 L 64.62 94.54 Q 62 96 62 93.00 L 62 57.00 Q 62 54 59.38 52.54 Z',
  // Right bar (height: 60)
  right:
    'M 90 33.00 L 74.62 27.46 Q 72 26 74.62 24.54 L 87.38 17.46 Q 90 16 92.62 17.46 L 105.38 24.54 Q 108 26 108 29.00 L 108 83.00 Q 108 86 105.38 87.46 L 92.62 94.54 Q 90 96 90 93.00 L 90 39.00 Q 90 36 87.38 34.54 Z',
} as const;

export const FinSightIcon: React.FC<FinSightIconProps> = ({
  variant = 'auto',
  size = 32,
  animated = true,
  className = '',
  ...props
}) => {
  const uid = useId();
  const gradLeftId = `finsight-grad-left-${uid}`;
  const gradMidId = `finsight-grad-mid-${uid}`;
  const gradRightId = `finsight-grad-right-${uid}`;

  const isGradient = variant === 'gradient';

  // Compute fill styles based on variant
  const getFills = () => {
    switch (variant) {
      case 'gradient':
        return {
          left: `url(#${gradLeftId})`,
          middle: `url(#${gradMidId})`,
          right: `url(#${gradRightId})`,
          classes: '',
        };
      case 'flat':
        return {
          left: BRAND_COLORS.lavender,
          middle: BRAND_COLORS.indigo,
          right: BRAND_COLORS.emerald,
          classes: '',
        };
      case 'mono-dark':
      case 'light':
        return {
          left: '#0A0E17',
          middle: '#0A0E17',
          right: '#0A0E17',
          classes: '',
        };
      case 'mono-light':
      case 'dark':
        return {
          left: '#FFFFFF',
          middle: '#FFFFFF',
          right: '#FFFFFF',
          classes: '',
        };
      case 'currentColor':
        return {
          left: 'currentColor',
          middle: 'currentColor',
          right: 'currentColor',
          classes: '',
        };
      case 'auto':
      default:
        return {
          left: 'currentColor',
          middle: 'currentColor',
          right: 'currentColor',
          classes: 'text-gray-900 dark:text-white',
        };
    }
  };

  const fills = getFills();

  // Staggered bounce for the 3 isometric bars on hover
  const barVariants = {
    initial: { y: 0 },
    hover: (customDelay: number) => ({
      y: [0, -5, 0],
      transition: {
        duration: 0.5,
        delay: customDelay,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 124 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FinSight icon"
      className={`shrink-0 overflow-visible transition-colors duration-200 ${fills.classes} ${className}`}
      whileHover={animated ? 'hover' : undefined}
      initial="initial"
      {...(props as any)}
    >
      {isGradient && (
        <defs>
          <linearGradient id={gradLeftId} x1="16" y1="52" x2="52" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D8B4FE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id={gradMidId} x1="44" y1="34" x2="80" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id={gradRightId} x1="72" y1="16" x2="108" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      )}

      {/* Isometric Three-tier Bars with individual spring motion */}
      <motion.path
        d={BAR_PATHS.left}
        fill={fills.left}
        variants={barVariants}
        custom={0}
      />
      <motion.path
        d={BAR_PATHS.middle}
        fill={fills.middle}
        variants={barVariants}
        custom={0.08}
      />
      <motion.path
        d={BAR_PATHS.right}
        fill={fills.right}
        variants={barVariants}
        custom={0.16}
      />
    </motion.svg>
  );
};

export const FinSightLogo: React.FC<FinSightLogoProps> = ({
  variant = 'auto',
  size = 'md',
  iconOnly = false,
  textColor,
  className = '',
  animated = true,
  style,
  ...props
}) => {
  // Map size presets or custom numbers
  const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg', { icon: number; text: string; gap: string }> = {
    xs: { icon: 18, text: 'text-[14px]', gap: 'gap-1.5' },
    sm: { icon: 24, text: 'text-[16px]', gap: 'gap-2' },
    md: { icon: 30, text: 'text-[19px]', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-[32px]', gap: 'gap-3.5' },
  };

  const isPreset = typeof size === 'string' && size in sizeMap;
  const iconPx = isPreset
    ? sizeMap[size as 'xs' | 'sm' | 'md' | 'lg'].icon
    : typeof size === 'number'
    ? size
    : 30;

  const textClass = isPreset
    ? sizeMap[size as 'xs' | 'sm' | 'md' | 'lg'].text
    : 'text-[19px]';

  const gapClass = isPreset
    ? sizeMap[size as 'xs' | 'sm' | 'md' | 'lg'].gap
    : 'gap-2.5';

  const getTextClass = () => {
    if (textColor) return '';
    switch (variant) {
      case 'mono-dark':
      case 'light':
        return 'text-gray-900';
      case 'mono-light':
      case 'dark':
        return 'text-white';
      case 'currentColor':
        return 'text-current';
      case 'gradient':
      case 'flat':
      case 'auto':
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  return (
    <div
      className={`inline-flex items-center ${gapClass} select-none cursor-pointer group ${className}`}
      style={style}
      {...props}
    >
      {/* Animated Icon (bars bounce independently, container remains steady) */}
      <FinSightIcon
        variant={variant}
        size={iconPx}
        animated={animated}
      />

      {/* Rock-Solid Wordmark (no scaling, bouncing, or displacement on hover) */}
      {!iconOnly && (
        <span
          className={`font-black tracking-tight leading-none transition-colors duration-200 ${textClass} ${getTextClass()}`}
          style={textColor ? { color: textColor } : undefined}
        >
          FinSight
        </span>
      )}
    </div>
  );
};

export default FinSightLogo;
