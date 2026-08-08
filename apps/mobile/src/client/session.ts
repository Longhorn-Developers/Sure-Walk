import axios, { AxiosResponse } from "axios";
import { API_URL } from "./auth";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const api = axios.create({
  baseURL: API_URL,
  validateStatus: (status) => status !== 401,
});

export const ok = (resp: AxiosResponse) => {
  return resp.status >= 200 && resp.status < 300;
};

api.interceptors.request.use(
  async (config) => {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = await SecureStore.getItemAsync("refreshToken");
          if (refreshToken) {
            const resp = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = resp.data;

            await SecureStore.setItemAsync("accessToken", newAccessToken);
            await SecureStore.setItemAsync("refreshToken", newRefreshToken);

            processQueue(null, newAccessToken);
            return api(originalRequest);
          }
        } catch (refreshError: unknown) {
          if (axios.isAxiosError(refreshError) && refreshError.status === 401) {
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("refreshToken");
            router.replace("/login");
          }
          processQueue(refreshError, null);
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string | null) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }
    }

    return Promise.reject(error);
  },
);
