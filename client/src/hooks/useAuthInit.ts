import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';

export function useAuthInit() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const response = await authService.refreshToken();
        if (isMounted && response.success && response.data) {
          setAuth(response.data.user, response.data.accessToken);
        } else if (isMounted) {
          clearAuth();
        }
      } catch (_err) {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setLoading]);
}
