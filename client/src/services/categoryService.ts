import { apiClient } from './apiClient';
import { Category, ApiResponse } from '@stitchx/shared';

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient<Category[]>('/v1/categories');
  },
};
