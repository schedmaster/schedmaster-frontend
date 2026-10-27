export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken');
}

export function clearSession() {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('user');
}

export function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (typeof options.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(path.startsWith('http') ? path : `${API_URL}${path}`, { ...options, headers, cache: 'no-store' });
}
