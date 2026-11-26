import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckSquare, LayoutDashboard, Sprout } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'habits', label: 'Habits', icon: Sprout },
];

export function Navbar({ activePage, onNavigate }) {
  return (
    <>
      {/* Desktop Top Navbar (>= 1024px) */}
      <header className="sticky top-0 z-40 hidden border-b border-border/75 bg-background/85 backdrop-blur-md lg:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-8">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="dailyact-focus rounded-xl text-left transition-opacity hover:opacity-90"
            aria-label="DailyAct Home"
          >
            <BrandLogo />
          </button>

          <nav aria-label="Primary navigation" className="flex items-center gap-1.5 rounded-2xl border border-border/70 bg-card/80 p-1 shadow-sm">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'dailyact-focus relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tablet & Mobile Top Brand Header (< 1024px) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/75 bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="dailyact-focus rounded-xl text-left"
          aria-label="DailyAct Home"
        >
          <BrandLogo compact />
        </button>

        <ThemeToggle />
      </header>

      {/* Tablet & Mobile Bottom Navigation Dock (< 1024px) */}
      <nav
        aria-label="Mobile and tablet navigation"
        className="bottom-nav-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-lg lg:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-2 pt-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'dailyact-focus relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary/15"
                  />
                )}
                <Icon className="relative z-10 h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="relative z-10 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
