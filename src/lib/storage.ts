import type { TokenResponse } from "@/types/auth";

const ACCESS_TOKEN_KEY = "apex.access_token";
const REFRESH_TOKEN_KEY = "apex.refresh_token";

export const tokenStorage = {
  getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(tokens: TokenResponse) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
