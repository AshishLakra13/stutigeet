'use client';

import { useEffect, useState } from 'react';

type BrandMarkProps = { size?: number; className?: string; animate?: boolean };

export function BrandMark({ size = 24, className, animate = false }: BrandMarkProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!animate) return;
    try {
      const seen = localStorage.getItem('stuti.first_visit_seen');
      if (!seen) {
        setShouldAnimate(true);
        const timer = setTimeout(() => {
          localStorage.setItem('stuti.first_visit_seen', '1');
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, [animate]);

  return (
    <svg
      width={size}
      height={Math.round(size * (4 / 3))}
      viewBox="0 0 24 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={[shouldAnimate ? 'brand-mark-animate' : '', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <line className="brand-vertical" x1="12" y1="5" x2="12" y2="30" />
      <line className="brand-h1" x1="5" y1="11" x2="19" y2="11" />
      <line className="brand-h2" x1="7" y1="19" x2="17" y2="19" />
      <circle className="brand-bindu" cx="12" cy="2" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
