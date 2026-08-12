"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("session_token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
          
          // If we are on the login page and authenticated, redirect to dashboard
          if (pathname === "/login" || pathname === "/") {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("session_token");
          if (pathname !== "/login") {
            router.push("/login");
          }
        }
      } else {
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [pathname, router]);

  const login = async (token: string) => {
    localStorage.setItem("session_token", token);
    const res = await api.get("/auth/me");
    setUser(res.data);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("session_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
