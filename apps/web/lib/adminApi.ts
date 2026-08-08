'use client';

import { useAdminAuth } from './stores';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Admin fetch with bearer token and automatic one-shot refresh on 401. */
export async function adminApi<T>(
  path: string,
  opts: Omit<RequestInit, 'body'> & { body?: unknown; isForm?: boolean } = {},
): Promise<T> {
  const call = async (token: string | null): Promise<Response> => {
    const { body, isForm, headers, ...rest } = opts;
    return fetch(`${API_URL}/api/v1${path}`, {
      ...rest,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: isForm ? (body as BodyInit) : JSON.stringify(body) } : {}),
    });
  };

  const { accessToken, refreshToken, setAuth, logout } = useAdminAuth.getState();
  let res = await call(accessToken);

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      res = await call(data.accessToken);
    } else {
      logout();
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
    } catch {
      /* default */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'Login failed');
  }
  return res.json();
}

export async function uploadImage(file: File, folder = 'general'): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append('file', file);
  return adminApi<{ url: string; publicId: string }>(`/uploads/image?folder=${folder}`, {
    method: 'POST',
    body: form,
    isForm: true,
  });
}
