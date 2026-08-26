import { APP_CONFIG } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';
import { ApiResponse } from '@stitchx/shared';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${APP_CONFIG.apiBaseUrl}${endpoint}`;
  const accessToken = useAuthStore.getState().accessToken;

  // Guest session ID management
  let sessionId = localStorage.getItem('stitchx_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('stitchx_session_id', sessionId);
  }

  const headers = new Headers(options.headers || {});
  headers.set('X-Session-ID', sessionId);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensures HTTP-only refresh cookies are sent
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    // Automatic token refresh on HTTP 401
    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          headers.set('Authorization', `Bearer ${token}`);
          return apiClient<T>(endpoint, { ...options, headers }, true);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${APP_CONFIG.apiBaseUrl}/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.success && refreshData.data?.accessToken) {
          const newAccessToken = refreshData.data.accessToken;
          const user = refreshData.data.user;
          useAuthStore.getState().setAuth(user, newAccessToken);
          processQueue(null, newAccessToken);

          headers.set('Authorization', `Bearer ${newAccessToken}`);
          return apiClient<T>(endpoint, { ...options, headers }, true);
        } else {
          useAuthStore.getState().clearAuth();
          processQueue(new Error('Session expired'), null);
          return data;
        }
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
        processQueue(refreshErr, null);
        return data;
      } finally {
        isRefreshing = false;
      }
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}

apiClient.get = async function <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
};

apiClient.post = async function <T>(
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

apiClient.put = async function <T>(
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

apiClient.patch = async function <T>(
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
};

apiClient.delete = async function <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
};

