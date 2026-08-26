import { APP_CONFIG } from '../constants/config';
import { HealthResponse } from '@stitchx/shared';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}/health`);
  if (!response.ok) {
    throw new Error('Failed to fetch server health status');
  }
  return response.json();
}
