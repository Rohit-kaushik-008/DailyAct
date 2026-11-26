import React from 'react';
import { cn } from '@/lib/utils';

export function BrandLogo({ className, showWordmark = true, compact = false }) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <span
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300',
          compact ? 'h-8 w-8' : 'h-9 w-9'
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className={cn(compact ? 'h-5 w-5' : 'h-[22px] w-[22px]')}
        >
          <path
            d="M7.5 23C7.5 14.2 13.5 8.5 23.5 8.5C23.5 17.8 18 23.5 7.5 23Z"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 18L14.2 21L21 13"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            DailyAct
          </span>
          {!compact && (
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
              Calm Productivity
            </span>
          )}
        </span>
      )}
    </div>
  );
}
