import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useDailyAct } from '@/context/DailyActContext';
import { cn } from '@/lib/utils';

export function ThemeToggle({ compact = false, alwaysShowLabel = false, className }) {
  const { theme, toggleTheme } = useDailyAct();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to Daytime Nature theme' : 'Switch to Nighttime Nature theme'}
      title={isDark ? 'Nighttime Nature — click for Daytime Nature' : 'Daytime Nature — click for Nighttime Nature'}
      className={cn(
        'dailyact-focus group inline-flex items-center gap-2 rounded-full border border-border/90 bg-card/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-accent/50',
        compact && 'px-2.5 py-1.5',
        className
      )}
    >
      <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden text-primary">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -45, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.75 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Moon className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 45, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -45, scale: 0.75 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Sun className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {!compact && (
        <span
          className={cn(
            'whitespace-nowrap',
            alwaysShowLabel ? 'inline' : 'hidden sm:inline'
          )}
        >
          {isDark ? 'Night Nature' : 'Day Nature'}
        </span>
      )}
    </button>
  );
}
