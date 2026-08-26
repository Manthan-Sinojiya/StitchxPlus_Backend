import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../services/api';

export function useHealth() {
  return useQuery({
    queryKey: ['serverHealth'],
    queryFn: fetchHealth,
    retry: 1,
    refetchInterval: 30000,
  });
}
