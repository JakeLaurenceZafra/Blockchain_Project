const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('token') || '';

const headers = (includeAuth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

export async function registerUser({ name, username, password, cardanoAddress }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ name, username, password, cardanoAddress })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Registration failed');
  }
  return res.json();
}

export async function loginUser({ username, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Login failed');
  }
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user || {}));
  }
  return data;
}

/* Notes helpers */
export async function getNotes() {
  console.log('getNotes called, API_URL:', API_URL);
  const res = await fetch(`${API_URL}/api/notes`, { headers: headers(true) });
  console.log('getNotes response status:', res.status);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error('getNotes error:', errorBody);
    throw new Error(errorBody.message || 'Failed to fetch notes');
  }
  const data = await res.json();
  console.log('getNotes data:', data);
  return data;
}

export async function createNote({ title, content, tag, transactionId }) {
  const res = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ title, content, tag, transactionId })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to create note');
  }
  return res.json();
}

export async function updateNote(id, payload) {
  console.log('updateNote called with:', { id, payload });
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error('Update note failed:', res.status, errorBody);
    throw new Error(errorBody.message || `Failed to update note: ${res.status}`);
  }
  const result = await res.json();
  console.log('updateNote result:', result);
  return result;
}

export async function deleteNote(id) {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
    headers: headers(true)
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}