import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            className={`toast-item ${isError ? 'toast-error' : 'toast-success'}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              {isError ? (
                <AlertCircle size={16} color="var(--status-red)" style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} />
              )}
              <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
              aria-label="Dismiss notice"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
