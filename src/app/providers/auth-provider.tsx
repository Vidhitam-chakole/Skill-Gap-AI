import { createContext, useContext, type ReactNode } from "react";
import { useAuthStore } from "@/shared/store";
import type { Developer } from "@/shared/types";

interface AuthContextValue {
  user: Developer | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  setUser: (user: Developer | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        onboardingComplete: store.onboardingComplete,
        setUser: store.setUser,
        setOnboardingComplete: store.setOnboardingComplete,
        logout: store.logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
