/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DueDate - Dual-Degree Deadline Tracker
 * Tailored for college students managing offline engineering and online data science coursework.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  CalendarDays, 
  Layers, 
  CheckCircle2, 
  GraduationCap, 
  Laptop, 
  RotateCcw, 
  Download, 
  Upload, 
  Sparkles, 
  Filter, 
  AlertCircle,
  Clock,
  Coffee,
  Check,
  MoreVertical,
  HelpCircle
} from 'lucide-react';

import { Task, TaskFilter, TaskSource, TaskType, UrgencyLevel } from './types/task';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  exportTasksToJSON, 
  getDefaultSeedTasks 
} from './utils/storage';
import { getUrgencyLevel } from './utils/dateUtils';

import { TaskCard } from './components/TaskCard';
import { TaskFormModal } from './components/TaskFormModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { WeekView } from './components/WeekView';
import { FilterBar } from './components/FilterBar';
import { StatsBar } from './components/StatsBar';
import { Toast } from './components/Toast';

type ViewMode = 'urgent' | 'week' | 'completed';

export default function App() {
  // 1. Core State
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [viewMode, setViewMode] = useState<ViewMode>('urgent');
  const [currentTimeTick, setCurrentTimeTick] = useState<number>(Date.now());

  // 2. Filter State
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    source: 'All',
    course: 'All',
    type: 'All',
    urgency: 'All',
  });

  // 3. Modal & Interaction State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // 4. Toast State for Undo Actions
  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync tasks to LocalStorage on every state update
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Live timer tick every 15 seconds to update countdowns in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeTick(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute unique courses list for filter dropdown and autocomplete suggestions
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.course?.trim()) set.add(t.course.trim());
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Handle Mark Done / Undo Toggle
  const handleToggleComplete = useCallback((id: string) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === id);
      if (taskIndex === -1) return prev;

      const target = prev[taskIndex];
      const willBeCompleted = !target.completed;

      const updated = [...prev];
      updated[taskIndex] = {
        ...target,
        completed: willBeCompleted,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      };

      // Trigger undo toast
      if (willBeCompleted) {
        setToast({
          message: `Completed "${target.title}"`,
          undo: () => {
            setTasks((curr) =>
              curr.map((t) => (t.id === id ? { ...t, completed: false, completedAt: undefined } : t))
            );
            setToast(null);
          },
        });
      }

      return updated;
    });
  }, []);

  // Handle Create or Update Task
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                ...taskData,
              }
            : t
        )
      );
      setToast({ message: `Updated "${taskData.title}"` });
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      setToast({ message: `Added "${taskData.title}"` });
    }
    setEditingTask(null);
  };

  // Open Edit Modal
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (!deletingTask) return;
    const taskToDelete = deletingTask;

    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    setDeletingTask(null);

    // Provide undo capability for accidental deletions
    setToast({
      message: `Deleted "${taskToDelete.title}"`,
      undo: () => {
        setTasks((prev) => [taskToDelete, ...prev]);
        setToast(null);
      },
    });
  };

  // Reset to default seed tasks (helpful for demo or testing)
  const handleResetToSeedData = () => {
    if (window.confirm('Reset all tasks to sample dual-degree deadlines?')) {
      const sample = getDefaultSeedTasks();
      setTasks(sample);
      setToast({ message: 'Reset to sample deadlines' });
    }
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          setToast({ message: `Imported ${parsed.length} tasks successfully` });
        } else {
          alert('Invalid JSON file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // View mode matching: completed tab only shows completed; others show incomplete
      if (viewMode === 'completed') {
        if (!t.completed) return false;
      } else {
        if (t.completed) return false;
      }

      // Search filter (title, course, notes)
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCourse = t.course.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchNotes) return false;
      }

      // Source filter
      if (filter.source !== 'All' && t.source !== filter.source) {
        return false;
      }

      // Course filter
      if (filter.course !== 'All' && t.course !== filter.course) {
        return false;
      }

      // Type filter
      if (filter.type !== 'All' && t.type !== filter.type) {
        return false;
      }

      // Urgency filter (critical, warning, normal)
      if (filter.urgency !== 'All') {
        const u = getUrgencyLevel(t.dueDate);
        if (filter.urgency === 'critical') {
          if (u !== 'critical' && u !== 'overdue') return false;
        } else if (filter.urgency !== u) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, viewMode, filter]);

  // Urgency sorted tasks for the main Dashboard view:
  // 1. Overdue tasks first (oldest overdue first)
  // 2. Upcoming tasks sorted by soonest deadline
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const now = Date.now();
      const timeA = new Date(a.dueDate).getTime();
      const timeB = new Date(b.dueDate).getTime();

      const diffA = timeA - now;
      const diffB = timeB - now;

      const isOverdueA = diffA < 0;
      const isOverdueB = diffB < 0;

      // Both overdue: most overdue first
      if (isOverdueA && isOverdueB) {
        return timeA - timeB;
      }
      // Only A overdue -> A comes first
      if (isOverdueA) return -1;
      // Only B overdue -> B comes first
      if (isOverdueB) return 1;

      // Neither overdue: soonest deadline first
      return timeA - timeB;
    });
  }, [filteredTasks]);

  // Quick stat filter click handler
  const handleSelectUrgencyFromStats = (
    u: 'critical' | 'warning' | 'normal' | 'completed' | 'all'
  ) => {
    if (u === 'completed') {
      setViewMode('completed');
      setFilter((prev) => ({ ...prev, urgency: 'All' }));
    } else if (u === 'all') {
      setViewMode('urgent');
      setFilter((prev) => ({ ...prev, urgency: 'All' }));
    } else {
      setViewMode('urgent');
      setFilter((prev) => ({ ...prev, urgency: u }));
    }
  };

  const activeIncompleteCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-24 sm:pb-16 selection:bg-amber-500/20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-black text-zinc-950 shadow-md shadow-amber-500/20 text-lg tracking-tight">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-100">
                  DueDate
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <GraduationCap className="w-3 h-3 text-blue-400" /> Offline Engg +
                  <Laptop className="w-3 h-3 text-purple-400" /> Online Data Sci
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden xs:block">
                Unified deadline tracker for dual-degree life
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Backup / Restore dropdown */}
            <div className="relative group">
              <button
                className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors"
                title="Data & Backup Options"
                aria-label="Backup options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 hidden group-hover:block group-focus-within:block z-50">
                <button
                  onClick={() => exportTasksToJSON(tasks)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg text-left transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" /> Export JSON Backup
                </button>
                <label className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg text-left cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" /> Import JSON Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
                <div className="my-1 border-t border-zinc-800" />
                <button
                  onClick={handleResetToSeedData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-950/40 rounded-lg text-left transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Sample Data
                </button>
              </div>
            </div>

            {/* Primary Add Task Button */}
            <button
              onClick={() => {
                setEditingTask(null);
                setIsFormModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-5">
        {/* Urgency Quick Stats Bar */}
        <StatsBar
          tasks={tasks}
          onSelectUrgency={handleSelectUrgencyFromStats}
          activeFilterUrgency={filter.urgency}
          isCompletedView={viewMode === 'completed'}
        />

        {/* View Mode Tabs: Urgency Dashboard vs This Week vs Completed */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
            {/* Urgency Dashboard Tab */}
            <button
              onClick={() => setViewMode('urgent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'urgent'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Urgency View</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-950/20 font-bold">
                {activeIncompleteCount}
              </span>
            </button>

            {/* This Week Tab */}
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>This Week</span>
            </button>

            {/* Completed Tab */}
            <button
              onClick={() => setViewMode('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'completed'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-950/20 font-bold">
                {completedCount}
              </span>
            </button>
          </div>

          {/* College vs Online breakdown pill on desktop */}
          <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              College: {tasks.filter((t) => !t.completed && t.source === 'College').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Online: {tasks.filter((t) => !t.completed && t.source === 'Online Degree').length}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar (Active across all views) */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          availableCourses={availableCourses}
          totalTasksCount={viewMode === 'completed' ? completedCount : activeIncompleteCount}
          filteredTasksCount={sortedTasks.length}
          onResetFilters={() =>
            setFilter({
              search: '',
              source: 'All',
              course: 'All',
              type: 'All',
              urgency: 'All',
            })
          }
        />

        {/* Dynamic View Sections */}
        {viewMode === 'week' ? (
          <WeekView
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditClick}
            onDelete={(task) => setDeletingTask(task)}
            currentTimeTick={currentTimeTick}
          />
        ) : (
          /* Cards Grid: Urgency View or Completed View */
          <div className="space-y-4">
            {sortedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditClick}
                    onDelete={(t) => setDeletingTask(t)}
                    currentTimeTick={currentTimeTick}
                  />
                ))}
              </div>
            ) : (
              /* Thoughtful Empty States per requirement */
              <div className="py-16 px-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-center">
                {viewMode === 'completed' ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-3">
                      <CheckCircle2 className="w-7 h-7 text-zinc-500" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-200">No completed tasks yet</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                      Check off deadlines as you submit them on college portals or online forums.
                    </p>
                  </>
                ) : filter.search || filter.source !== 'All' || filter.course !== 'All' || filter.type !== 'All' || filter.urgency !== 'All' ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-3">
                      <Filter className="w-7 h-7 text-zinc-500" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-200">No matching deadlines</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                      No tasks matched your search or filters.
                    </p>
                    <button
                      onClick={() =>
                        setFilter({
                          search: '',
                          source: 'All',
                          course: 'All',
                          type: 'All',
                          urgency: 'All',
                        })
                      }
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                      <Coffee className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100">Nothing due. Enjoy the break.</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md">
                      You are completely caught up across both your college engineering and online data science degrees!
                    </p>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsFormModalOpen(true);
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> Add A New Deadline
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button for mobile screen convenience */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => {
            setEditingTask(null);
            setIsFormModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-amber-400 text-zinc-950 shadow-2xl shadow-amber-500/50 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Add Task"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Task Form Modal (Add / Edit) */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        existingTasks={tasks}
        availableCourses={availableCourses}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingTask}
        task={deletingTask}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />

      {/* Toast with Undo */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
