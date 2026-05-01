"use client";
import AuthGuard from "../../components/AuthGuard";
import Sidebar from "../../components/Sidebar";
import CommandPalette from "../../components/CommandPalette";
import useAuthStore from "../../store/authStore";

export default function DashboardLayout({ children }) {
  const { user } = useAuthStore();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {user && !user.isVerified ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">
                  ⚠️
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Verification Required</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                  You need to verify your email before you can access the dashboard.
                </p>
                <button 
                  onClick={() => window.location.href = "/verify"}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Go to Verification Page
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-6 py-8">
              {children}
            </div>
          )}
        </main>

        <CommandPalette />
      </div>
    </AuthGuard>
  );
}
