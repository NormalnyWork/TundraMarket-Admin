declare global {
  interface Window {
    __TUNDRA_ADMIN_CONFIG__?: {
      API_BASE_URL?: string;
    };
  }
}

const defaultApiBaseUrl = '/api/v1';

export const apiBaseUrl = (
  window.__TUNDRA_ADMIN_CONFIG__?.API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  defaultApiBaseUrl
).replace(/\/$/, '');

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  query?: Record<string, string | number | null | undefined>;
  token?: string;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const rawUrl = `${apiBaseUrl}${path}`;
  const url = apiBaseUrl.startsWith('http')
    ? new URL(rawUrl)
    : new URL(rawUrl, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return apiBaseUrl.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
    headers.token = options.token;
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API ${path} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}
