const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

async function parseApiResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function listNotifications(email) {
  const url = new URL(`${API_BASE_URL}/api/notifications`);
  url.searchParams.set('email', email);
  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function getUnreadNotificationCount(email) {
  const url = new URL(`${API_BASE_URL}/api/notifications/unread-count`);
  url.searchParams.set('email', email);
  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function markNotificationRead(id, read = true) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ read }),
  });
  return parseApiResponse(response);
}

export async function markAllNotificationsRead(email) {
  const url = new URL(`${API_BASE_URL}/api/notifications/read-all`);
  url.searchParams.set('email', email);
  const response = await fetch(url, {
    method: 'PATCH',
  });
  return parseApiResponse(response);
}
