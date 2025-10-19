// Simple fetch-based API client for ATIUI
// Reads base URL from Vite env and attaches Authorization header from localStorage

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "atiui_token";

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
}

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T = any>(path: string, json?: any, options?: RequestOptions) => request<T>(path, { ...options, method: "POST", json }),
  patch: <T = any>(path: string, json?: any, options?: RequestOptions) => request<T>(path, { ...options, method: "PATCH", json }),
  put: <T = any>(path: string, json?: any, options?: RequestOptions) => request<T>(path, { ...options, method: "PUT", json }),
  delete: <T = any>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};

export { API_URL, TOKEN_KEY };
