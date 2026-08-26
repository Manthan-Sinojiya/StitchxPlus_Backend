import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';

export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Product slug is required');
      const response = await productService.getProductBySlug(slug);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Product not found');
      }
      return response.data;
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useRelatedProducts(idOrSlug?: string) {
  return useQuery({
    queryKey: ['relatedProducts', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return [];
      const response = await productService.getRelatedProducts(idOrSlug);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    },
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  });
}
