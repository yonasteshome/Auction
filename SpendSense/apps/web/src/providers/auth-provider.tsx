"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { forgotPassword, register, resetPassword } from "@/actions/auth";
import { type LoginPayload, type RegisterPayload, type UserProfile } from "@/lib/auth-types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfile | null;
  accessToken: string | null;
  signIn: (payload: LoginPayload) => Promise<UserProfile>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (uid: string, token: string, newPassword: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const scheduleRef = useRef<number | null>(null);

  const resetSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    if (scheduleRef.current) window.clearTimeout(scheduleRef.current);
  }, []);

  const hydrateCurrentUser = useCallback(async (maybePayload?: any): Promise<UserProfile | null> => {
    try {
      // If caller provided payload, use it; otherwise fetch
      const payload = maybePayload ?? (await fetch(`/api/auth/me`).then((r) => (r.ok ? r.json() : null)));
      if (!payload) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }

      setUser(payload as UserProfile);
      if (payload.accessToken) {
        setAccessToken(payload.accessToken);
      }
      setStatus("authenticated");
      return payload as UserProfile;
    } catch (err) {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        const meRes = await fetch(`/api/auth/me`);
        if (meRes.ok) {
          const payload = await meRes.json();
          await hydrateCurrentUser(payload);
          const expiry = payload?.access_expires_in ?? 60 * 60;
          // schedule refresh
          if (expiry) {
            // refresh at 85% of expiry
            const ms = Math.max(1000 * (expiry * 0.85), 1000 * 30);
            if (scheduleRef.current) window.clearTimeout(scheduleRef.current);
            scheduleRef.current = window.setTimeout(async () => {
              try {
                const r = await fetch(`/api/auth/refresh`, { method: "POST" });
                if (r.ok) {
                  // re-hydrate
                  const me = await fetch(`/api/auth/me`).then((r2) => (r2.ok ? r2.json() : null));
                  if (me) await hydrateCurrentUser(me);
                } else {
                  resetSession();
                }
              } catch {
                resetSession();
              }
            }, ms);
          }
          return;
        }

        // not authenticated -> attempt rotate once
        const refreshRes = await fetch(`/api/auth/refresh`, { method: "POST" });
        if (!refreshRes.ok) {
          resetSession();
          return;
        }

        const meRes2 = await fetch(`/api/auth/me`);
        if (meRes2.ok) {
          const payload = await meRes2.json();
          await hydrateCurrentUser(payload);
          const expiry = payload?.access_expires_in ?? 60 * 60;
          const ms = Math.max(1000 * (expiry * 0.85), 1000 * 30);
          if (scheduleRef.current) window.clearTimeout(scheduleRef.current);
          scheduleRef.current = window.setTimeout(async () => {
            try {
              const r = await fetch(`/api/auth/refresh`, { method: "POST" });
              if (r.ok) {
                const me = await fetch(`/api/auth/me`).then((r2) => (r2.ok ? r2.json() : null));
                if (me) await hydrateCurrentUser(me);
              } else {
                resetSession();
              }
            } catch {
              resetSession();
            }
          }, ms);
          return;
        }

        resetSession();
      } catch (error) {
        resetSession();
      }
    };

    void boot();
  }, [hydrateCurrentUser, resetSession]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Login failed");
      }

      const meRes = await fetch(`/api/auth/me`);
      if (!meRes.ok) throw new Error("Failed to fetch current user after login");
      const me = await meRes.json();
      if (me.accessToken) {
        setAccessToken(me.accessToken);
      }
      await hydrateCurrentUser(me);
      return me as UserProfile;
    },
    [hydrateCurrentUser],
  );

  const signUp = useCallback(async (payload: RegisterPayload) => {
    await register(payload);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await forgotPassword(email);
  }, []);

  const confirmPasswordReset = useCallback(async (uid: string, token: string, newPassword: string) => {
    await resetPassword({ uid, token, new_password: newPassword });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch(`/api/auth/logout`, { method: "POST" });
    } catch {
      // best-effort
    }
    resetSession();
  }, [resetSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      signIn,
      signUp,
      requestPasswordReset,
      confirmPasswordReset,
      signOut,
    }),
    [
      accessToken,
      confirmPasswordReset,
      requestPasswordReset,
      signIn,
      signOut,
      signUp,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
