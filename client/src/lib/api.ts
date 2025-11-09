// Simple fetch-based API client for ATIUI
// Reads base URL from Vite env and attaches Authorization header from localStorage

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "atiui_token";

// Deduplicate identical concurrent requests and apply simple 429 backoff
const inflight = new Map<string, Promise<any>>();

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type RequestOptions = RequestInit & {
  auth?: boolean; // default true
  json?: any;
};

function keyOf(url: string, opts: RequestOptions): string {
  const method = (opts.method || 'GET').toUpperCase();
  let bodyStr = '';
  try {
    bodyStr = opts.body ? String(opts.body) : (opts.json !== undefined ? JSON.stringify(opts.json) : '');
  } catch {}
  return `${method} ${url} ${bodyStr}`;
}

async function with429Retry<T>(fn: () => Promise<T>, resp?: Response): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    // If previous fetch returned 429, wait and retry once
    if ((err?.status || resp?.status) === 429) {
      const retryAfter = Number(resp?.headers?.get?.('retry-after'));
      const delayMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 800;
      await new Promise(res => setTimeout(res, Math.max(300, Math.min(2000, delayMs))));
      return await fn();
    }
    throw err;
  }
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const { auth = true, json, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Accept": "application/json",
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const doFetch = async () => {
    const resp = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: json !== undefined ? JSON.stringify(json) : (options.body ?? undefined),
      credentials: "include",
    });

    if (!resp.ok) {
      let details: any = undefined;
      try { details = await resp.json(); } catch {}
      const error = new Error(details?.error || `HTTP ${resp.status}`) as any;
      error.status = resp.status;
      error.details = details;
      throw error;
    }

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return resp.json();
    }
    // @ts-expect-error allow non-json generic
    return resp.text();
  };

  // Wrapper to auto-refresh once on 401
  let retried = false;
  const doFetchWithRefresh = async (): Promise<T> => {
    try {
      return await with429Retry<T>(doFetch);
    } catch (err: any) {
      if (auth && err?.status === 401 && !retried) {
        retried = true;
        try {
          const refreshResp = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshResp.ok) {
            const data = await refreshResp.json();
            const newToken = data?.accessToken || data?.data || data?.token;
            if (newToken) {
              setToken(newToken);
              finalHeaders["Authorization"] = `Bearer ${newToken}`;
              return await with429Retry<T>(doFetch);
            }
          }
        } catch {}
      }
      throw err;
    }
  };

  const key = keyOf(url, options as any);
  if (inflight.has(key)) {
    // Return the existing promise to dedupe concurrent requests
    return inflight.get(key)! as Promise<T>;
  }

  const p = doFetchWithRefresh();
  inflight.set(key, p as Promise<any>);
  try {
    return await p;
  } finally {
    inflight.delete(key);
  }
}

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T = any>(path: string, json?: any, options?: RequestOptions) => request<T>(path, { ...options, method: "POST", json }),
  patch: <T = any>(path: string, json?: any, options?: RequestOptions) => request<T>(path, { ...options, method: "PATCH", json }),
  put: <T = any>(path: string, json?: any, options?: RequestOptions) => request<T>(path, { ...options, method: "PUT", json }),
  delete: <T = any>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};

export { API_URL, TOKEN_KEY };
