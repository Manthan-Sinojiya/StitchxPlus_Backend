import { apiClient } from './apiClient';
import { User, ApiResponse, AuthResponseData } from '@stitchx/shared';
import {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth.schema';

let refreshTokenPromise: Promise<ApiResponse<AuthResponseData>> | null = null;

export const authService = {
  async register(data: RegisterInput): Promise<ApiResponse<AuthResponseData>> {
    return apiClient<AuthResponseData>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginInput): Promise<ApiResponse<AuthResponseData>> {
    return apiClient<AuthResponseData>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient<null>('/v1/auth/logout', {
      method: 'POST',
    });
  },

  async refreshToken(): Promise<ApiResponse<AuthResponseData>> {
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }
    refreshTokenPromise = apiClient<AuthResponseData>('/v1/auth/refresh', {
      method: 'POST',
    }).finally(() => {
      refreshTokenPromise = null;
    });
    return refreshTokenPromise;
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<{ resetToken?: string }>> {
    return apiClient<{ resetToken?: string }>('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetPassword(data: ResetPasswordInput): Promise<ApiResponse<null>> {
    return apiClient<null>('/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return apiClient<null>('/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return apiClient<{ user: User }>('/v1/auth/me', {
      method: 'GET',
    });
  },
};
