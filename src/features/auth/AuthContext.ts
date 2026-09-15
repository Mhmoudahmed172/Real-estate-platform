import { createContext } from "react";
import type { LoginRequest, User } from "@/types/auth";

export type AuthStatus = "bootstrapping" | "authenticated" | "guest";

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
