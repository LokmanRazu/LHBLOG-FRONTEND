"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // Or a loading spinner
  }

  return <>{children}</>;
}
