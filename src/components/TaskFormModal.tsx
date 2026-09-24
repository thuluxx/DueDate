import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  AlertCircle, 
  GraduationCap, 
  Laptop, 
  Check, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Task, TaskSource, TaskType } from '../types/task';
import { getQuickDatePresets, toDatetimeLocalString } from '../utils/dateUtils';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'> & { id?: string }) => void;
  initialTask?: Task | null;
  existingTasks: Task[];
  availableCourses: string[];
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSave,
  initialTask,
  existingTasks,
  availableCourses,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [source, setSource] = useState<TaskSource>('College');
  const [type, setType] = useState<TaskType>('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Quick preset dates
  const datePresets = getQuickDatePresets();

  // Preset sample courses for fast picking
  const presetSuggestions = {
    'College': ['EE302 DSP', 'EE401 Embedded Systems', 'ME204 Thermodynamics', 'CS301 OS', 'MA201 Linear Algebra'],
    'Online Degree': ['DS2001 Machine Learning', 'MA1002 Statistics', 'DS3005 Big Data', 'CS1001 Python', 'BD101 Data Warehousing']
  };

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setCourse(initialTask.course);
      setSource(initialTask.source);
      setType(initialTask.type);
      setDueDate(initialTask.dueDate);
      setNotes(initialTask.notes || '');
    } else {
      // New task default: tomorrow 23:59
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 0, 0);

      setTitle('');
      setCourse('');
      setSource('College');
      setType('Assignment');
      setDueDate(toDatetimeLocalString(tomorrow));
      setNotes('');
    }
    setErrors({});
    setDuplicateWarning(null);
  }, [initialTask, isOpen]);

  // Check for duplicate tasks as the user types
  useEffect(() => {
    if (!title.trim() || !course.trim()) {
      setDuplicateWarning(null);
      return;
    }

    const isDup = existingTasks.some(
      t => 
        (!initialTask || t.id !== initialTask.id) &&
        !t.completed &&
        t.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        t.course.trim().toLowerCase() === course.trim().toLowerCase()
    );

    if (isDup) {
      setDuplicateWarning('A task with this title and course already exists.');
    } else {
      setDuplicateWarning(null);
    }
  }, [title, course, existingTasks, initialTask]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!course.trim()) {
      newErrors.course = 'Course name or code is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date and time are required';
    } else {
      const parsed = new Date(dueDate).getTime();
      if (isNaN(parsed)) {
        newErrors.dueDate = 'Invalid date format';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      course: course.trim(),
      source,
      type,
      dueDate,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg my-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 sm:p-6 text-zinc-100 transition-all max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-zinc-100">
              {initialTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Quickly record deadlines from WhatsApp, portal notices, or notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Week 4 Graded Assignment: CNN Backprop"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border ${
                errors.title ? 'border-rose-500' : 'border-zinc-700/80 focus:border-amber-500'
              } text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all`}
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
            {duplicateWarning && (
              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {duplicateWarning}
              </p>
            )}
          </div>

          {/* Source Selection (Dropdown: College vs Online Degree) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Degree Source *
              </label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as TaskSource)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="College">College (Offline)</option>
                  <option value="Online Degree">Online Degree (Data Science)</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-zinc-400">
                  {source === 'College' ? (
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Laptop className="w-4 h-4 text-purple-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Task Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="Assignment">Assignment</option>
                <option value="Quiz">Quiz</option>
                <option value="Exam">Exam</option>
                <option value="Project">Project</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Course Name / Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Course Name / Code *
              </label>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Quick suggestions below
              </span>
            </div>
            <input
              type="text"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                if (errors.course) setErrors(prev => ({ ...prev, course: '' }));
              }}
              placeholder="e.g. DS2001 Machine Learning or EE302 DSP"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border ${
                errors.course ? 'border-rose-500' : 'border-zinc-700/80 focus:border-amber-500'
              } text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all`}
            />
            {errors.course && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.course}
              </p>
            )}

            {/* Quick Course Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(availableCourses.length > 0 ? availableCourses.slice(0, 5) : presetSuggestions[source]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => {
                    setCourse(c);
                    if (errors.course) setErrors(prev => ({ ...prev, course: '' }));
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    course === c
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Due Date & Time *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border ${
                  errors.dueDate ? 'border-rose-500' : 'border-zinc-700/80 focus:border-amber-500'
                } text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all`}
              />
            </div>
            {errors.dueDate && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.dueDate}
              </p>
            )}

            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {datePresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setDueDate(preset.value);
                    if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }));
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Optional Notes / Submission Links
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. WhatsApp discussion link, submission instructions, Moodle portal ID, PDF vs GitHub repo..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              {initialTask ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              {initialTask ? 'Save Changes' : 'Add Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
