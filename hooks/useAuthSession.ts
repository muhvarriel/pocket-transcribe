import { useState, useEffect, useCallback, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // 3. Handle Deep Links
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;

      if (url.includes("#") || url.includes("?")) {
        const paramsStr = url.includes("#")
          ? url.split("#")[1]
          : url.split("?")[1];
        const params = new URLSearchParams(paramsStr);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          supabase.auth.setSession({
            access_token,
            refresh_token,
          });
        }
      }
    };

    const sub = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url && isMounted.current) handleDeepLink({ url });
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  return {
    session,
    user,
    loading,
    signOut,
  };
}
