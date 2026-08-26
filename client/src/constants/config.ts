const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const serverBaseUrl = import.meta.env.VITE_SERVER_URL || apiBaseUrl.replace(/\/api\/?$/, '');

export const APP_CONFIG = {
  appName: 'Stitchx Plus LLC',
  apiBaseUrl,
  serverHealthUrl: `${serverBaseUrl}/health`,
};
