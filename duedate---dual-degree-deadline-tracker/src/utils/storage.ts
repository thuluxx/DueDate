import { Task } from '../types/task';
import { toDatetimeLocalString } from './dateUtils';

const STORAGE_KEY = 'duedate_tasks_v1';

/**
 * Generate default seed tasks tailored to a student juggling offline engineering & online data science
 */
export function getDefaultSeedTasks(): Task[] {
  const now = new Date();

  // Due in 16 hours (Critical / Red)
  const dueIn16Hours = new Date(now.getTime() + 16 * 3600 * 1000);
  
  // Due in 34 hours (Critical / Red)
  const dueIn34Hours = new Date(now.getTime() + 34 * 3600 * 1000);

  // Due in 4 days (Warning / Yellow)
  const dueIn4Days = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
  dueIn4Days.setHours(23, 59, 0, 0);

  // Due in 6 days (Warning / Yellow)
  const dueIn6Days = new Date(now.getTime() + 6 * 24 * 3600 * 1000);
  dueIn6Days.setHours(18, 0, 0, 0);

  // Due in 12 days (Normal / Green)
  const dueIn12Days = new Date(now.getTime() + 12 * 24 * 3600 * 1000);
  dueIn12Days.setHours(23, 59, 0, 0);

  // Completed task
  const completedDue = new Date(now.getTime() - 2 * 24 * 3600 * 1000);

  return [
    {
      id: 'task-seed-1',
      title: 'Week 4 Graded Programming Assignment: Regularized Logistic Regression',
      course: 'DS2001 - Machine Learning Practice',
      source: 'Online Degree',
      type: 'Assignment',
      dueDate: toDatetimeLocalString(dueIn16Hours),
      notes: 'Portal deadline strictly enforced at midnight. Submit Jupyter Notebook (.ipynb) and verification screenshot.',
      completed: false,
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: 'task-seed-2',
      title: 'DSP Lab Observation & MATLAB Code Submission',
      course: 'EE302 - Digital Signal Processing',
      source: 'College',
      type: 'Assignment',
      dueDate: toDatetimeLocalString(dueIn34Hours),
      notes: 'Physical signature required from Lab Instructor before uploading scanned PDF to college ERP.',
      completed: false,
      createdAt: new Date(now.getTime() - 120000000).toISOString(),
    },
    {
      id: 'task-seed-3',
      title: 'Continuous Assessment Quiz 2: Hypothesis Testing',
      course: 'MA1002 - Mathematical Statistics',
      source: 'Online Degree',
      type: 'Quiz',
      dueDate: toDatetimeLocalString(dueIn4Days),
      notes: '45 mins timed window on online portal. Scientific calculator allowed.',
      completed: false,
      createdAt: new Date(now.getTime() - 40000000).toISOString(),
    },
    {
      id: 'task-seed-4',
      title: 'Midterm Lab Exam: Microcontroller Interfacing',
      course: 'EE401 - Embedded Systems',
      source: 'College',
      type: 'Exam',
      dueDate: toDatetimeLocalString(dueIn6Days),
      notes: 'Bring breadboard, STM32 development kit, and jumper wires to Lab Hall 3.',
      completed: false,
      createdAt: new Date(now.getTime() - 20000000).toISOString(),
    },
    {
      id: 'task-seed-5',
      title: 'Term Project Phase 1: End-to-End Data Pipeline Architecture',
      course: 'DS3005 - Big Data Engineering',
      source: 'Online Degree',
      type: 'Project',
      dueDate: toDatetimeLocalString(dueIn12Days),
      notes: 'Coordinate on WhatsApp with team members. Push git repo commit link.',
      completed: false,
      createdAt: new Date(now.getTime() - 10000000).toISOString(),
    },
    {
      id: 'task-seed-6',
      title: 'Week 3 Discussion Forum Quiz: Matrix Decompositions',
      course: 'MA1002 - Mathematical Statistics',
      source: 'Online Degree',
      type: 'Quiz',
      dueDate: toDatetimeLocalString(completedDue),
      notes: 'Scored 10/10.',
      completed: true,
      completedAt: new Date(now.getTime() - 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 200000000).toISOString(),
    }
  ];
}

/**
 * Safely load tasks from localStorage, with fallback to seed data
 */
export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getDefaultSeedTasks();
      saveTasksToStorage(seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getDefaultSeedTasks();
  } catch (error) {
    console.error('Failed to parse tasks from localStorage:', error);
    return getDefaultSeedTasks();
  }
}

/**
 * Safely save tasks to localStorage
 */
export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

/**
 * Export tasks as downloadable JSON
 */
export function exportTasksToJSON(tasks: Task[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `DueDate_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
