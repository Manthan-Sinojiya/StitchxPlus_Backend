import { apiClient } from './apiClient';
import {
  MeasurementProfile,
  CreateMeasurementProfileInput,
  UpdateMeasurementProfileInput,
  ApiResponse,
} from '@stitchx/shared';

export const patternService = {
  async getPatterns(): Promise<ApiResponse<MeasurementProfile[]>> {
    return apiClient<MeasurementProfile[]>('/v1/patterns');
  },

  async getPatternById(id: string): Promise<ApiResponse<MeasurementProfile>> {
    return apiClient<MeasurementProfile>(`/v1/patterns/${id}`);
  },

  async createPattern(
    data: CreateMeasurementProfileInput,
  ): Promise<ApiResponse<MeasurementProfile>> {
    return apiClient<MeasurementProfile>('/v1/patterns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePattern(
    id: string,
    data: UpdateMeasurementProfileInput,
  ): Promise<ApiResponse<MeasurementProfile>> {
    return apiClient<MeasurementProfile>(`/v1/patterns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePattern(id: string): Promise<ApiResponse<null>> {
    return apiClient<null>(`/v1/patterns/${id}`, {
      method: 'DELETE',
    });
  },

  async duplicatePattern(id: string): Promise<ApiResponse<MeasurementProfile>> {
    return apiClient<MeasurementProfile>(`/v1/patterns/${id}/duplicate`, {
      method: 'POST',
    });
  },

  async setDefaultPattern(id: string): Promise<ApiResponse<MeasurementProfile>> {
    return apiClient<MeasurementProfile>(`/v1/patterns/${id}/default`, {
      method: 'PATCH',
    });
  },
};
