import { useState } from 'react';
import { 
  Check, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Laptop, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Task, UrgencyLevel } from '../types/task';
import { formatCountdown, formatDateTime, getUrgencyLevel } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  currentTimeTick: number; // passed down to trigger re-renders for countdowns
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [expandedNotes, setExpandedNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  const urgency: UrgencyLevel = task.completed ? 'normal' : getUrgencyLevel(task.dueDate);
  const countdown = formatCountdown(task.dueDate);

  // Dynamic urgency themes matching specs:
  // Red = due within 48 hours or overdue
  // Yellow = within 7 days
  // Green = later
  const getUrgencyClasses = () => {
    if (task.completed) {
      return {
        cardBorder: 'border-zinc-800 bg-zinc-900/40 opacity-75',
        accentBar: 'bg-zinc-700',
        badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        countdownColor: 'text-zinc-400 bg-zinc-800/80',
      };
    }

    if (urgency === 'overdue' || urgency === 'critical') {
      return {
        cardBorder: 'border-rose-500/50 bg-gradient-to-br from-rose-950/25 via-zinc-900/90 to-zinc-950 shadow-lg shadow-rose-950/20 hover:border-rose-400',
        accentBar: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
        countdownColor: countdown.isOverdue 
          ? 'text-rose-200 bg-rose-600/30 border border-rose-500/60 animate-pulse font-semibold'
          : 'text-rose-300 bg-rose-500/20 border border-rose-500/40 font-semibold',
      };
    }

    if (urgency === 'warning') {
      return {
        cardBorder: 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-zinc-900/90 to-zinc-950 hover:border-amber-400/80',
        accentBar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        countdownColor: 'text-amber-300 bg-amber-500/15 border border-amber-500/30 font-medium',
      };
    }

    // Normal / Green (due > 7 days)
    return {
      cardBorder: 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-zinc-900/90 to-zinc-950 hover:border-emerald-500/60',
      accentBar: 'bg-emerald-500',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      countdownColor: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/25',
    };
  };

  const style = getUrgencyClasses();

  const handleShareToWhatsApp = () => {
    const text = `📌 *DueDate Reminder*\nTask: ${task.title}\nCourse: ${task.course} (${task.source})\nType: ${task.type}\nDue: ${formatDateTime(task.dueDate)} (${countdown.text})\n${task.notes ? `Notes: ${task.notes}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${style.cardBorder}`}
    >
      {/* Urgency indicator strip on left edge */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all ${style.accentBar}`}
      />

      <div className="pl-2">
        {/* Top Header: Source, Course, Type & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Source Tag: College vs Online Degree */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${
                task.source === 'College'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              }`}
            >
              {task.source === 'College' ? (
                <GraduationCap className="w-3.5 h-3.5" />
              ) : (
                <Laptop className="w-3.5 h-3.5" />
              )}
              {task.source}
            </span>

            {/* Task Type Tag */}
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {task.type}
            </span>

            {/* Course Tag */}
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/40 max-w-[200px] truncate" title={task.course}>
              {task.course}
            </span>
          </div>

          {/* Action icons (Edit, WhatsApp copy, Delete) */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleShareToWhatsApp}
              title="Copy formatted summary to paste into WhatsApp or notes"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Share"
            >
              {copied ? (
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied!
                </span>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(task)}
              title="Delete task"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Title & Checkbox */}
        <div className="flex items-start gap-3 my-2">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
              task.completed
                ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-sm'
                : 'border-zinc-600 hover:border-zinc-400 bg-zinc-800/60 text-transparent hover:text-zinc-400'
            }`}
            title={task.completed ? 'Mark as incomplete' : 'Mark as done'}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark done'}
          >
            {task.completed ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold leading-snug break-words ${
                task.completed ? 'line-through text-zinc-400' : 'text-zinc-100'
              }`}
            >
              {task.title}
            </h3>
          </div>
        </div>

        {/* Due Date & Countdown Row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatDateTime(task.dueDate)}</span>
          </div>

          {/* Live Urgency Countdown Badge */}
          {!task.completed ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono tracking-tight ${style.countdownColor}`}
            >
              {countdown.isOverdue ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{countdown.text}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </div>
          )}
        </div>

        {/* Optional Notes Section */}
        {task.notes && (
          <div className="mt-2.5">
            <button
              onClick={() => setExpandedNotes(!expandedNotes)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>{expandedNotes ? 'Hide notes' : 'View notes'}</span>
              {expandedNotes ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {expandedNotes && (
              <div className="mt-2 p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
                {task.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
