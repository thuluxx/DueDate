import { RotateCcw, X, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
}

export function Toast({ message, onUndo, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/80 text-zinc-100 max-w-md w-[90vw] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-xs sm:text-sm font-medium flex-1 truncate">{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg shrink-0"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
