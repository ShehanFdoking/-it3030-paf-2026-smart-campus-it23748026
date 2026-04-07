export function showToast(message, type = 'info', title) {
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: {
      message,
      type,
      title,
    },
  }));
}

export function requestConfirmation({ title, message, confirmLabel, cancelLabel, onConfirm }) {
  window.dispatchEvent(new CustomEvent('app:confirm', {
    detail: {
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
    },
  }));
}

export function openNotifications() {
  window.dispatchEvent(new CustomEvent('app:open-notifications'));
}
