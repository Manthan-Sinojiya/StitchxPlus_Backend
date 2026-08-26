import { create } from 'zustand';
import { Cart, AddCartItemInput } from '@stitchx/shared';
import { cartService } from '../services/cartService';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (input: AddCartItemInput) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  mergeCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load cart', isLoading: false });
    }
  },

  addItem: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.addItem(input);
      set({ cart, isLoading: false, isOpen: true });
    } catch (err: any) {
      set({ error: err.message || 'Failed to add item to cart', isLoading: false });
      throw err;
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.updateItem(itemId, { quantity });
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update item', isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.removeItem(itemId);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove item', isLoading: false });
      throw err;
    }
  },

  applyCoupon: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.applyCoupon(code);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to apply coupon', isLoading: false });
      throw err;
    }
  },

  removeCoupon: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.removeCoupon();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove coupon', isLoading: false });
      throw err;
    }
  },

  mergeCart: async () => {
    try {
      const cart = await cartService.mergeCart();
      set({ cart });
    } catch (_err) {
      // Ignore merge errors silently on login if no guest cart existed
      await get().fetchCart();
    }
  },
}));
