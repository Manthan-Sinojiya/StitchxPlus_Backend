import { create } from 'zustand';
import { User } from '@stitchx/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('stitchx_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
};

const getStoredToken = (): string | null => {
  return localStorage.getItem('stitchx_access_token');
};

const initialUser = getStoredUser();
const initialToken = getStoredToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: !!(initialUser && initialToken),
  isLoading: true,
  setAuth: (user: User, accessToken: string) => {
    try {
      localStorage.setItem('stitchx_user', JSON.stringify(user));
      localStorage.setItem('stitchx_access_token', accessToken);
    } catch (_e) {
      // Ignore quota errors
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
    // Dynamically import to avoid circular dependency
    import('./useCartStore').then(({ useCartStore }) => {
      useCartStore.getState().mergeCart();
    });
  },
  clearAuth: () => {
    localStorage.removeItem('stitchx_user');
    localStorage.removeItem('stitchx_access_token');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

