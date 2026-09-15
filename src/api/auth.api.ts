import { apiClient } from "@/api/client";
import type {
  LoginRequest,
  PasswordChangeRequest,
  PasswordResetConfirmRequest,
  ProfileUpdateRequest,
  TokenResponse,
  User,
} from "@/types/auth";

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<TokenResponse>("/auth/login", payload).then((response) => response.data);
  },
  refresh(refresh_token: string) {
    return apiClient.post<TokenResponse>("/auth/refresh", { refresh_token }).then((response) => response.data);
  },
  logout() {
    return apiClient.post<void>("/auth/logout").then((response) => response.data);
  },
  me() {
    return apiClient.get<User>("/auth/me").then((response) => response.data);
  },
  updateMe(payload: ProfileUpdateRequest) {
    return apiClient.patch<User>("/auth/me", payload).then((response) => response.data);
  },
  changePassword(payload: PasswordChangeRequest) {
    return apiClient.post<void>("/auth/change-password", payload).then((response) => response.data);
  },
  resetPassword(payload: PasswordResetConfirmRequest) {
    return apiClient.post<void>("/auth/reset-password", payload).then((response) => response.data);
  },
};
