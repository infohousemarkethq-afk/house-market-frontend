import { createContext, useMemo, type ReactNode } from "react";

import { useLogout } from "../features/auth/hooks/useAuthMutations";
import { useMe } from "../features/auth/hooks/useMe";
import { toViewRole } from "../features/auth/auth.utils";
import type { ApiUser, ViewRole } from "../features/auth/auth.types";

export interface AuthValue {
  user: ApiUser | null;
  viewRole: ViewRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  isSigningOut: boolean;
}

export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = useMe();
  const logout = useLogout();

  const user = data ?? null;

  const value = useMemo<AuthValue>(
    () => ({
      user,
      viewRole: user ? toViewRole(user.role) : null,
      isLoading: isPending,
      isAuthenticated: Boolean(user),
      signOut: () => logout.mutate(),
      isSigningOut: logout.isPending,
    }),
    [user, isPending, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
