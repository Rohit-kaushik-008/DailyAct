import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flag, Gauge, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getDeadlineMeta } from '@/lib/dates';
import { cn } from '@/lib/utils';

const PRIORITY_META = {
  low: { label: 'Low Priority', variant: 'outline' },
  medium: { label: 'Medium Priority', variant: 'secondary' },
  high: { label: 'High Priority', variant: 'warning' },
  critical: { label: 'Critical', variant: 'destructive' },
};

const DIFFICULTY_META = {
  easy: { label: 'Easy', variant: 'positive' },
  medium: { label: 'Moderate', variant: 'info' },
  hard: { label: 'Hard', variant: 'warning' },
};

const STATUS_META = {
  pending: { label: 'Pending', next: 'in_progress', variant: 'outline' },
  in_progress: { label: 'In Progress', next: 'completed', variant: 'info' },
  completed: { label: 'Completed', next: 'pending', variant: 'positive' },
};

export function TaskRow({
  task,
  onToggleComplete,
  onStatusChange,
  onEdit,
  onDelete,
  compact = false,
}) {
  const isCompleted = task.status === 'completed';
  const priorityInfo = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const difficultyInfo = DIFFICULTY_META[task.difficulty] || DIFFICULTY_META.medium;
  const statusInfo = STATUS_META[task.status] || STATUS_META.pending;
  const deadline = getDeadlineMeta(task.dueDate, task.dueTime);

  const cycleQuickStatus = () => {
    const next = task.status === 'pending' ? 'in_progress' : 'pending';
    onStatusChange(task.id, next);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isCompleted ? 0.8 : 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        'dailyact-surface group flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-soft transition-colors hover:border-primary/35 dark:shadow-soft-dark',
        isCompleted && 'bg-card/65',
        compact && 'p-3.5'
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          id={`task-check-${task.id}`}
          checked={isCompleted}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label={isCompleted ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as completed`}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <label
            htmlFor={`task-check-${task.id}`}
            className="min-w-0 flex-1 cursor-pointer text-sm sm:text-[15px] font-medium leading-snug text-foreground"
          >
            <span className="task-strike-text break-words" data-completed={isCompleted ? 'true' : 'false'}>
              {task.title}
            </span>
          </label>

          {!compact && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(task)}
                aria-label={`Edit task "${task.title}"`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(task.id)}
                aria-label={`Delete task "${task.title}"`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {task.description && !compact && (
          <p
            className="task-meta-faded break-words text-xs sm:text-sm leading-relaxed text-muted-foreground"
            data-completed={isCompleted ? 'true' : 'false'}
          >
            {task.description}
          </p>
        )}

        <div
          className="task-meta-faded flex flex-wrap items-center gap-1.5 pt-0.5"
          data-completed={isCompleted ? 'true' : 'false'}
        >
          {!isCompleted && onStatusChange ? (
            <button
              type="button"
              onClick={cycleQuickStatus}
              title="Click to switch between Pending and In Progress"
              className="dailyact-focus inline-flex items-center rounded-full"
            >
              <Badge
                variant={statusInfo.variant}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                {statusInfo.label}
              </Badge>
            </button>
          ) : (
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          )}

          <Badge variant={priorityInfo.variant}>
            <Flag className="h-3 w-3" aria-hidden="true" />
            {priorityInfo.label}
          </Badge>

          <Badge variant={difficultyInfo.variant}>
            <Gauge className="h-3 w-3" aria-hidden="true" />
            {difficultyInfo.label}
          </Badge>

          {deadline && (
            <Badge
              variant={
                isCompleted
                  ? 'outline'
                  : deadline.urgency === 'overdue'
                    ? 'destructive'
                    : deadline.urgency === 'urgent' || deadline.urgency === 'today'
                      ? 'warning'
                      : 'outline'
              }
            >
              <Clock className="h-3 w-3" aria-hidden="true" />
              {deadline.label}
            </Badge>
          )}

          {task.category && !compact && (
            <Badge variant="outline" className="text-[11px]">
              {task.category}
            </Badge>
          )}
        </div>
      </div>
    </motion.article>
  );
}
