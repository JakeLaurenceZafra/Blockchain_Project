const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const getWalletAddress = () => {
  try {
    const wallet = JSON.parse(localStorage.getItem('wallet') || '{}');
    return wallet.walletAddress || '';
  } catch {
    return '';
  }
};

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  const walletAddress = getWalletAddress();
  if (walletAddress) {
    h['x-wallet-address'] = walletAddress;
  }
  return h;
};

/* Notes helpers */
export async function getNotes() {
  console.log('getNotes called, API_URL:', API_URL);
  const res = await fetch(`${API_URL}/api/notes`, { headers: headers() });
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
    headers: headers(),
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
    headers: headers(),
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
    headers: headers()
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}

export function logout() {
  localStorage.removeItem('wallet');
  localStorage.removeItem('currentUser');
}