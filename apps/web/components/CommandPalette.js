"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const actions = [
    { label: "Go to Dashboard", path: "/dashboard", icon: "📊" },
    { label: "View Goals", path: "/dashboard/goals", icon: "🎯" },
    { label: "Check Announcements", path: "/dashboard/announcements", icon: "📢" },
    { label: "Manage Tasks", path: "/dashboard/actions", icon: "⚡" },
    { label: "Workspace Analytics", path: "/dashboard/analytics", icon: "📈" },
    { label: "Open Settings", path: "/dashboard/settings", icon: "⚙️" },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-all" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 animate-in fade-in zoom-in duration-200 transition-all">
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xl mr-3">🔍</span>
          <input
            autoFocus
            className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm font-bold h-10 outline-none"
            placeholder="Search for pages or actions... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) {
                router.push(filtered[0].path);
                setIsOpen(false);
              }
            }}
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map((action) => (
                <button
                  key={action.path}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all group"
                  onClick={() => {
                    router.push(action.path);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-lg group-hover:scale-125 transition-transform">{action.icon}</span>
                  <span>{action.label}</span>
                  <span className="ml-auto text-[10px] text-slate-300 font-black uppercase tracking-widest">Go to</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center px-6">
              <p className="text-sm font-bold text-slate-400">No results found for "{query}"</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 transition-all">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black shadow-sm text-slate-500 dark:text-slate-400 transition-all">ENTER</kbd>
              <span className="text-[10px] font-bold text-slate-400 uppercase">to select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black shadow-sm text-slate-500 dark:text-slate-400 transition-all">ESC</kbd>
              <span className="text-[10px] font-bold text-slate-400 uppercase">to close</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Command Palette</span>
        </div>
      </div>
    </div>
  );
}
