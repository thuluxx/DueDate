import { useMemo } from 'react';
import { 
  CalendarDays, 
  Check, 
  Clock, 
  GraduationCap, 
  Laptop, 
  AlertCircle,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { Task } from '../types/task';
import { getDaysOfCurrentWeek, isSameDay, formatCountdown, getUrgencyLevel } from '../utils/dateUtils';

interface WeekViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  currentTimeTick: number;
}

export function WeekView({
  tasks,
  onToggleComplete,
  onEdit,
  currentTimeTick,
}: WeekViewProps) {
  const daysOfWeek = useMemo(() => getDaysOfCurrentWeek(), []);

  // Filter active and completed tasks for this week
  const weekData = useMemo(() => {
    return daysOfWeek.map((dayInfo) => {
      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return isSameDay(taskDate, dayInfo.date);
      });

      // Sort by due time within the day
      dayTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      return {
        ...dayInfo,
        tasks: dayTasks,
      };
    });
  }, [daysOfWeek, tasks]);

  // Tasks due before Monday that are still incomplete
  const monday = daysOfWeek[0].date;
  const overdueEarlier = tasks.filter((t) => {
    if (t.completed) return false;
    const d = new Date(t.dueDate);
    return d.getTime() < monday.getTime();
  });

  return (
    <div className="space-y-4">
      {/* Earlier Overdue Alert if any */}
      {overdueEarlier.length > 0 && (
        <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/25 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
              {overdueEarlier.length} Unfinished Deadline{overdueEarlier.length > 1 ? 's' : ''} Prior to This Week
            </h4>
            <div className="mt-2 space-y-1.5">
              {overdueEarlier.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs bg-rose-950/40 p-2 rounded-lg border border-rose-500/20"
                >
                  <span className="font-semibold text-rose-200 truncate pr-2">
                    {t.title} <span className="text-rose-400/80 font-normal">({t.course})</span>
                  </span>
                  <button
                    onClick={() => onToggleComplete(t.id)}
                    className="shrink-0 px-2 py-0.5 rounded bg-rose-500 text-zinc-950 text-[11px] font-bold"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekData.map((day) => {
          const hasTasks = day.tasks.length > 0;
          const pendingCount = day.tasks.filter((t) => !t.completed).length;

          return (
            <div
              key={day.dateKey}
              className={`rounded-2xl border transition-all flex flex-col ${
                day.isToday
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/20 via-zinc-900 to-zinc-950 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  day.isToday
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {day.dayName}
                    </span>
                    {day.isToday && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-zinc-950">
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-zinc-100">
                    {day.monthName} {day.dayNumber}
                  </span>
                </div>

                {hasTasks && (
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      pendingCount > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {pendingCount > 0 ? `${pendingCount} due` : 'Done'}
                  </span>
                )}
              </div>

              {/* Day Task List */}
              <div className="p-2.5 flex-1 flex flex-col gap-2 min-h-[100px]">
                {hasTasks ? (
                  day.tasks.map((task) => {
                    const urgency = getUrgencyLevel(task.dueDate);
                    const timeOnly = new Date(task.dueDate).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                          task.completed
                            ? 'bg-zinc-950/50 border-zinc-800/60 opacity-60'
                            : urgency === 'critical' || urgency === 'overdue'
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                            : urgency === 'warning'
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {/* Course & Degree badge */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              task.source === 'College'
                                ? 'bg-blue-500/15 text-blue-300'
                                : 'bg-purple-500/15 text-purple-300'
                            }`}
                          >
                            {task.source === 'College' ? (
                              <GraduationCap className="w-2.5 h-2.5" />
                            ) : (
                              <Laptop className="w-2.5 h-2.5" />
                            )}
                            {task.source === 'College' ? 'Engg' : 'Data Sci'}
                          </span>

                          <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeOnly}
                          </span>
                        </div>

                        {/* Task Title */}
                        <div className="flex items-start gap-1.5 mt-1">
                          <button
                            onClick={() => onToggleComplete(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                                : 'border-zinc-600 hover:border-zinc-400'
                            }`}
                            aria-label="Toggle completed"
                          >
                            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span
                            onClick={() => onEdit(task)}
                            className={`font-medium line-clamp-2 cursor-pointer hover:underline ${
                              task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                            }`}
                            title="Click to edit task"
                          >
                            {task.title}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-3 text-center text-zinc-400 border border-dashed border-zinc-800/60 rounded-xl">
                    <CalendarCheck className="w-4 h-4 text-zinc-400 mb-1" />
                    <span className="text-[11px]">Free day</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
