"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { signInUser, getMyProfile } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; name: string; email: string } | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    const { data, error } = await getMyProfile(token);
    if (data) {
      setUser(data);
      setIsAuthenticated(true);
    } else {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const { data, error } = await signInUser({ email, password });
    if (data && data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);
      await fetchUserProfile(data.accessToken);
      setLoading(false);
      return true;
    } else {
      console.error("Login failed:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    router.push("/auth/signin"); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, accessToken, login, logout, loading }}
    >
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
