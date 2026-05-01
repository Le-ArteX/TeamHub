"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/authStore";

export default function AuthGuard({ children }) {
  const { user, loading, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
