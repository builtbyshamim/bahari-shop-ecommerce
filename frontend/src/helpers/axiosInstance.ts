/* eslint-disable no-undef */
import axios from 'axios';
import Cookies from 'js-cookie';

const getAccessToken = () => Cookies.get('ecommerce_accessToken') || null;
const getRefreshToken = () => Cookies.get('ecommerce_refreshToken') || null;

const setTokens = (accessToken: string, refreshToken: string) => {
  const ACCESS_TOKEN_TTL = Number(process.env.NEXT_PUBLIC_JWT_ACCESS_TOKEN_TTL) || 1296000;
  const REFRESH_TOKEN_TTL = Number(process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_TTL) || 1296000;

  Cookies.set('ecommerce_accessToken', accessToken, {
    expires: ACCESS_TOKEN_TTL / (60 * 60 * 24),
    secure: true,
    sameSite: 'strict',
  });
  Cookies.set('ecommerce_refreshToken', refreshToken, {
    expires: REFRESH_TOKEN_TTL / (60 * 60 * 24),
    secure: true,
    sameSite: 'strict',
  });
};

const clearTokens = () => {
  Cookies.remove('ecommerce_accessToken');
  Cookies.remove('ecommerce_refreshToken');
};

const instance = axios.create({
  withCredentials: true,
  timeout: 60000,
});

// ✅ Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Response interceptor
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Auth route গুলো — এগুলোতে refresh চেষ্টা করবে না
const AUTH_ROUTES = ['/auth/user-login', '/auth/register', '/auth/refresh-token'];

const isAuthRoute = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_ROUTES.some((route) => url.includes(route));
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const should401Retry =
      error?.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url);

    if (should401Retry) {
      const refreshToken = getRefreshToken();

        // refresh token না থাকলে — শুধু reject করো, redirect করো না
      // public page গুলো যেন login ছাড়াও browse করা যায়
      if (!refreshToken) {
        clearTokens();
        return Promise.reject({
          statusCode: 401,
          message: 'Authentication required.',
        });
      }

      // অন্য request গুলো queue-তে রাখো
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = data?.data?.tokens?.accessToken;
        const newRefreshToken = data?.data?.tokens?.refreshToken;

        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // clearTokens();
        // window.location.href = '/login';
        return Promise.reject({
          statusCode: 401,
          message: 'Session expired. Please login again.',
        });
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ অন্য সব error
    const responseObject = {
      statusCode: error?.response?.status || 500,
      message: error?.response?.data?.message || 'Something went wrong!',
    };
    return Promise.reject(responseObject);
  },
);

export { instance, setTokens, clearTokens, getAccessToken };
