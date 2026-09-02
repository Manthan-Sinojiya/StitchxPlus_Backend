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

export function getHumanReadableError(rawError: any, status?: number): string {
  if (status === 401) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested server endpoint was not found (404). Please verify your backend API URL.';
  }
  if (status && status >= 500) {
    return 'The backend server encountered an issue (500 Error). Please try again in a few moments.';
  }

  const msg = typeof rawError === 'string' ? rawError : rawError?.message || '';

  if (
    msg.includes('JSON.parse') ||
    msg.includes('unexpected character') ||
    msg.includes('Unexpected token') ||
    msg.includes('is not valid JSON')
  ) {
    return 'Unable to process server response. Please verify that your backend API is online and returning JSON.';
  }

  if (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('Network request failed')
  ) {
    return 'Unable to reach the backend server. Please check your internet connection or server deployment status.';
  }

  if (msg === 'Invalid credentials' || msg === 'Unauthorized') {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  return msg || 'An unexpected error occurred. Please try again.';
}

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
    const text = await response.text();

    let data: ApiResponse<T>;
    try {
      data = text ? JSON.parse(text) : ({} as ApiResponse<T>);
    } catch (_parseErr) {
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: getHumanReadableError(_parseErr, response.status),
        },
      };
    }

    // Standardize error message if server returned non-ok or error payload
    if (!response.ok || (data && !data.success && data.error)) {
      if (data && data.error) {
        data.error.message = getHumanReadableError(data.error.message, response.status);
      }
    }

    // Automatic token refresh on HTTP 401
    // Skip refresh entirely if: already retrying, it's an auth endpoint, or user has no token (guest session)
    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh') &&
      !!useAuthStore.getState().accessToken
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

        const refreshText = await refreshResponse.text();
        let refreshData: any;
        try {
          refreshData = refreshText ? JSON.parse(refreshText) : {};
        } catch (_e) {
          refreshData = {};
        }

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
        message: getHumanReadableError(error),
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
