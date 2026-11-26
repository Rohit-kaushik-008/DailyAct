import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toLocalDateString } from '@/lib/dates';

const CATEGORY_SUGGESTIONS = ['Work', 'Focus', 'Wellness', 'Study', 'Personal'];

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  difficulty: 'medium',
  dueDate: '',
  dueTime: '',
  category: 'Focus',
};

export function TaskFormDialog({ open, onOpenChange, initialTask, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialTask) {
        setForm({
          title: initialTask.title || '',
          description: initialTask.description || '',
          status: initialTask.status || 'pending',
          priority: initialTask.priority || 'medium',
          difficulty: initialTask.difficulty || 'medium',
          dueDate: initialTask.dueDate || '',
          dueTime: initialTask.dueTime || '',
          category: initialTask.category || 'General',
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          dueDate: toLocalDateString(new Date()),
        });
      }
      setError('');
    }
  }, [open, initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            Define priority, difficulty, and an optional time limit so your day stays focused.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="e.g., Prepare presentation outline"
              value={form.title}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }));
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Notes (Optional)</Label>
            <Textarea
              id="task-desc"
              placeholder="Brief context or acceptance checklist..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger aria-label="Task status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Importance / Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(val) => setForm((prev) => ({ ...prev, priority: val }))}
              >
                <SelectTrigger aria-label="Task priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(val) => setForm((prev) => ({ ...prev, difficulty: val }))}
              >
                <SelectTrigger aria-label="Task difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due-time">Time Limit (Optional)</Label>
              <Input
                id="task-due-time"
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm((prev) => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-category">Category</Label>
            <Input
              id="task-category"
              placeholder="e.g., Focus"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                  className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialTask ? 'Save Changes' : 'Add Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
