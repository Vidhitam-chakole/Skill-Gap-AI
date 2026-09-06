/**
 * API Client — Enhanced
 * Reference: Skill+ Master Product Blueprint v1.0, Part IV §IV.5 (API Layer)
 *
 * Features:
 * - Auth token injection (Bearer or httpOnly cookie aware)
 * - Retry with exponential backoff (configurable per request)
 * - Request/response interceptors
 * - Abort controller support for cancellable requests
 * - Typed endpoint registry for type-safe API calls
 * - Feature-flag gated: uses mock data when flags are off
 */

import { config } from "@/shared/config/env";

// ============================================================
// Types
// ============================================================

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  retry?: RetryConfig;
  signal?: AbortSignal;
}

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

interface RequestInterceptor {
  (config: RequestInit & { url: string }): RequestInit & { url: string };
}

interface ResponseInterceptor {
  (response: Response): Response | Promise<Response>;
}

// ============================================================
// Error Classes
// ============================================================

export class ApiError extends Error {
  status: number;
  body: string;
  endpoint: string;

  constructor(message: string, status: number, body: string, endpoint: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.endpoint = endpoint;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isServerError() {
    return this.status >= 500;
  }
}

// ============================================================
// API Client Class
// ============================================================

class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // -- Token Management --

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // -- Interceptors --

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // -- Internal Helpers --

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return url.toString();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    retryConfig?: RetryConfig,
  ): Promise<Response> {
    const maxRetries = retryConfig?.maxRetries ?? 0;
    const baseDelay = retryConfig?.baseDelayMs ?? 500;
    const maxDelay = retryConfig?.maxDelayMs ?? 10000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, init);

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (!response.ok && response.status !== 429 && attempt < maxRetries) {
          throw new ApiError(
            `API request failed: ${response.status} ${response.statusText}`,
            response.status,
            await response.text().catch(() => ""),
            url,
          );
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Don't retry if aborted
        if (init.signal?.aborted) throw error;

        // Don't retry on client errors
        if (error instanceof ApiError && error.status < 500 && error.status !== 429) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 100, maxDelay);
          await this.sleep(delay);
        }
      }
    }

    throw lastError ?? new Error("Request failed after retries");
  }

  // -- Core Request Method --

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, retry, signal, ...fetchOptions } = options;

    let requestConfig: RequestInit & { url: string } = {
      ...fetchOptions,
      url: this.buildUrl(endpoint, params),
      headers: {
        ...this.getHeaders(),
        ...fetchOptions.headers,
      },
      signal,
    };

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig);
    }

    const response = await this.fetchWithRetry(
      requestConfig.url,
      {
        ...requestConfig,
        headers: requestConfig.headers,
      },
      retry,
    );

    // Run response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    if (!processedResponse.ok) {
      const errorBody = await processedResponse.text().catch(() => "");
      throw new ApiError(
        `API request failed: ${processedResponse.status} ${processedResponse.statusText}`,
        processedResponse.status,
        errorBody,
        endpoint,
      );
    }

    return processedResponse.json();
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// ============================================================
// Singleton Instance
// ============================================================

export const apiClient = new ApiClient(config.apiBaseUrl);

// Add auth token interceptor — reads from localStorage
apiClient.addRequestInterceptor((reqConfig) => {
  const token = localStorage.getItem("skill+-auth-token");
  if (token) {
    return {
      ...reqConfig,
      headers: {
        ...reqConfig.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return reqConfig;
});

// Add response interceptor — handles 401 globally
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("skill+-auth-token");
    // Could redirect to login here
  }
  return response;
});

// ============================================================
// Typed Endpoint Registry
// ============================================================

export const endpoints = {
  auth: {
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
    github: "/api/auth/github",
    githubCallback: "/api/auth/github/callback",
  },
  repos: {
    list: "/api/repos",
    detail: (name: string) => `/api/repos/${encodeURIComponent(name)}`,
    languages: "/api/repos/languages",
    quality: (name: string) => `/api/repos/${encodeURIComponent(name)}/quality`,
    architecture: (name: string) => `/api/repos/${encodeURIComponent(name)}/architecture`,
  },
  skills: {
    list: "/api/skills",
    detail: (name: string) => `/api/skills/${encodeURIComponent(name)}`,
    categories: "/api/skills/categories",
  },
  architecture: {
    patterns: "/api/architecture/patterns",
    detail: (name: string) => `/api/architecture/patterns/${encodeURIComponent(name)}`,
    graph: "/api/architecture/graph",
  },
  quality: {
    overview: "/api/quality",
    repo: (name: string) => `/api/quality/${encodeURIComponent(name)}`,
    compare: "/api/quality/compare",
  },
  report: {
    generate: "/api/report/generate",
    latest: "/api/report/latest",
    download: (format: string) => `/api/report/download?format=${format}`,
  },
  recommendations: {
    list: "/api/recommendations",
    dismiss: (id: string) => `/api/recommendations/${id}/dismiss`,
  },
  roadmap: {
    get: "/api/roadmap",
    updateStep: (orderId: number) => `/api/roadmap/steps/${orderId}`,
  },
  mentor: {
    conversations: "/api/mentor/conversations",
    messages: (convId: string) => `/api/mentor/conversations/${convId}/messages`,
    send: (convId: string) => `/api/mentor/conversations/${convId}/send`,
    grounding: "/api/mentor/grounding",
  },
  workspace: {
    boards: "/api/workspace/boards",
    board: (id: string) => `/api/workspace/boards/${id}`,
    items: (boardId: string) => `/api/workspace/boards/${boardId}/items`,
    item: (boardId: string, itemId: string) =>
      `/api/workspace/boards/${boardId}/items/${itemId}`,
  },
  pipeline: {
    start: "/api/analysis/start",
    status: "/api/analysis/status",
    cancel: "/api/analysis/cancel",
    retry: "/api/analysis/retry",
  },
  history: {
    runs: "/api/history/runs",
    diff: "/api/history/diff",
  },
  settings: {
    get: "/api/settings",
    update: "/api/settings",
  },
  export: {
    generate: "/api/export/generate",
    download: (token: string) => `/api/export/download/${token}`,
    share: "/api/export/share",
  },
  share: {
    get: (token: string) => `/api/share/${token}`,
  },
} as const;
