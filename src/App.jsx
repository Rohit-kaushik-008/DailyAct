import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { DailyActProvider, useDailyAct } from '@/context/DailyActContext';
import { Navbar, NAV_ITEMS } from '@/components/Navbar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { HabitsPage } from '@/pages/HabitsPage';

const VALID_PAGES = new Set(NAV_ITEMS.map((item) => item.id));

function getInitialPage() {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace('#', '');
  return VALID_PAGES.has(hash) ? hash : 'dashboard';
}

function DailyActShell() {
  const { theme } = useDailyAct();
  const [activePage, setActivePage] = useState(getInitialPage);
  const [openTaskDialogFromDash, setOpenTaskDialogFromDash] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (VALID_PAGES.has(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (pageId) => {
    if (!VALID_PAGES.has(pageId)) return;
    setActivePage(pageId);
    if (window.location.hash !== `#${pageId}`) {
      window.history.replaceState(null, '', `#${pageId}`);
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.45 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenNewTaskFromDash = () => {
    setOpenTaskDialogFromDash(true);
    handleNavigate('tasks');
  };

  return (
    <div className="dailyact-shell flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-14 lg:pt-9"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activePage === 'dashboard' && (
              <DashboardPage
                onNavigate={handleNavigate}
                onOpenNewTask={handleOpenNewTaskFromDash}
              />
            )}
            {activePage === 'tasks' && (
              <TasksPage
                externalCreateOpen={openTaskDialogFromDash}
                onExternalCreateClose={() => setOpenTaskDialogFromDash(false)}
              />
            )}
            {activePage === 'calendar' && <CalendarPage />}
            {activePage === 'habits' && <HabitsPage />}
          </motion.div>
        </AnimatePresence>

        <footer className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            DailyAct · {theme === 'dark' ? 'Nighttime Nature Theme' : 'Daytime Nature Theme'}
          </p>
          <div className="flex items-center gap-2.5">
            <span>Theme setting:</span>
            <ThemeToggle alwaysShowLabel />
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DailyActProvider>
      <MotionConfig reducedMotion="user">
        <DailyActShell />
      </MotionConfig>
    </DailyActProvider>
  );
}
