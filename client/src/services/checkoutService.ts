import { apiClient } from './apiClient';
import {
  Address,
  CheckoutValidateResult,
  CreatePaymentInput,
  CreatePaymentResult,
  Order,
} from '@stitchx/shared';

export const checkoutService = {
  validateCheckout: async (): Promise<CheckoutValidateResult> => {
    const response = await apiClient.post<CheckoutValidateResult>('/v1/checkout/validate');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to validate checkout');
    }
    return response.data;
  },

  createPayment: async (input: CreatePaymentInput): Promise<CreatePaymentResult> => {
    const response = await apiClient.post<CreatePaymentResult>('/v1/checkout/create-payment', input);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create payment intent');
    }
    return response.data;
  },
};

export const orderService = {
  createOrder: async (orderInput: {
    orderNumber?: string;
    shippingAddress: Address;
    billingAddress: Address;
    shippingMethod?: string;
    paymentMethod?: string;
    paymentIntentId?: string;
  }): Promise<Order> => {
    const response = await apiClient.post<Order>('/v1/orders', orderInput);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create order');
    }
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/v1/orders/${orderNumber}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch order');
    }
    return response.data;
  },

  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/v1/orders/my-orders');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch user orders');
    }
    return response.data;
  },
};
