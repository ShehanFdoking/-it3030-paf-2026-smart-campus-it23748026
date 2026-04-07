const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

async function parseApiResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function loginWithGoogle(idToken) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  return parseApiResponse(response);
}

export async function loginAdmin(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseApiResponse(response);
}

export async function changeAdminPassword(email, currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/api/admin/profile/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, currentPassword, newPassword }),
  });

  return parseApiResponse(response);
}

export async function listResources(category) {
  const url = new URL(`${API_BASE_URL}/api/admin/resources`);

  if (category) {
    url.searchParams.set('category', category);
  }

  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function getResource(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/resources/${id}`);
  return parseApiResponse(response);
}

export async function createResource(payload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function updateResource(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/resources/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function deleteResource(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/resources/${id}`, {
    method: 'DELETE',
  });

  return parseApiResponse(response);
}

export async function requestBooking(payload) {
  const response = await fetch(`${API_BASE_URL}/api/bookings/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function listMyBookings(email) {
  const url = new URL(`${API_BASE_URL}/api/bookings/my`);
  url.searchParams.set('email', email);
  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function updateMyBooking(id, email, payload) {
  const url = new URL(`${API_BASE_URL}/api/bookings/${id}`);
  url.searchParams.set('email', email);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function deleteMyBooking(id, email) {
  const url = new URL(`${API_BASE_URL}/api/bookings/${id}`);
  url.searchParams.set('email', email);
  const response = await fetch(url, {
    method: 'DELETE',
  });

  return parseApiResponse(response);
}

export async function listAdminBookings({ category, status, search } = {}) {
  const url = new URL(`${API_BASE_URL}/api/admin/bookings`);
  if (category && category !== 'ALL') {
    url.searchParams.set('category', category);
  }
  if (status && status !== 'ALL') {
    url.searchParams.set('status', status);
  }
  if (search && search.trim()) {
    url.searchParams.set('search', search.trim());
  }

  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function updateBookingStatus(id, status, adminNote = '') {
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, adminNote }),
  });

  return parseApiResponse(response);
}

export async function createIncidentTicket(payload) {
  const response = await fetch(`${API_BASE_URL}/api/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function listMyIncidentTickets(email) {
  const url = new URL(`${API_BASE_URL}/api/incidents/my`);
  url.searchParams.set('email', email);
  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function updateMyIncidentTicket(id, email, payload) {
  const url = new URL(`${API_BASE_URL}/api/incidents/${id}`);
  url.searchParams.set('email', email);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function deleteMyIncidentTicket(id, email) {
  const url = new URL(`${API_BASE_URL}/api/incidents/${id}`);
  url.searchParams.set('email', email);
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return parseApiResponse(response);
}

export async function listAdminIncidentTickets({ status, search } = {}) {
  const url = new URL(`${API_BASE_URL}/api/admin/incidents`);
  if (status && status !== 'ALL') {
    url.searchParams.set('status', status);
  }
  if (search && search.trim()) {
    url.searchParams.set('search', search.trim());
  }
  const response = await fetch(url);
  return parseApiResponse(response);
}

export async function updateIncidentTicket(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/incidents/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function addIncidentComment(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/incidents/${id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function updateIncidentComment(id, commentId, actorEmail, payload) {
  const url = new URL(`${API_BASE_URL}/api/incidents/${id}/comments/${commentId}`);
  url.searchParams.set('actorEmail', actorEmail);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function deleteIncidentComment(id, commentId, actorEmail) {
  const url = new URL(`${API_BASE_URL}/api/incidents/${id}/comments/${commentId}`);
  url.searchParams.set('actorEmail', actorEmail);
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return parseApiResponse(response);
}

export async function listIncidentsByBookingId(bookingId) {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/incidents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch incidents for booking ${bookingId}`);
  }
  return response.json();
}
