"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { signInUser, getMyProfile, LoginRequestDto, LoginResponseDto, UserResponseDto } from "@/lib/api";
import { ApiResponse } from "@/lib/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  accessToken: string;
}

import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponseDto | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserResponseDto | null>(null);
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
    const result: ApiResponse<UserResponseDto> = await getMyProfile(token);
    if (result.data) {
      setUser(result.data);
      setIsAuthenticated(true);
    } else {
      console.error("Failed to fetch user profile:", result.error);
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const result: ApiResponse<LoginResponseDto> = await signInUser({ email, password });
    if (result.data && result.data.accessToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
      setAccessToken(result.data.accessToken);
      await fetchUserProfile(result.data.accessToken);
      setLoading(false);
      return true;
    } else {
      console.error("Login failed:", result.error);
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
