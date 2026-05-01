import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-slate-200/50">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">T</div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TeamHub</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Enterprise</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-all">Sign In</Link>
              <Link href="/register" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              NEW: OPTIMISTIC UI UPDATES
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tighter text-slate-900 dark:text-white">
              The command center for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">modern teams.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 font-medium leading-relaxed max-w-xl">
              Collaborative Team Hub brings all your goals, announcements, and tasks into one unified real-time workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-xl shadow-blue-500/20">
                Start for free
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 hover:text-blue-600 hover:shadow-lg transition-all duration-300">
                Book a demo
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-4 grayscale opacity-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted by 2,000+ teams</span>
            </div>
          </div>

          {/* Abstract Visual Asset */}
          <div className="relative animate-slide-in">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative glass rounded-[32px] p-8 shadow-2xl border-white/50 overflow-hidden group">
              <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-2 w-32 bg-slate-200 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 w-full bg-white rounded-xl shadow-sm border border-slate-100 animate-pulse"></div>
                  <div className="h-12 w-3/4 bg-white rounded-xl shadow-sm border border-slate-100 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-32 w-full bg-blue-50 rounded-xl border border-blue-100/50 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 shadow-lg shadow-blue-500/40 flex items-center justify-center text-white text-xl">🎯</div>
                  </div>
                  <div className="h-12 w-full bg-white rounded-xl shadow-sm border border-slate-100 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need, in one place.</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Stop jumping between apps. Collaborative Team Hub integrates your entire workflow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "🎯", title: "Goal Tracking", desc: "Set high-level goals and track milestones with real-time progress bars.", color: "blue" },
            { icon: "📢", title: "Announcements", desc: "Keep the whole team aligned with rich-text updates and instant reactions.", color: "cyan" },
            { icon: "⚡", title: "Action Items", desc: "Manage tasks with a high-performance Kanban board built for speed.", color: "indigo" },
          ].map((f, i) => (
            <div key={i} className="group bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 hover:border-blue-500/30 rounded-3xl p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">{f.icon}</div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">T</div>
            <span className="text-lg font-bold tracking-tight">TeamHub</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">&copy; {new Date().getFullYear()} Collaborative Team Hub. Powered by Next.js & Prisma.</p>
          <div className="flex gap-6 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
