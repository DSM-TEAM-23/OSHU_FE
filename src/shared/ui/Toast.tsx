import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  if (!toast) return null;

  const Icon = toast.type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
      <Icon size={18} />
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="알림 닫기">
        <X size={15} />
      </button>
    </div>
  );
}
