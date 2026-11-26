import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CheckCheck, Plus, Search } from 'lucide-react';
import { useDailyAct } from '@/context/DailyActContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskRow } from '@/components/TaskRow';
import { TaskFormDialog } from '@/components/TaskFormDialog';

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
const DIFFICULTY_RANK = { hard: 3, medium: 2, easy: 1 };

export function TasksPage({ externalCreateOpen, onExternalCreateClose }) {
  const { tasks, addTask, updateTask, toggleTaskComplete, deleteTask } = useDailyAct();

  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Brief settle set so users clearly see the smooth strikethrough + fade before a task exits a filtered tab
  const [settlingIds, setSettlingIds] = useState(() => new Set());
  const timersRef = useRef(new Map());

  useEffect(() => {
    if (externalCreateOpen) {
      setEditingTask(null);
      setDialogOpen(true);
      onExternalCreateClose?.();
    }
  }, [externalCreateOpen, onExternalCreateClose]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  const handleToggleComplete = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    const willComplete = target && target.status !== 'completed';

    // Cancel any existing timer for this task
    if (timersRef.current.has(taskId)) {
      clearTimeout(timersRef.current.get(taskId));
      timersRef.current.delete(taskId);
    }

    if (willComplete && (filterTab === 'pending' || filterTab === 'in_progress')) {
      setSettlingIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });
      const timerId = setTimeout(() => {
        setSettlingIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        timersRef.current.delete(taskId);
      }, 480);
      timersRef.current.set(taskId, timerId);
    } else {
      setSettlingIds((prev) => {
        if (!prev.has(taskId)) return prev;
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }

    toggleTaskComplete(taskId);
  };

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = tasks.filter((task) => {
      const matchesTab =
        filterTab === 'all' ||
        task.status === filterTab ||
        settlingIds.has(task.id);
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.category && task.category.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'priority') {
        return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
      }
      if (sortBy === 'difficulty') {
        return (DIFFICULTY_RANK[b.difficulty] || 0) - (DIFFICULTY_RANK[a.difficulty] || 0);
      }
      if (sortBy === 'due') {
        if (a.dueDate && b.dueDate) {
          const aKey = `${a.dueDate}T${a.dueTime || '23:59'}`;
          const bKey = `${b.dueDate}T${b.dueTime || '23:59'}`;
          return aKey.localeCompare(bKey);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filterTab, searchQuery, sortBy, settlingIds]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (formData) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
  };

  return (
    <section aria-labelledby="tasks-heading" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1
            id="tasks-heading"
            className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Tasks & Priorities
          </h1>
          <p className="text-sm text-muted-foreground">
            Track priority, difficulty, and deadlines. Check tasks off with calm precision.
          </p>
        </div>

        <Button type="button" onClick={handleOpenCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Task
        </Button>
      </div>

      {/* Filter Tabs + Search & Sort Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/85 p-3.5 shadow-soft dark:shadow-soft-dark lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full lg:w-auto">
          <TabsList className="grid w-full grid-cols-2 gap-1 sm:inline-flex sm:w-auto">
            <TabsTrigger value="all">
              All <span className="text-xs opacity-75">({counts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending <span className="text-xs opacity-75">({counts.pending})</span>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress <span className="text-xs opacity-75">({counts.in_progress})</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <span className="text-xs opacity-75">({counts.completed})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search tasks"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Sort tasks">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort: Newest</SelectItem>
              <SelectItem value="priority">Sort: Importance</SelectItem>
              <SelectItem value="difficulty">Sort: Difficulty</SelectItem>
              <SelectItem value="due">Sort: Due Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CheckCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-foreground">No matching tasks</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {searchQuery
              ? 'Try clearing your search filter or switching task sections.'
              : 'Add a task with priority, difficulty, and an optional time limit.'}
          </p>
          {!searchQuery && (
            <Button type="button" variant="outline" className="mt-4" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onStatusChange={(id, status) => updateTask(id, { status })}
                onEdit={handleOpenEdit}
                onDelete={deleteTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialTask={editingTask}
        onSubmit={handleDialogSubmit}
      />
    </section>
  );
}
