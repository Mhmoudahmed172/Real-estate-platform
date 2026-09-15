import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/storage";
import type { TokenResponse } from "@/types/auth";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<TokenResponse> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export const apiClient = axios.create({
  baseURL: env.apiRoot,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: env.apiRoot,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

async function refreshTokens() {
  const refresh_token = tokenStorage.getRefreshToken();
  if (!refresh_token) throw new Error("Missing refresh token");

  refreshPromise ??= refreshClient
    .post<TokenResponse>("/auth/refresh", { refresh_token })
    .then((response) => {
      tokenStorage.setTokens(response.data);
      return response.data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function isAuthEndpoint(url: string | undefined) {
  return Boolean(url?.includes("/auth/login") || url?.includes("/auth/refresh"));
}

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!tokenStorage.getRefreshToken()) {
      tokenStorage.clear();
      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    try {
      const tokens = await refreshTokens();
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      unauthorizedHandler?.();
      return Promise.reject(refreshError instanceof Error ? refreshError : new Error("Token refresh failed"));
    }
  },
);
