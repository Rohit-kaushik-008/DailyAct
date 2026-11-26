import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, StickyNote, Trash2 } from 'lucide-react';
import { useDailyAct } from '@/context/DailyActContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatReadableDate, toLocalDateString } from '@/lib/dates';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage() {
  const { calendarNotes, saveCalendarEntry, deleteCalendarEntry } = useDailyAct();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toLocalDateString(today), [today]);

  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const existingEntry = calendarNotes[selectedDate];

  const [isImportant, setIsImportant] = useState(false);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setIsImportant(Boolean(existingEntry?.isImportant));
    setLabel(existingEntry?.label || '');
    setNote(existingEntry?.note || '');
    setSavedFeedback(false);
  }, [selectedDate, existingEntry]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(year, month, day);
      cells.push({
        day,
        dateStr: toLocalDateString(d),
      });
    }
    return cells;
  }, [viewDate]);

  const savedEntriesList = useMemo(() => {
    return Object.values(calendarNotes).sort((a, b) => a.date.localeCompare(b.date));
  }, [calendarNotes]);

  const goToMonth = (delta) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const jumpToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveCalendarEntry(selectedDate, { isImportant, label, note });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleSelectSavedDate = (dateStr) => {
    const [y, m] = dateStr.split('-').map(Number);
    if (y && m) {
      setViewDate(new Date(y, m - 1, 1));
    }
    setSelectedDate(dateStr);
  };

  const monthHeading = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section aria-labelledby="calendar-heading" className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1
          id="calendar-heading"
          className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Calendar & Notes
        </h1>
        <p className="text-sm text-muted-foreground">
          Mark important dates and keep quiet, focused notes for days that matter.
        </p>
      </div>

      {/* Main 2-column Minimalist Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Minimalist Calendar Grid */}
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              {monthHeading}
            </h2>
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={jumpToToday}>
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => goToMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => goToMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid" aria-label={monthHeading}>
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="h-11 sm:h-14" aria-hidden="true" />;
                }

                const entry = calendarNotes[cell.dateStr];
                const isSelected = selectedDate === cell.dateStr;
                const isToday = todayStr === cell.dateStr;
                const hasNote = Boolean(entry?.note);
                const markedImportant = Boolean(entry?.isImportant);

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr)}
                    aria-label={`${formatReadableDate(cell.dateStr, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}${markedImportant ? ', marked important' : ''}${hasNote ? ', has note' : ''}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'dailyact-focus relative flex h-11 flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 sm:h-14',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isToday
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/40 hover:bg-primary/20'
                          : 'bg-background/45 text-foreground hover:bg-accent/60'
                    )}
                  >
                    <span>{cell.day}</span>
                    {(markedImportant || hasNote) && (
                      <span className="mt-0.5 flex items-center gap-1" aria-hidden="true">
                        {markedImportant && (
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-amber-200' : 'bg-amber-500'
                            )}
                          />
                        )}
                        {hasNote && (
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-primary-foreground/85' : 'bg-primary'
                            )}
                          />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                Important date
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Saved note
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Selected Date Note & Important Toggle */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="font-display text-lg">
                    {formatReadableDate(selectedDate, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </CardTitle>
                  <CardDescription>
                    Mark this date or leave a personal reminder.
                  </CardDescription>
                </div>
                {existingEntry && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCalendarEntry(selectedDate)}
                    aria-label="Clear entry for this date"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/60 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Star
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isImportant ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
                      )}
                      aria-hidden="true"
                    />
                    <Label htmlFor="important-date-switch" className="cursor-pointer text-sm">
                      Mark as Important Date
                    </Label>
                  </div>
                  <Switch
                    id="important-date-switch"
                    checked={isImportant}
                    onCheckedChange={setIsImportant}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date-label">Short Label (Optional)</Label>
                  <Input
                    id="date-label"
                    placeholder="e.g., Milestone, Family Dinner, Exam"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date-note">Note for This Date</Label>
                  <Textarea
                    id="date-note"
                    placeholder="Write a calm note, reminder, or intention for this day..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs font-medium text-primary" role="status" aria-live="polite">
                    {savedFeedback ? 'Saved cleanly.' : ''}
                  </span>
                  <Button type="submit">Save Date Note</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Jump List of Marked Dates & Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <StickyNote className="h-4 w-4 text-primary" aria-hidden="true" />
                Saved Dates ({savedEntriesList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {savedEntriesList.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No marked dates or notes yet. Select any day on the calendar to add one.
                </p>
              ) : (
                savedEntriesList.map((entry) => (
                  <button
                    key={entry.date}
                    type="button"
                    onClick={() => handleSelectSavedDate(entry.date)}
                    className={cn(
                      'dailyact-focus w-full rounded-xl border p-3 text-left transition-colors',
                      selectedDate === entry.date
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border/75 bg-background/50 hover:border-primary/35'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {formatReadableDate(entry.date, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {entry.isImportant && (
                        <Badge variant="warning" className="text-[11px]">
                          {entry.label || 'Important'}
                        </Badge>
                      )}
                    </div>
                    {(entry.note || (!entry.isImportant && entry.label)) && (
                      <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">
                        {entry.note || entry.label}
                      </p>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
