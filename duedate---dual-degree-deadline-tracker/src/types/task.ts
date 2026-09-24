export type TaskSource = 'College' | 'Online Degree';

export type TaskType = 'Assignment' | 'Quiz' | 'Exam' | 'Project' | 'Other';

export type UrgencyLevel = 'critical' | 'warning' | 'normal' | 'overdue';

export interface Task {
  id: string;
  title: string;
  course: string;
  source: TaskSource;
  type: TaskType;
  dueDate: string; // ISO 8601 string (e.g. 2026-09-26T23:59)
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface TaskFilter {
  search: string;
  source: TaskSource | 'All';
  course: string | 'All';
  type: TaskType | 'All';
  urgency: UrgencyLevel | 'All';
}
