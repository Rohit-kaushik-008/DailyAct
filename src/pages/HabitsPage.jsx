import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame,
  History,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Sprout,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useDailyAct } from '@/context/DailyActContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HabitFormDialog } from '@/components/HabitFormDialog';
import { cn } from '@/lib/utils';

export function HabitsPage() {
  const {
    habits,
    habitLogs,
    addHabit,
    updateHabit,
    deleteHabit,
    recordHabitAction,
    undoHabitLog,
  } = useDailyAct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [recentFlash, setRecentFlash] = useState(null);

  const summary = useMemo(() => {
    const totalPositive = habits.reduce((s, h) => s + h.positiveCount * h.positivePoints, 0);
    const totalNegative = habits.reduce((s, h) => s + h.negativeCount * h.negativePoints, 0);
    const netScore = totalPositive - totalNegative;
    const topStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);
    return { totalPositive, totalNegative, netScore, topStreak };
  }, [habits]);

  const handleAction = (habitId, type) => {
    recordHabitAction(habitId, type);
    setRecentFlash({ habitId, type, ts: Date.now() });
  };

  const handleCreate = () => {
    setEditingHabit(null);
    setDialogOpen(true);
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (data) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
  };

  return (
    <section aria-labelledby="habits-heading" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1
            id="habits-heading"
            className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Habit Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Build mindful consistency — award positive points for completions and mark negative points for broken rules.
          </p>
        </div>

        <Button type="button" onClick={handleCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Habit
        </Button>
      </div>

      {/* Habit Score Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Net Score
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {summary.netScore >= 0 ? `+${summary.netScore}` : summary.netScore} pts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--nature-positive-fg))]" aria-hidden="true" />
              Positive
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[hsl(var(--nature-positive-fg))]">
              +{summary.totalPositive}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--nature-danger-fg))]" aria-hidden="true" />
              Negative
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[hsl(var(--nature-danger-fg))]">
              -{summary.totalNegative}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Top Streak
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {summary.topStreak} {summary.topStreak === 1 ? 'day' : 'days'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Habit Cards Grid */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sprout className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-foreground">No habits defined yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create a habit with custom positive and negative point values to measure every daily choice.
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={handleCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add First Habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {habits.map((habit) => {
              const isFlashing = recentFlash?.habitId === habit.id;
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                >
                  <Card
                    className={cn(
                      'flex h-full flex-col justify-between transition-colors',
                      isFlashing &&
                        recentFlash.type === 'positive' &&
                        'border-primary/55',
                      isFlashing &&
                        recentFlash.type === 'negative' &&
                        'border-destructive/55'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <CardTitle className="break-words text-base">{habit.title}</CardTitle>
                          {habit.rule && (
                            <CardDescription className="break-words text-xs leading-relaxed">
                              {habit.rule}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEdit(habit)}
                            aria-label={`Edit habit "${habit.title}"`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteHabit(habit.id)}
                            aria-label={`Delete habit "${habit.title}"`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={habit.netPoints >= 0 ? 'positive' : 'destructive'}
                          className="font-semibold"
                        >
                          Net: {habit.netPoints >= 0 ? `+${habit.netPoints}` : habit.netPoints} pts
                        </Badge>
                        <Badge variant="outline">
                          <Flame className="h-3 w-3 text-primary" aria-hidden="true" />
                          Streak: {habit.currentStreak} (Best {habit.bestStreak})
                        </Badge>
                        <Badge variant="outline">
                          {habit.positiveCount} wins · {habit.negativeCount} breaks
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleAction(habit.id, 'positive')}
                          className="badge-nature-positive h-10 justify-center font-semibold transition-transform active:scale-[0.98]"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Complete (+{habit.positivePoints})
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleAction(habit.id, 'negative')}
                          className="badge-nature-danger h-10 justify-center font-semibold transition-transform active:scale-[0.98]"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                          Rule Break (-{habit.negativePoints})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Recent Habit Log with Undo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            Recent Point Activity
          </CardTitle>
          <CardDescription>
            Every positive completion and negative rule mark is logged here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {habitLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No habit activity recorded yet. Use the buttons above to log your first try.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {habitLogs.slice(0, 8).map((log) => {
                const isPos = log.type === 'positive';
                const timeLabel = new Date(log.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {log.habitTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isPos ? 'Completed habit' : 'Rule broken'} · {timeLabel}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={isPos ? 'positive' : 'destructive'}>
                        {isPos ? `+${log.delta}` : log.delta} pts
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => undoHabitLog(log.id)}
                        aria-label={`Undo ${log.delta} point entry for ${log.habitTitle}`}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Undo
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <HabitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialHabit={editingHabit}
        onSubmit={handleDialogSubmit}
      />
    </section>
  );
}
