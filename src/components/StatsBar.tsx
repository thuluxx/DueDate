import { AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Task } from '../types/task';
import { getUrgencyLevel } from '../utils/dateUtils';

interface StatsBarProps {
  tasks: Task[];
  onSelectUrgency: (urgency: 'critical' | 'warning' | 'normal' | 'completed' | 'all') => void;
  activeFilterUrgency: string;
  isCompletedView: boolean;
}

export function StatsBar({
  tasks,
  onSelectUrgency,
  activeFilterUrgency,
  isCompletedView,
}: StatsBarProps) {
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const criticalCount = activeTasks.filter(
    (t) => getUrgencyLevel(t.dueDate) === 'critical' || getUrgencyLevel(t.dueDate) === 'overdue'
  ).length;

  const warningCount = activeTasks.filter(
    (t) => getUrgencyLevel(t.dueDate) === 'warning'
  ).length;

  const normalCount = activeTasks.filter(
    (t) => getUrgencyLevel(t.dueDate) === 'normal'
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {/* Red Card: <48h or Overdue */}
      <button
        onClick={() => onSelectUrgency('critical')}
        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
          !isCompletedView && activeFilterUrgency === 'critical'
            ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500'
            : 'border-rose-500/30 bg-rose-950/20 hover:border-rose-500/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            &lt;48h / Overdue
          </span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-rose-200 font-mono">
            {criticalCount}
          </span>
          <span className="text-[11px] text-rose-300/70">critical</span>
        </div>
      </button>

      {/* Yellow Card: Within 7 Days */}
      <button
        onClick={() => onSelectUrgency('warning')}
        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
          !isCompletedView && activeFilterUrgency === 'warning'
            ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500'
            : 'border-amber-500/30 bg-amber-950/20 hover:border-amber-500/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            Within 7 Days
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-amber-200 font-mono">
            {warningCount}
          </span>
          <span className="text-[11px] text-amber-300/70">this week</span>
        </div>
      </button>

      {/* Green Card: Later (>7 Days) */}
      <button
        onClick={() => onSelectUrgency('normal')}
        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
          !isCompletedView && activeFilterUrgency === 'normal'
            ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500'
            : 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Later (&gt;7d)
          </span>
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-emerald-200 font-mono">
            {normalCount}
          </span>
          <span className="text-[11px] text-emerald-300/70">upcoming</span>
        </div>
      </button>

      {/* Completed Count Card */}
      <button
        onClick={() => onSelectUrgency('completed')}
        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
          isCompletedView
            ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Completed
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-zinc-200 font-mono">
            {completedTasks.length}
          </span>
          <span className="text-[11px] text-zinc-500">done</span>
        </div>
      </button>
    </div>
  );
}
