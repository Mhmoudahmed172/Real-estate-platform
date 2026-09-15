import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler } from "@/api/client";
import { authApi } from "@/api/auth.api";
import { AuthContext, type AuthContextValue, type AuthStatus } from "@/features/auth/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
import { tokenStorage } from "@/lib/storage";
import type { LoginRequest } from "@/types/auth";

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(tokenStorage.getAccessToken()));

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    enabled: hasToken,
    retry: false,
  });

  const login = useCallback(
    async (payload: LoginRequest) => {
      const tokens = await authApi.login(payload);
      tokenStorage.setTokens(tokens);
      setHasToken(true);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      if (hasToken) await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession, hasToken]);

  const status: AuthStatus = hasToken
    ? meQuery.isPending
      ? "bootstrapping"
      : meQuery.data
        ? "authenticated"
        : "guest"
    : "guest";

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      status,
      login,
      logout,
      clearSession,
    }),
    [clearSession, login, logout, meQuery.data, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
