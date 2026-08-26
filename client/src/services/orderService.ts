import { apiClient } from './apiClient';
import { Order } from '@stitchx/shared';

export const orderService = {
  async getUserOrders(): Promise<Order[]> {
    const res = await apiClient.get<Order[]>('/orders/my-orders');
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to fetch user orders');
    return res.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await apiClient.get<Order>(`/orders/${id}`);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to fetch order details');
    return res.data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const res = await apiClient.post<Order>(`/orders/${id}/cancel`);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to cancel order');
    return res.data;
  },
};
