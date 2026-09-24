import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  GraduationCap, 
  Laptop, 
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { TaskFilter, TaskSource, TaskType, UrgencyLevel } from '../types/task';

interface FilterBarProps {
  filter: TaskFilter;
  onFilterChange: (newFilter: TaskFilter) => void;
  availableCourses: string[];
  totalTasksCount: number;
  filteredTasksCount: number;
  onResetFilters: () => void;
}

export function FilterBar({
  filter,
  onFilterChange,
  availableCourses,
  totalTasksCount,
  filteredTasksCount,
  onResetFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    filter.search !== '' ||
    filter.source !== 'All' ||
    filter.course !== 'All' ||
    filter.type !== 'All' ||
    filter.urgency !== 'All';

  return (
    <div className="space-y-3 bg-zinc-900/70 p-3.5 sm:p-4 rounded-2xl border border-zinc-800">
      {/* Top row: Search input & Source Selector Pills */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            placeholder="Search by task title, course, or notes..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-950 border border-zinc-700/70 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Source Pills (Offline College vs Online Degree) */}
        <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto w-full sm:w-auto">
          {(['All', 'College', 'Online Degree'] as const).map((s) => {
            const isSelected = filter.source === s;
            return (
              <button
                key={s}
                onClick={() => onFilterChange({ ...filter, source: s })}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? s === 'College'
                      ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-sm'
                      : s === 'Online Degree'
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s === 'College' && <GraduationCap className="w-3.5 h-3.5" />}
                {s === 'Online Degree' && <Laptop className="w-3.5 h-3.5" />}
                {s === 'College' ? 'College' : s === 'Online Degree' ? 'Online' : 'Both Degrees'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Second row: Dropdowns for Course, Type, Urgency & Reset */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60">
        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Course:
          </label>
          <select
            value={filter.course}
            onChange={(e) => onFilterChange({ ...filter, course: e.target.value })}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
          >
            <option value="All">All Courses</option>
            {availableCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Task Type Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Type:
          </label>
          <select
            value={filter.type}
            onChange={(e) => onFilterChange({ ...filter, type: e.target.value as TaskType | 'All' })}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Assignment">Assignment</option>
            <option value="Quiz">Quiz</option>
            <option value="Exam">Exam</option>
            <option value="Project">Project</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Urgency Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Urgency:
          </label>
          <select
            value={filter.urgency}
            onChange={(e) => onFilterChange({ ...filter, urgency: e.target.value as UrgencyLevel | 'All' })}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="All">All Urgencies</option>
            <option value="critical">🔴 Due &lt;48h / Overdue</option>
            <option value="warning">🟡 Due within 7 days</option>
            <option value="normal">🟢 Later (&gt;7 days)</option>
          </select>
        </div>

        {/* Filter Summary & Reset Button */}
        {hasActiveFilters && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">
              Showing {filteredTasksCount} of {totalTasksCount}
            </span>
            <button
              onClick={onResetFilters}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
