import { apiClient } from './apiClient';
import { UserAddressBookEntry, WishlistItem, UpdateProfileInput } from '@stitchx/shared';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  addresses: UserAddressBookEntry[];
  wishlist: WishlistItem[];
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>('/users/me');
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to fetch profile');
    return res.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<UserProfile> {
    const res = await apiClient.patch<UserProfile>('/users/me', data);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to update profile');
    return res.data;
  },

  async getAddresses(): Promise<UserAddressBookEntry[]> {
    const res = await apiClient.get<UserAddressBookEntry[]>('/users/me/addresses');
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to fetch addresses');
    return res.data;
  },

  async addAddress(address: Omit<UserAddressBookEntry, 'id' | '_id'>): Promise<UserAddressBookEntry[]> {
    const res = await apiClient.post<UserAddressBookEntry[]>('/users/me/addresses', address);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to add address');
    return res.data;
  },

  async updateAddress(addressId: string, address: Partial<UserAddressBookEntry>): Promise<UserAddressBookEntry[]> {
    const res = await apiClient.patch<UserAddressBookEntry[]>(`/users/me/addresses/${addressId}`, address);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to update address');
    return res.data;
  },

  async deleteAddress(addressId: string): Promise<UserAddressBookEntry[]> {
    const res = await apiClient.delete<UserAddressBookEntry[]>(`/users/me/addresses/${addressId}`);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to delete address');
    return res.data;
  },

  async getWishlist(): Promise<WishlistItem[]> {
    const res = await apiClient.get<WishlistItem[]>('/users/me/wishlist');
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to fetch wishlist');
    return res.data;
  },

  async addToWishlist(productId: string): Promise<WishlistItem[]> {
    const res = await apiClient.post<WishlistItem[]>(`/users/me/wishlist/${productId}`);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to add to wishlist');
    return res.data;
  },

  async removeFromWishlist(productId: string): Promise<WishlistItem[]> {
    const res = await apiClient.delete<WishlistItem[]>(`/users/me/wishlist/${productId}`);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to remove from wishlist');
    return res.data;
  },
};
