import { apiClient } from './apiClient';
import { Cart, AddCartItemInput, UpdateCartItemInput } from '@stitchx/shared';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await apiClient<Cart>('/v1/cart', { method: 'GET' });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch cart');
    }
    return res.data;
  },

  async addItem(input: AddCartItemInput): Promise<Cart> {
    const res = await apiClient<Cart>('/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to add item to cart');
    }
    return res.data;
  },

  async updateItem(itemId: string, input: UpdateCartItemInput): Promise<Cart> {
    const res = await apiClient<Cart>(`/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update cart item');
    }
    return res.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await apiClient<Cart>(`/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to remove item from cart');
    }
    return res.data;
  },

  async applyCoupon(code: string): Promise<Cart> {
    const res = await apiClient<Cart>('/v1/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to apply coupon');
    }
    return res.data;
  },

  async removeCoupon(): Promise<Cart> {
    const res = await apiClient<Cart>('/v1/cart/coupon', {
      method: 'DELETE',
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to remove coupon');
    }
    return res.data;
  },

  async mergeCart(): Promise<Cart> {
    const res = await apiClient<Cart>('/v1/cart/merge', {
      method: 'POST',
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to merge cart');
    }
    return res.data;
  },
};
