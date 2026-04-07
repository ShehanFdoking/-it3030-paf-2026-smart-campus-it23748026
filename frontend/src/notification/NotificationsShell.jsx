import { useEffect, useMemo, useState } from 'react';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import NotificationPanel from './NotificationPanel';
import { getUnreadNotificationCount, listNotifications, markAllNotificationsRead, markNotificationRead } from './notificationApi';
import './NotificationPanel.css';
import './NotificationsShell.css';

const GOOGLE_SESSION_KEY = 'googleUserSession';
const ADMIN_SESSION_KEY = 'adminUserSession';

function readSessionEmail() {
  try {
    const googleRaw = window.localStorage.getItem(GOOGLE_SESSION_KEY);
    if (googleRaw) {
      const googleUser = JSON.parse(googleRaw);
      if (googleUser?.email) {
        return googleUser.email;
      }
    }
  } catch {
    // ignore
  }

  try {
    const adminRaw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (adminRaw) {
      const adminUser = JSON.parse(adminRaw);
      if (adminUser?.email) {
        return adminUser.email;
      }
    }
  } catch {
    // ignore
  }

  return '';
}

export default function NotificationsShell() {
  const [recipientEmail, setRecipientEmail] = useState(readSessionEmail());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: null,
  });

  const refreshSessions = () => {
    setRecipientEmail(readSessionEmail());
  };

  useEffect(() => {
    const handleToast = (event) => {
      const detail = event.detail || {};
      setToast({
        title: detail.title || (detail.type === 'error' ? 'Error' : detail.type === 'success' ? 'Success' : 'Notice'),
        message: detail.message || '',
        type: detail.type || 'info',
      });
      window.clearTimeout(window.__notificationToastTimer);
      window.__notificationToastTimer = window.setTimeout(() => setToast(null), 3000);
    };

    const handleConfirm = (event) => {
      const detail = event.detail || {};
      setConfirmState({
        open: true,
        title: detail.title || 'Confirm action',
        message: detail.message || 'Are you sure?',
        confirmLabel: detail.confirmLabel || 'Confirm',
        cancelLabel: detail.cancelLabel || 'Cancel',
        onConfirm: detail.onConfirm || null,
      });
    };

    const handleOpenNotifications = () => {
      setOpen(true);
    };

    window.addEventListener('app:toast', handleToast);
    window.addEventListener('app:confirm', handleConfirm);
    window.addEventListener('app:open-notifications', handleOpenNotifications);
    window.addEventListener('storage', refreshSessions);
    return () => {
      window.removeEventListener('app:toast', handleToast);
      window.removeEventListener('app:confirm', handleConfirm);
      window.removeEventListener('app:open-notifications', handleOpenNotifications);
      window.removeEventListener('storage', refreshSessions);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!recipientEmail) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        const [items, count] = await Promise.all([
          listNotifications(recipientEmail),
          getUnreadNotificationCount(recipientEmail),
        ]);
        setNotifications(items);
        setUnreadCount(Number(count?.count || 0));
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [recipientEmail]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRecipientEmail(readSessionEmail());
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  const hasUser = useMemo(() => !!recipientEmail, [recipientEmail]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id, true);
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      setToast({ title: 'Error', message: 'Unable to mark notification as read.', type: 'error' });
    }
  };

  const handleMarkAllRead = async () => {
    if (!recipientEmail) {
      return;
    }
    try {
      await markAllNotificationsRead(recipientEmail);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      setToast({ title: 'Success', message: 'All notifications marked as read.', type: 'success' });
    } catch {
      setToast({ title: 'Error', message: 'Unable to mark all notifications as read.', type: 'error' });
    }
  };

  const handleConfirm = async () => {
    const action = confirmState.onConfirm;
    setConfirmState((current) => ({ ...current, open: false }));
    if (typeof action === 'function') {
      await action();
    }
  };

  return (
    <>
      {hasUser ? (
        <button
          type="button"
          className="notification-fab"
          onClick={() => setOpen((current) => !current)}
          aria-label="Open notifications"
        >
          <span>Notifications</span>
          {unreadCount > 0 ? <strong>{unreadCount}</strong> : null}
        </button>
      ) : null}

      <NotificationPanel
        open={open}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setOpen(false)}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState((current) => ({ ...current, open: false }))}
      />
    </>
  );
}
