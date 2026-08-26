import { apiClient } from './apiClient';
import {
  CustomizationOptionGroup,
  CustomizationPriceRequest,
  CustomizationPriceResponse,
  CustomizationValidateRequest,
  CustomizationValidateResponse,
  ApiResponse,
} from '@stitchx/shared';

export const customizationService = {
  async getCustomizationOptions(
    productIdOrSlug: string = 'default',
  ): Promise<ApiResponse<{ product: any; groups: CustomizationOptionGroup[] }>> {
    return apiClient<{ product: any; groups: CustomizationOptionGroup[] }>(
      `/v1/customizations/products/${encodeURIComponent(productIdOrSlug)}`,
    );
  },

  async calculatePrice(
    payload: CustomizationPriceRequest,
  ): Promise<ApiResponse<CustomizationPriceResponse>> {
    return apiClient<CustomizationPriceResponse>('/v1/customizations/price', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async validateConfig(
    payload: CustomizationValidateRequest,
  ): Promise<ApiResponse<CustomizationValidateResponse>> {
    return apiClient<CustomizationValidateResponse>('/v1/customizations/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
