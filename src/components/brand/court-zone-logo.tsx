'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type CourtZoneLogoProps = {
  className?: string;
  /** Viewbox is 32×32; override with width/height or className */
  size?: number;
};

/**
 * Court Zone mark: basketball on a dark rounded tile (matches header / sidebar).
 */
export function CourtZoneLogo({ className, size = 32 }: CourtZoneLogoProps) {
  const gradId = `cz-ball-${useId().replace(/:/g, '')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#0f172a" />
      <circle cx="16" cy="16" r="9.5" fill={`url(#${gradId})`} />
      <path
        d="M16 6.5v19M6.5 16h19"
        stroke="#0f172a"
        strokeOpacity="0.45"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M8.5 10.5c2.8 2.2 4.5 5.2 4.5 5.5s-1.7 3.3-4.5 5.5M23.5 10.5c-2.8 2.2-4.5 5.2-4.5 5.5s1.7 3.3 4.5 5.5"
        fill="none"
        stroke="#0f172a"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
