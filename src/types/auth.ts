export type Role = {
  id: number;
  name: string;
};

export type User = {
  email: string;
  full_name?: string | null;
  id: number;
  is_active: boolean;
  is_superuser: boolean;
  role?: Role | null;
};

export type UserCreate = {
  email: string;
  full_name?: string | null;
  password: string;
  role_id: number;
};

export type UserUpdate = {
  full_name?: string | null;
  is_active?: boolean | null;
  role_id?: number | null;
  password?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type PasswordChangeRequest = {
  current_password: string;
  new_password: string;
};

export type PasswordResetConfirmRequest = {
  token: string;
  new_password: string;
};

export type ProfileUpdateRequest = {
  email?: string;
  full_name?: string | null;
};

