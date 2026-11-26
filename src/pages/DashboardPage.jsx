import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Flame,
  ListChecks,
  Minus,
  Plus,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { useDailyAct } from '@/context/DailyActContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TaskRow } from '@/components/TaskRow';
import { formatReadableDate, getDeadlineMeta, getGreeting, toLocalDateString } from '@/lib/dates';

const PRIORITY_WEIGHT = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function DashboardPage({ onNavigate, onOpenNewTask }) {
  const {
    tasks,
    habits,
    calendarNotes,
    theme,
    toggleTaskComplete,
    updateTask,
    recordHabitAction,
  } = useDailyAct();

  const statsContainerRef = useRef(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !statsContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-stat-card',
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    }, statsContainerRef);

    return () => ctx.revert();
  }, []);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const activeTasks = tasks.filter((t) => t.status !== 'completed');
    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const bestHabitStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);
    const activeTopStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

    const totalPositivePts = habits.reduce(
      (sum, h) => sum + h.positiveCount * h.positivePoints,
      0
    );
    const totalNegativePts = habits.reduce(
      (sum, h) => sum + h.negativeCount * h.negativePoints,
      0
    );
    const netHabitPoints = totalPositivePts - totalNegativePts;

    const timeBoundTasks = activeTasks
      .filter((t) => Boolean(t.dueDate))
      .map((t) => ({ task: t, deadline: getDeadlineMeta(t.dueDate, t.dueTime) }))
      .sort((a, b) => (a.deadline?.timestamp || 0) - (b.deadline?.timestamp || 0));

    const importantTasks = [...activeTasks]
      .sort((a, b) => {
        const diff = (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      })
      .slice(0, 4);

    const todayStr = toLocalDateString(new Date());
    const upcomingCalendarEntries = Object.values(calendarNotes)
      .filter((entry) => entry.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);

    return {
      totalTasks,
      completedTasks,
      completionPct,
      bestHabitStreak,
      activeTopStreak,
      totalPositivePts,
      totalNegativePts,
      netHabitPoints,
      timeBoundTasks,
      importantTasks,
      upcomingCalendarEntries,
    };
  }, [tasks, habits, calendarNotes]);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>
              {todayFormatted} · {theme === 'dark' ? 'Nighttime Nature' : 'Daytime Nature'}
            </span>
          </div>
          <h1
            id="dashboard-heading"
            className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {getGreeting()}, stay grounded.
          </h1>
          <p className="text-sm text-muted-foreground">
            Your calm overview of streaks, priority focus, deadlines, and daily habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button type="button" variant="outline" onClick={() => onNavigate('habits')}>
            <Sprout className="h-4 w-4" aria-hidden="true" />
            Track Habits
          </Button>
          <Button type="button" onClick={onOpenNewTask}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Key Stats Row */}
      <div
        ref={statsContainerRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="dash-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Streak
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.activeTopStreak} {stats.activeTopStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Personal best: {stats.bestHabitStreak} {stats.bestHabitStreak === 1 ? 'day' : 'days'}
            </p>
          </CardContent>
        </Card>

        <Card className="dash-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Task Completion
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.completedTasks}/{stats.totalTasks}
              </span>
              <span className="text-xs font-medium text-primary">{stats.completionPct}%</span>
            </div>
            <Progress value={stats.completionPct} label="Task completion rate" />
          </CardContent>
        </Card>

        <Card className="dash-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Habit Point Score
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sprout className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.netHabitPoints >= 0 ? `+${stats.netHabitPoints}` : stats.netHabitPoints} pts
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-[hsl(var(--nature-positive-fg))]">+{stats.totalPositivePts}</span>{' '}
              earned ·{' '}
              <span className="text-[hsl(var(--nature-danger-fg))]">-{stats.totalNegativePts}</span>{' '}
              deducted
            </p>
          </CardContent>
        </Card>

        <Card className="dash-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Time-Limited Tasks
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.timeBoundTasks.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.timeBoundTasks.length === 0
                ? 'No pending deadlines'
                : stats.timeBoundTasks[0].deadline?.label || 'Upcoming schedule'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Bento Row 1: Important Tasks & Time-Limited Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="flex flex-col lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
                Most Important Tasks
              </CardTitle>
              <CardDescription>Prioritized active tasks ready to check off.</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('tasks')}
              className="shrink-0"
            >
              All Tasks
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {stats.importantTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every important task is complete. Add a new one whenever you are ready.
                </p>
              </div>
            ) : (
              stats.importantTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  compact
                  onToggleComplete={toggleTaskComplete}
                  onStatusChange={(id, status) => updateTask(id, { status })}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                Due by Time Limit
              </CardTitle>
              <CardDescription>Tasks scheduled with a deadline.</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('tasks')}
              className="shrink-0"
            >
              Manage
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {stats.timeBoundTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No deadlines pending</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tasks with a due date or time limit appear here automatically.
                </p>
              </div>
            ) : (
              stats.timeBoundTasks.slice(0, 5).map(({ task, deadline }) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/75 bg-background/55 p-3.5 transition-colors hover:border-primary/35"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.category} · {task.difficulty} difficulty
                    </p>
                  </div>
                  <Badge
                    variant={
                      deadline?.urgency === 'overdue'
                        ? 'destructive'
                        : deadline?.urgency === 'urgent' || deadline?.urgency === 'today'
                          ? 'warning'
                          : 'outline'
                    }
                    className="shrink-0"
                  >
                    {deadline?.shortLabel}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Bento Row 2: Quick Habit Check-in & Important Dates */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="flex flex-col lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-primary" aria-hidden="true" />
                Daily Habit Pulse
              </CardTitle>
              <CardDescription>
                Award positive points for wins or log negative points for broken rules.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('habits')}
              className="shrink-0"
            >
              Full Tracker
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {habits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No habits tracked yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first habit on the Habits page to earn streaks and points.
                </p>
              </div>
            ) : (
              habits.slice(0, 4).map((habit) => (
                <div
                  key={habit.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/75 bg-background/55 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="min-w-0 max-w-full truncate text-sm font-medium text-foreground">
                        {habit.title}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-[11px]">
                        {habit.currentStreak} streak
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Score:{' '}
                      <span className="font-medium text-foreground">
                        {habit.netPoints >= 0 ? `+${habit.netPoints}` : habit.netPoints} pts
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => recordHabitAction(habit.id, 'positive')}
                      className="badge-nature-positive hover:opacity-90"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />+{habit.positivePoints}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => recordHabitAction(habit.id, 'negative')}
                      className="badge-nature-danger hover:opacity-90"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />-{habit.negativePoints}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CalendarHeart className="h-4 w-4 text-primary" aria-hidden="true" />
                Marked Dates & Notes
              </CardTitle>
              <CardDescription>Upcoming important days from your calendar.</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('calendar')}
              className="shrink-0"
            >
              Calendar
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcomingCalendarEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">Quiet calendar ahead</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Open the Calendar tab to mark important dates and leave reminders.
                </p>
              </div>
            ) : (
              stats.upcomingCalendarEntries.map((entry) => (
                <div
                  key={entry.date}
                  className="rounded-xl border border-border/75 bg-background/55 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {formatReadableDate(entry.date, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {entry.isImportant && (
                      <Badge variant="warning" className="text-[11px]">
                        {entry.label || 'Important'}
                      </Badge>
                    )}
                  </div>
                  <p className="break-words text-xs sm:text-sm text-foreground/90">
                    {entry.note || entry.label || 'Marked important date'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
