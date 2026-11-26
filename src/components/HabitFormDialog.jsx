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

const EMPTY_HABIT = {
  title: '',
  rule: '',
  positivePoints: 10,
  negativePoints: 5,
};

export function HabitFormDialog({ open, onOpenChange, initialHabit, onSubmit }) {
  const [form, setForm] = useState(EMPTY_HABIT);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialHabit) {
        setForm({
          title: initialHabit.title || '',
          rule: initialHabit.rule || '',
          positivePoints: initialHabit.positivePoints || 10,
          negativePoints: initialHabit.negativePoints || 5,
        });
      } else {
        setForm(EMPTY_HABIT);
      }
      setError('');
    }
  }, [open, initialHabit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a habit name.');
      return;
    }
    onSubmit({
      title: form.title,
      rule: form.rule,
      positivePoints: Math.max(1, Number(form.positivePoints) || 10),
      negativePoints: Math.max(1, Number(form.negativePoints) || 5),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialHabit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            Set positive points earned for completing your habit and negative points deducted if a rule is broken.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-title">Habit Name</Label>
            <Input
              id="habit-title"
              placeholder="e.g., 20-minute deep reading"
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
            <Label htmlFor="habit-rule">Habit Rule / Guideline (Optional)</Label>
            <Textarea
              id="habit-rule"
              placeholder="e.g., Read before checking social media (+10) · Skip day (-5)"
              value={form.rule}
              onChange={(e) => setForm((prev) => ({ ...prev, rule: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="habit-pos-pts">Positive Points (+)</Label>
              <Input
                id="habit-pos-pts"
                type="number"
                min={1}
                max={100}
                value={form.positivePoints}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, positivePoints: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">Awarded on each successful check-in</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="habit-neg-pts">Negative Points (-)</Label>
              <Input
                id="habit-neg-pts"
                type="number"
                min={1}
                max={100}
                value={form.negativePoints}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, negativePoints: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">Deducted if habit rule is broken</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialHabit ? 'Save Habit' : 'Create Habit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
