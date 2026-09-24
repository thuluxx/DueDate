import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Task } from '../types/task';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  task,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-zinc-100 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-zinc-100">
              Delete Task?
            </h3>
            <p className="text-xs text-zinc-400">This action cannot be undone.</p>
          </div>
        </div>

        <div id="delete-dialog-description" className="my-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
          <span className="font-semibold text-zinc-200 block truncate">{task.title}</span>
          <span className="text-zinc-500 text-[11px]">{task.course} • {task.source}</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
