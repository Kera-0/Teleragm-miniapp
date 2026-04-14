import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Attach Telegram initData to every request for backend validation
api.interceptors.request.use(config => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});
