const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const serverBaseUrl = import.meta.env.VITE_SERVER_URL || rawApiUrl.replace(/\/api\/?$/, '');

export const APP_CONFIG = {
  appName: 'Stitchx Plus LLC',
  apiBaseUrl: rawApiUrl,
  serverHealthUrl: `${serverBaseUrl}/health`,
};
