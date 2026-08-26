import { apiClient } from './apiClient';
import { Product, ProductQueryParams, PaginatedProductsResponse, ApiResponse } from '@stitchx/shared';

export const productService = {
  async getProducts(params: ProductQueryParams = {}): Promise<ApiResponse<PaginatedProductsResponse>> {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.fabric) query.append('fabric', params.fabric);
    if (params.color) query.append('color', params.color);
    if (params.priceMin !== undefined) query.append('priceMin', String(params.priceMin));
    if (params.priceMax !== undefined) query.append('priceMax', String(params.priceMax));
    if (params.sort) query.append('sort', params.sort);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.limit !== undefined) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/v1/products${queryString ? `?${queryString}` : ''}`;
    return apiClient<PaginatedProductsResponse>(endpoint);
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return apiClient<Product>(`/v1/products/${encodeURIComponent(slug)}`);
  },

  async getRelatedProducts(idOrSlug: string): Promise<ApiResponse<Product[]>> {
    return apiClient<Product[]>(`/v1/products/${encodeURIComponent(idOrSlug)}/related`);
  },
};
