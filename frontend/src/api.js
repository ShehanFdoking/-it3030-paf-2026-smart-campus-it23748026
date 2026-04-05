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
