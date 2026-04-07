import './NotificationPanel.css';

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function NotificationPanel({ open, notifications, unreadCount, onClose, onMarkRead, onMarkAllRead }) {
  if (!open) {
    return null;
  }

  return (
    <aside className="notification-panel" aria-label="Notifications">
      <div className="notification-panel__header">
        <div>
          <h2>Notifications</h2>
          <p>{unreadCount} unread</p>
        </div>
        <button type="button" className="notification-panel__close" onClick={onClose} aria-label="Close notifications">
          ×
        </button>
      </div>

      <div className="notification-panel__actions">
        <button type="button" className="btn btn--ghost btn--compact" onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>

      <div className="notification-panel__list">
        {!notifications.length ? (
          <p className="notification-panel__empty">No notifications yet.</p>
        ) : (
          notifications.map((notification) => (
            <article key={notification.id} className={`notification-item ${notification.read ? 'is-read' : 'is-unread'}`}>
              <div className="notification-item__top">
                <h3>{notification.title}</h3>
                {!notification.read ? <button type="button" onClick={() => onMarkRead(notification.id)}>Mark read</button> : null}
              </div>
              <p>{notification.message}</p>
              <p className="notification-item__meta">{formatDateTime(notification.createdAt)}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
