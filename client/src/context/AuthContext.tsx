import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../../../shared/types/index.js";

const BASE_URL = import.meta.env.PROD ? "https://eagle-eyes.onrender.com" : "";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, firstName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (firstName: string) => Promise<void>;
  updateGender: (gender: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((u: AuthUser | null) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string, rememberMe = false) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Login failed");
    }
    setUser((await res.json()) as AuthUser);
  }

  async function register(email: string, password: string, firstName: string) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Registration failed");
    }
    setUser((await res.json()) as AuthUser);
  }

  async function logout() {
    await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }

  async function updateProfile(firstName: string) {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Update failed");
    }
    setUser((await res.json()) as AuthUser);
  }

  async function updateGender(gender: string) {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Update failed");
    }
    setUser((await res.json()) as AuthUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, updateGender }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
