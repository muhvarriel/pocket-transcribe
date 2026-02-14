import React, { createContext, useContext, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useAuthSession } from "../hooks/useAuthSession";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthSession();

  // Memoize the context value to avoid re-rendering all consumers on every auth change
  // if only specific properties changed (though useAuthSession likely updates all at once)
  const value = useMemo(
    () => ({
      session: auth.session,
      user: auth.user,
      loading: auth.loading,
      signOut: auth.signOut,
    }),
    [auth.session, auth.user, auth.loading, auth.signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
