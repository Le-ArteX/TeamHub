"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "../store/authStore";
import useWorkspaceStore from "../store/workspaceStore";
import useSocketStore from "../store/socketStore";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { icon: "📊", label: "Dashboard", path: "/dashboard" },
  { icon: "🎯", label: "Goals", path: "/dashboard/goals" },
  { icon: "📢", label: "Announcements", path: "/dashboard/announcements" },
  { icon: "⚡", label: "Actions", path: "/dashboard/actions" },
  { icon: "📈", label: "Analytics", path: "/dashboard/analytics" },
  { icon: "⚙️", label: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { workspaces, currentWorkspace, fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
  const { onlineUsers, notifications } = useSocketStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showWsDropdown, setShowWsDropdown] = useState(false);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 min-h-screen shadow-sm`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">T</div>
        {!collapsed && <span className="text-slate-900 dark:text-white font-bold tracking-tight">TeamHub</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-400 hover:text-blue-600 transition-colors text-sm">
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Workspace Selector */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-slate-50 dark:border-slate-800 relative">
          <button id="workspace-selector" onClick={() => setShowWsDropdown(!showWsDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white hover:border-blue-500/50 transition-all shadow-sm">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{ backgroundColor: currentWorkspace?.accentColor || '#2563eb' }}>
              {currentWorkspace?.name?.[0] || 'W'}
            </span>
            <span className="truncate flex-1 text-left font-medium">{currentWorkspace?.name || "Select workspace"}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {showWsDropdown && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 animate-fade-in ring-1 ring-black/5">
              {workspaces.map((ws) => (
                <button key={ws.id} onClick={() => { setCurrentWorkspace(ws); setShowWsDropdown(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors first:rounded-t-lg last:rounded-b-lg">
                  <span className="w-5 h-5 rounded text-xs font-bold text-white flex items-center justify-center shadow-sm" style={{ backgroundColor: ws.accentColor }}>{ws.name[0]}</span>
                  {ws.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"}`}>
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Online Users */}
      {!collapsed && onlineUsers.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Online ({onlineUsers.length})</p>
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 5).map((uid) => (
              <div key={uid} className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {!collapsed && notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">🔔 {notifications.length} new</p>
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 dark:text-white font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="text-slate-400 hover:text-blue-500 transition-all text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" title="Toggle Theme">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button id="logout-btn" onClick={logout} className="text-slate-400 hover:text-red-500 transition-all text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" title="Logout">⏻</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
