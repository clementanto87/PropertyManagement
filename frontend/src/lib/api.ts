import { getAuthToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...init?.headers
  };

  // Only set Content-Type to application/json if body is not FormData
  if (init?.body && !(init.body instanceof FormData)) {
    const headersRecord = headers as Record<string, string>;
    if (!headersRecord['Content-Type']) {
      headersRecord['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { message: text };
    }
    throw new Error(errorData.message || `Request failed ${res.status}`);
  }

  // Handle 204 No Content responses (e.g., DELETE requests)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { method: 'GET', ...init }),
  post: <T>(path: string, body: unknown, init?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...init
    });
  },
  patch: <T>(path: string, body: unknown, init?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
      ...init
    });
  },
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
  defaults: {
    baseURL: API_BASE
  }
};
