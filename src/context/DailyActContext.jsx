import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addDaysToDateString, toLocalDateString } from '@/lib/dates';

const STORAGE_KEY = 'dailyact_state_v1';
const THEME_KEY = 'dailyact_theme';

const DailyActContext = createContext(null);

function createSeedState() {
  const now = new Date();
  const today = toLocalDateString(now);
  const tomorrow = addDaysToDateString(now, 1);
  const inTwoDays = addDaysToDateString(now, 2);
  const inFiveDays = addDaysToDateString(now, 5);

  const initialTasks = [
    {
      id: 'task-1',
      title: 'Finalize Q4 quiet focus roadmap',
      description: 'Review key milestones, assign time blocks, and trim low-impact meetings.',
      status: 'in_progress',
      priority: 'critical',
      difficulty: 'hard',
      dueDate: today,
      dueTime: '17:00',
      category: 'Work',
      createdAt: new Date(now.getTime() - 3600 * 1000 * 5).toISOString(),
      completedAt: null,
    },
    {
      id: 'task-2',
      title: '30-minute evening walk without phone',
      description: 'Step outside around sunset to reset attention and decompress.',
      status: 'pending',
      priority: 'high',
      difficulty: 'easy',
      dueDate: today,
      dueTime: '18:30',
      category: 'Wellness',
      createdAt: new Date(now.getTime() - 3600 * 1000 * 4).toISOString(),
      completedAt: null,
    },
    {
      id: 'task-3',
      title: 'Refactor API validation module',
      description: 'Clean up schema edge cases and verify unit test coverage.',
      status: 'pending',
      priority: 'high',
      difficulty: 'medium',
      dueDate: tomorrow,
      dueTime: '11:30',
      category: 'Focus',
      createdAt: new Date(now.getTime() - 3600 * 1000 * 3).toISOString(),
      completedAt: null,
    },
    {
      id: 'task-4',
      title: 'Prepare healthy grocery checklist',
      description: 'Whole grains, leafy greens, herbal tea, and berries for the week.',
      status: 'completed',
      priority: 'medium',
      difficulty: 'easy',
      dueDate: today,
      dueTime: '10:00',
      category: 'Personal',
      createdAt: new Date(now.getTime() - 3600 * 1000 * 8).toISOString(),
      completedAt: new Date(now.getTime() - 3600 * 1000 * 1).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Read two chapters of Deep Work',
      description: 'Take concise margin notes on distraction-free scheduling.',
      status: 'pending',
      priority: 'low',
      difficulty: 'medium',
      dueDate: inTwoDays,
      dueTime: '21:00',
      category: 'Study',
      createdAt: new Date(now.getTime() - 3600 * 1000 * 2).toISOString(),
      completedAt: null,
    },
  ];

  const initialHabits = [
    {
      id: 'habit-1',
      title: 'Morning Mindfulness & Breathwork',
      rule: '10 minutes before checking messages (+10) · Skip morning session (-5)',
      positivePoints: 10,
      negativePoints: 5,
      positiveCount: 6,
      negativeCount: 1,
      netPoints: 55,
      currentStreak: 4,
      bestStreak: 6,
      lastActionAt: new Date(now.getTime() - 3600 * 1000 * 3).toISOString(),
      createdAt: new Date(now.getTime() - 86400 * 1000 * 7).toISOString(),
    },
    {
      id: 'habit-2',
      title: 'Zero Doomscrolling After 9 PM',
      rule: 'Keep phone outside bedroom (+15) · Scroll in bed (-10)',
      positivePoints: 15,
      negativePoints: 10,
      positiveCount: 5,
      negativeCount: 1,
      netPoints: 65,
      currentStreak: 3,
      bestStreak: 5,
      lastActionAt: new Date(now.getTime() - 3600 * 1000 * 14).toISOString(),
      createdAt: new Date(now.getTime() - 86400 * 1000 * 6).toISOString(),
    },
    {
      id: 'habit-3',
      title: 'Hydration — 2.5L Pure Water',
      rule: 'Finish daily water bottle goal (+5) · Sugary soda instead (-5)',
      positivePoints: 5,
      negativePoints: 5,
      positiveCount: 8,
      negativeCount: 0,
      netPoints: 40,
      currentStreak: 8,
      bestStreak: 8,
      lastActionAt: new Date(now.getTime() - 3600 * 1000 * 2).toISOString(),
      createdAt: new Date(now.getTime() - 86400 * 1000 * 8).toISOString(),
    },
  ];

  const initialHabitLogs = [
    {
      id: 'log-1',
      habitId: 'habit-3',
      habitTitle: 'Hydration — 2.5L Pure Water',
      type: 'positive',
      delta: 5,
      timestamp: new Date(now.getTime() - 3600 * 1000 * 2).toISOString(),
    },
    {
      id: 'log-2',
      habitId: 'habit-1',
      habitTitle: 'Morning Mindfulness & Breathwork',
      type: 'positive',
      delta: 10,
      timestamp: new Date(now.getTime() - 3600 * 1000 * 3).toISOString(),
    },
    {
      id: 'log-3',
      habitId: 'habit-2',
      habitTitle: 'Zero Doomscrolling After 9 PM',
      type: 'positive',
      delta: 15,
      timestamp: new Date(now.getTime() - 3600 * 1000 * 14).toISOString(),
    },
  ];

  const initialCalendarNotes = {
    [today]: {
      date: today,
      isImportant: true,
      label: 'Focus Sprint',
      note: 'Protect 2 PM – 5 PM for deep roadmap work. Keep evening completely calm.',
      updatedAt: now.toISOString(),
    },
    [inTwoDays]: {
      date: inTwoDays,
      isImportant: true,
      label: 'Weekly Review',
      note: 'Review completed tasks, reset workspace, and plan next week priorities.',
      updatedAt: now.toISOString(),
    },
    [inFiveDays]: {
      date: inFiveDays,
      isImportant: false,
      label: 'Nature Walk',
      note: 'Morning botanical park trail walk with journal.',
      updatedAt: now.toISOString(),
    },
  };

  return {
    tasks: initialTasks,
    habits: initialHabits,
    habitLogs: initialHabitLogs,
    calendarNotes: initialCalendarNotes,
  };
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      habitLogs: Array.isArray(parsed.habitLogs) ? parsed.habitLogs : [],
      calendarNotes:
        parsed.calendarNotes && typeof parsed.calendarNotes === 'object' ? parsed.calendarNotes : {},
    };
  } catch {
    return createSeedState();
  }
}

function loadInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function DailyActProvider({ children }) {
  const [state, setState] = useState(loadInitialState);
  const [theme, setTheme] = useState(loadInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- Task CRUD ---
  const addTask = (taskInput) => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: taskInput.title.trim(),
      description: (taskInput.description || '').trim(),
      status: taskInput.status || 'pending',
      priority: taskInput.priority || 'medium',
      difficulty: taskInput.difficulty || 'medium',
      dueDate: taskInput.dueDate || '',
      dueTime: taskInput.dueTime || '',
      category: (taskInput.category || '').trim() || 'General',
      createdAt: new Date().toISOString(),
      completedAt: taskInput.status === 'completed' ? new Date().toISOString() : null,
      previousStatus: taskInput.status === 'completed' ? 'pending' : undefined,
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    return newTask;
  };

  const updateTask = (id, updates) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== id) return task;
        const nextStatus = updates.status ?? task.status;
        const becomingCompleted = nextStatus === 'completed' && task.status !== 'completed';
        const leavingCompleted = nextStatus !== 'completed' && task.status === 'completed';
        return {
          ...task,
          ...updates,
          title: updates.title !== undefined ? updates.title.trim() : task.title,
          description:
            updates.description !== undefined ? updates.description.trim() : task.description,
          category:
            updates.category !== undefined ? updates.category.trim() || 'General' : task.category,
          completedAt: becomingCompleted
            ? new Date().toISOString()
            : leavingCompleted
              ? null
              : task.completedAt,
          previousStatus: becomingCompleted ? task.status : task.previousStatus,
        };
      }),
    }));
  };

  const toggleTaskComplete = (id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== id) return task;
        if (task.status === 'completed') {
          const restoreStatus =
            task.previousStatus && task.previousStatus !== 'completed'
              ? task.previousStatus
              : 'pending';
          return {
            ...task,
            status: restoreStatus,
            completedAt: null,
          };
        }
        return {
          ...task,
          previousStatus: task.status,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  const deleteTask = (id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  // --- Habit CRUD & Positive/Negative Scoring ---
  const addHabit = (habitInput) => {
    const pos = Math.max(1, Number(habitInput.positivePoints) || 10);
    const neg = Math.max(1, Number(habitInput.negativePoints) || 5);
    const newHabit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: habitInput.title.trim(),
      rule: (habitInput.rule || '').trim(),
      positivePoints: pos,
      negativePoints: neg,
      positiveCount: 0,
      negativeCount: 0,
      netPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastActionAt: null,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      habits: [newHabit, ...prev.habits],
    }));
    return newHabit;
  };

  const updateHabit = (id, updates) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) => {
        if (habit.id !== id) return habit;
        return {
          ...habit,
          ...updates,
          title: updates.title !== undefined ? updates.title.trim() : habit.title,
          rule: updates.rule !== undefined ? updates.rule.trim() : habit.rule,
          positivePoints:
            updates.positivePoints !== undefined
              ? Math.max(1, Number(updates.positivePoints) || 10)
              : habit.positivePoints,
          negativePoints:
            updates.negativePoints !== undefined
              ? Math.max(1, Number(updates.negativePoints) || 5)
              : habit.negativePoints,
        };
      }),
    }));
  };

  const deleteHabit = (id) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
      habitLogs: prev.habitLogs.filter((log) => log.habitId !== id),
    }));
  };

  const recordHabitAction = (habitId, type) => {
    const timestamp = new Date().toISOString();
    setState((prev) => {
      const target = prev.habits.find((h) => h.id === habitId);
      if (!target) return prev;
      const isPositive = type === 'positive';
      const delta = isPositive ? target.positivePoints : -target.negativePoints;
      const nextStreak = isPositive ? target.currentStreak + 1 : 0;

      const updatedHabits = prev.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        return {
          ...habit,
          positiveCount: isPositive ? habit.positiveCount + 1 : habit.positiveCount,
          negativeCount: !isPositive ? habit.negativeCount + 1 : habit.negativeCount,
          netPoints: habit.netPoints + delta,
          currentStreak: nextStreak,
          bestStreak: Math.max(habit.bestStreak, nextStreak),
          lastActionAt: timestamp,
        };
      });

      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        habitId: target.id,
        habitTitle: target.title,
        type,
        delta,
        previousStreak: target.currentStreak,
        timestamp,
      };

      return {
        ...prev,
        habits: updatedHabits,
        habitLogs: [newLog, ...prev.habitLogs].slice(0, 60),
      };
    });
  };

  const undoHabitLog = (logId) => {
    setState((prev) => {
      const logToUndo = prev.habitLogs.find((l) => l.id === logId);
      if (!logToUndo) return prev;

      const isPositive = logToUndo.type === 'positive';
      const updatedHabits = prev.habits.map((habit) => {
        if (habit.id !== logToUndo.habitId) return habit;
        const revertedStreak = isPositive
          ? Math.max(0, habit.currentStreak - 1)
          : logToUndo.previousStreak ?? habit.currentStreak;
        return {
          ...habit,
          positiveCount: isPositive ? Math.max(0, habit.positiveCount - 1) : habit.positiveCount,
          negativeCount: !isPositive ? Math.max(0, habit.negativeCount - 1) : habit.negativeCount,
          netPoints: habit.netPoints - logToUndo.delta,
          currentStreak: revertedStreak,
        };
      });

      return {
        ...prev,
        habits: updatedHabits,
        habitLogs: prev.habitLogs.filter((l) => l.id !== logId),
      };
    });
  };

  // --- Calendar Important Dates & Notes ---
  const saveCalendarEntry = (dateStr, { isImportant, label, note }) => {
    const cleanLabel = (label || '').trim();
    const cleanNote = (note || '').trim();
    setState((prev) => {
      const nextNotes = { ...prev.calendarNotes };
      if (!isImportant && !cleanLabel && !cleanNote) {
        delete nextNotes[dateStr];
      } else {
        nextNotes[dateStr] = {
          date: dateStr,
          isImportant: Boolean(isImportant),
          label: cleanLabel,
          note: cleanNote,
          updatedAt: new Date().toISOString(),
        };
      }
      return { ...prev, calendarNotes: nextNotes };
    });
  };

  const deleteCalendarEntry = (dateStr) => {
    setState((prev) => {
      const nextNotes = { ...prev.calendarNotes };
      delete nextNotes[dateStr];
      return { ...prev, calendarNotes: nextNotes };
    });
  };

  const value = useMemo(
    () => ({
      tasks: state.tasks,
      habits: state.habits,
      habitLogs: state.habitLogs,
      calendarNotes: state.calendarNotes,
      theme,
      setTheme,
      toggleTheme,
      addTask,
      updateTask,
      toggleTaskComplete,
      deleteTask,
      addHabit,
      updateHabit,
      deleteHabit,
      recordHabitAction,
      undoHabitLog,
      saveCalendarEntry,
      deleteCalendarEntry,
    }),
    [state, theme]
  );

  return <DailyActContext.Provider value={value}>{children}</DailyActContext.Provider>;
}

export function useDailyAct() {
  const ctx = useContext(DailyActContext);
  if (!ctx) {
    throw new Error('useDailyAct must be used inside DailyActProvider');
  }
  return ctx;
}
