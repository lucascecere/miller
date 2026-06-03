async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (res.status === 401 && path !== '/api/me' && path !== '/api/login') {
    window.location.href = '/login';
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const get = (path) => apiFetch(path);
export const post = (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
