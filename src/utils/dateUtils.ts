import { UrgencyLevel } from '../types/task';

/**
 * Returns the urgency level based on the deadline:
 * - 'overdue': past due date (treated with Red styling)
 * - 'critical': due within 48 hours (Red)
 * - 'warning': due within 7 days (Yellow)
 * - 'normal': due after 7 days (Green)
 */
export function getUrgencyLevel(dueDateString: string): UrgencyLevel {
  const now = Date.now();
  const due = new Date(dueDateString).getTime();
  const diffMs = due - now;

  if (isNaN(due)) return 'normal';
  if (diffMs < 0) return 'overdue';
  
  const hours = diffMs / (1000 * 60 * 60);
  if (hours <= 48) return 'critical';
  if (hours <= 24 * 7) return 'warning';
  return 'normal';
}

/**
 * Formats a live countdown string like "2d 5h left", "14h 22m left", or "Overdue by 3h 10m"
 */
export function formatCountdown(dueDateString: string): {
  text: string;
  isOverdue: boolean;
  hoursLeft: number;
} {
  const now = Date.now();
  const due = new Date(dueDateString).getTime();

  if (isNaN(due)) {
    return { text: 'Invalid date', isOverdue: false, hoursLeft: 9999 };
  }

  const diffMs = due - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const seconds = Math.floor((absDiff / 1000) % 60);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (isOverdue) {
    if (days > 0) {
      return {
        text: `Overdue by ${days}d ${hours}h`,
        isOverdue: true,
        hoursLeft: -Math.abs(diffMs / 3600000),
      };
    }
    if (hours > 0) {
      return {
        text: `Overdue by ${hours}h ${minutes}m`,
        isOverdue: true,
        hoursLeft: -Math.abs(diffMs / 3600000),
      };
    }
    return {
      text: `Overdue by ${minutes}m ${seconds}s`,
      isOverdue: true,
      hoursLeft: -Math.abs(diffMs / 3600000),
    };
  }

  // Not overdue
  if (days > 0) {
    return {
      text: `${days}d ${hours}h left`,
      isOverdue: false,
      hoursLeft: diffMs / 3600000,
    };
  }
  if (hours > 0) {
    return {
      text: `${hours}h ${minutes}m left`,
      isOverdue: false,
      hoursLeft: diffMs / 3600000,
    };
  }
  if (minutes > 0) {
    return {
      text: `${minutes}m ${seconds}s left`,
      isOverdue: false,
      hoursLeft: diffMs / 3600000,
    };
  }
  return {
    text: `${seconds}s left!`,
    isOverdue: false,
    hoursLeft: diffMs / 3600000,
  };
}

/**
 * Human-friendly date and time display: "Fri, Sep 26 • 11:59 PM"
 */
export function formatDateTime(dueDateString: string): string {
  const date = new Date(dueDateString);
  if (isNaN(date.getTime())) return dueDateString;

  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dateStr} • ${timeStr}`;
}

/**
 * Formats a Date to ISO local string compatible with <input type="datetime-local">
 * e.g. "2026-09-24T23:59"
 */
export function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Generates quick shortcut dates (e.g., Today 23:59, Tomorrow 23:59)
 */
export function getQuickDatePresets(): Array<{ label: string; value: string }> {
  const now = new Date();

  // Today 23:59
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 0, 0);

  // Tomorrow 23:59
  const tomorrowEnd = new Date(now);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(23, 59, 0, 0);

  // In 3 days 23:59
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  in3Days.setHours(23, 59, 0, 0);

  // Upcoming Sunday 23:59
  const sunday = new Date(now);
  const dayOfWeek = sunday.getDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : (7 - dayOfWeek);
  sunday.setDate(sunday.getDate() + daysUntilSunday);
  sunday.setHours(23, 59, 0, 0);

  return [
    { label: 'Today 23:59', value: toDatetimeLocalString(todayEnd) },
    { label: 'Tomorrow 23:59', value: toDatetimeLocalString(tomorrowEnd) },
    { label: 'In 3 Days', value: toDatetimeLocalString(in3Days) },
    { label: 'This Sunday', value: toDatetimeLocalString(sunday) },
  ];
}

/**
 * Checks if a date falls on the exact same calendar day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Returns the 7 days of the current week (Monday through Sunday)
 */
export function getDaysOfCurrentWeek(): Array<{
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayName: string; // "Mon", "Tue"
  dayNumber: number; // 24
  monthName: string; // "Sep"
  isToday: boolean;
  isPast: boolean;
}> {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = (currentDay + 6) % 7; // Monday is 0, Tuesday is 1...

  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateKey = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;

    days.push({
      date: day,
      dateKey,
      dayName: day.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: day.getDate(),
      monthName: day.toLocaleDateString(undefined, { month: 'short' }),
      isToday: isSameDay(day, now),
      isPast: day.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
    });
  }

  return days;
}
