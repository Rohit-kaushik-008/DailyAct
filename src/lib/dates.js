export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(baseDate, offsetDays) {
  const copy = new Date(baseDate.getTime());
  copy.setDate(copy.getDate() + offsetDays);
  return toLocalDateString(copy);
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatReadableDate(dateStr, options) {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString(
    'en-US',
    options || { weekday: 'short', month: 'short', day: 'numeric' }
  );
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function getDeadlineMeta(dueDate, dueTime, now = new Date()) {
  if (!dueDate) return null;
  const todayStr = toLocalDateString(now);
  const tomorrowStr = addDaysToDateString(now, 1);

  const [y, m, d] = dueDate.split('-').map(Number);
  const [hh, mm] = dueTime ? dueTime.split(':').map(Number) : [23, 59];
  const target = new Date(y, m - 1, d, hh, mm, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMins = Math.round(diffMs / (1000 * 60));

  const timeLabel = dueTime ? ` · ${formatTime12h(dueTime)}` : '';

  if (diffMs < 0) {
    return {
      urgency: 'overdue',
      label: `Overdue (${formatReadableDate(dueDate, { month: 'short', day: 'numeric' })}${timeLabel})`,
      shortLabel: 'Overdue',
      timestamp: target.getTime(),
    };
  }

  if (dueDate === todayStr) {
    if (dueTime && diffMins <= 120) {
      const countdown = diffMins < 60 ? `${Math.max(1, diffMins)}m left` : `${diffHours}h left`;
      return {
        urgency: 'urgent',
        label: `Today${timeLabel} (${countdown})`,
        shortLabel: countdown,
        timestamp: target.getTime(),
      };
    }
    return {
      urgency: 'today',
      label: `Today${timeLabel}`,
      shortLabel: dueTime ? formatTime12h(dueTime) : 'Today',
      timestamp: target.getTime(),
    };
  }

  if (dueDate === tomorrowStr) {
    return {
      urgency: 'upcoming',
      label: `Tomorrow${timeLabel}`,
      shortLabel: `Tomorrow${timeLabel}`,
      timestamp: target.getTime(),
    };
  }

  return {
    urgency: 'scheduled',
    label: `${formatReadableDate(dueDate, { month: 'short', day: 'numeric' })}${timeLabel}`,
    shortLabel: formatReadableDate(dueDate, { month: 'short', day: 'numeric' }),
    timestamp: target.getTime(),
  };
}

export function getGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
