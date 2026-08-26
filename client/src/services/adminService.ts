import { apiClient } from './apiClient';

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetModel: string;
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface SalesAnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; salesCount: number; revenue: number }[];
  recentActivity: AuditLogItem[];
  pendingOrdersCount?: number;
  lowStockProductsCount?: number;
  recentOrders?: any[];
}

export type AdminStats = SalesAnalyticsData;

export const adminService = {
  // Dashboard Analytics
  getAnalytics: async () => {
    const res = await apiClient.get<SalesAnalyticsData>('/admin/analytics');
    return res.data || null;
  },

  getStats: async () => {
    const res = await apiClient.get<SalesAnalyticsData>('/admin/analytics');
    return res.data || null;
  },

  // Category Management
  getCategories: async () => {
    const res = await apiClient.get<any[]>('/admin/categories');
    return res.data || [];
  },

  createCategory: async (categoryData: any) => {
    const res = await apiClient.post<any>('/admin/categories', categoryData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create category');
    return res.data;
  },

  updateCategory: async (id: string, categoryData: any) => {
    const res = await apiClient.put<any>(`/admin/categories/${id}`, categoryData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update category');
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete<any>(`/admin/categories/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete category');
    return res.data;
  },

  // Product CRUD
  getProducts: async (params?: { page?: number; limit?: number; category?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const endpoint = `/admin/products${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<any>(endpoint);
    return res.data || { products: [], totalPages: 1 };
  },

  createProduct: async (productData: any) => {
    const res = await apiClient.post<any>('/admin/products', productData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create product');
    return res.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const res = await apiClient.put<any>(`/admin/products/${id}`, productData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update product');
    return res.data;
  },

  deleteProduct: async (id: string) => {
    const res = await apiClient.delete<any>(`/admin/products/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete product');
    return res.data;
  },

  // Customization Options Management
  getCustomizationOptions: async () => {
    const res = await apiClient.get<any[]>('/admin/customization-options');
    return res.data || [];
  },

  getCustomizationGroups: async () => {
    const res = await apiClient.get<any[]>('/admin/customization-options');
    return res.data || [];
  },

  createCustomizationOption: async (data: any) => {
    const res = await apiClient.post<any>('/admin/customization-options', data);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create option');
    return res.data;
  },

  createCustomizationGroup: async (data: any) => {
    const res = await apiClient.post<any>('/admin/customization-options', data);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create option');
    return res.data;
  },

  updateCustomizationOption: async (id: string, data: any) => {
    const res = await apiClient.put<any>(`/admin/customization-options/${id}`, data);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update option');
    return res.data;
  },

  updateCustomizationGroup: async (id: string, data: any) => {
    const res = await apiClient.put<any>(`/admin/customization-options/${id}`, data);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update option');
    return res.data;
  },

  deleteCustomizationOption: async (id: string) => {
    const res = await apiClient.delete<any>(`/admin/customization-options/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete option');
    return res.data;
  },

  deleteCustomizationGroup: async (id: string) => {
    const res = await apiClient.delete<any>(`/admin/customization-options/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete option');
    return res.data;
  },

  // Fabric Reference Management
  getFabrics: async () => {
    const res = await apiClient.get<any[]>('/admin/fabrics');
    return res.data || [];
  },

  createFabric: async (fabricData: any) => {
    const res = await apiClient.post<any>('/admin/fabrics', fabricData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create fabric');
    return res.data;
  },

  updateFabric: async (id: string, fabricData: any) => {
    const res = await apiClient.put<any>(`/admin/fabrics/${id}`, fabricData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update fabric');
    return res.data;
  },

  deleteFabric: async (id: string) => {
    const res = await apiClient.delete<any>(`/admin/fabrics/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete fabric');
    return res.data;
  },

  // Coupon Management
  getCoupons: async () => {
    const res = await apiClient.get<any[]>('/admin/coupons');
    return res.data || [];
  },

  createCoupon: async (couponData: any) => {
    const res = await apiClient.post<any>('/admin/coupons', couponData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create coupon');
    return res.data;
  },

  updateCoupon: async (id: string, couponData: any) => {
    const res = await apiClient.put<any>(`/admin/coupons/${id}`, couponData);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update coupon');
    return res.data;
  },

  deleteCoupon: async (id: string) => {
    const res = await apiClient.delete<any>(`/admin/coupons/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete coupon');
    return res.data;
  },

  toggleCouponStatus: async (id: string, active: boolean) => {
    const res = await apiClient.put<any>(`/admin/coupons/${id}/status`, { active });
    if (!res.success) throw new Error(res.error?.message || 'Failed to update coupon status');
    return res.data;
  },

  // Order Management & Status Workflow
  getAdminOrders: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const endpoint = `/admin/orders${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<any>(endpoint);
    return res.data || { orders: [], totalPages: 1 };
  },

  getOrders: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const endpoint = `/admin/orders${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<any>(endpoint);
    return res.data || { orders: [], totalPages: 1 };
  },

  updateOrderStatus: async (
    orderId: string,
    status: string,
    trackingNumber?: string,
    carrier?: string,
  ) => {
    const res = await apiClient.put<any>(`/admin/orders/${orderId}/status`, {
      status,
      trackingNumber,
      carrier,
    });
    if (!res.success) throw new Error(res.error?.message || 'Failed to update order status');
    return res.data;
  },

  // Customer Management
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);

    const endpoint = `/admin/customers${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<any>(endpoint);
    return res.data || { customers: [], totalPages: 1 };
  },

  getCustomerDetail: async (userId: string) => {
    const res = await apiClient.get<any>(`/admin/customers/${userId}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to fetch customer details');
    return res.data;
  },

  updateCustomerRole: async (userId: string, role: 'CUSTOMER' | 'ADMIN') => {
    const res = await apiClient.put<any>(`/admin/customers/${userId}/role`, { role });
    if (!res.success) throw new Error(res.error?.message || 'Failed to update customer role');
    return res.data;
  },

  // Security Audit Logs
  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const endpoint = `/admin/audit-logs${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<any>(endpoint);
    return res.data || { logs: [] };
  },

  // Cloudinary Signed Image Uploads
  getCloudinarySignature: async (folder: string = 'stitchx_uploads') => {
    const res = await apiClient.get<any>(`/admin/cloudinary-signature?folder=${encodeURIComponent(folder)}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to get Cloudinary upload signature');
    return res.data;
  },

  deleteCloudinaryAsset: async (publicId: string) => {
    const res = await apiClient.post<any>('/admin/cloudinary-delete', { public_id: publicId });
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete Cloudinary asset');
    return res.data;
  },
};
