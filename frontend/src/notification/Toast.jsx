import './Toast.css';

export default function Toast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast--${toast.type || 'info'}`} role="status" aria-live="polite">
      <div className="toast__content">
        <div className="toast__icon">
          {toast.type === 'success' ? '✓' : null}
          {toast.type === 'error' ? '!' : null}
          {toast.type === 'info' ? 'i' : null}
        </div>
        <div className="toast__body">
          <p className="toast__title">{toast.title || 'Notification'}</p>
          <p className="toast__message">{toast.message}</p>
        </div>
        <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss notification">
          ×
        </button>
      </div>
    </div>
  );
}
