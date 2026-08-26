import { create } from 'zustand';

interface AppState {
  cartCount: number;
  sidebarOpen: boolean;
  incrementCart: () => void;
  decrementCart: () => void;
  clearCart: () => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  cartCount: 0,
  sidebarOpen: false,
  incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  decrementCart: () => set((state) => ({ cartCount: Math.max(0, state.cartCount - 1) })),
  clearCart: () => set({ cartCount: 0 }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
