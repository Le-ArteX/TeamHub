"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import Link from "next/link";

function VerifyContent() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setStatus("verifying");
    try {
      const res = await api.get(`/auth/verify?code=${code}`);
      setStatus("success");
      setMessage(res.data.message);
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Invalid code. Please check your terminal log.");
    }
  };

  return (
    <div className="min-h-screen bg-mesh dark:bg-slate-950 flex items-center justify-center p-6 transition-all duration-500">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800 animate-fade-in text-center transition-all">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner transition-all">
          {status === "success" ? "✅" : status === "error" ? "❌" : "📧"}
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Verify Your Email
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          {status === "success" 
            ? message 
            : "Enter the 6-digit verification code we've logged in your server terminal."}
        </p>

        {status !== "success" && (
          <form onSubmit={handleVerify} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="0 0 0 0 0 0"
              className="w-full text-center text-4xl font-black tracking-[1rem] py-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
              required
            />
            
            <button 
              type="submit" 
              disabled={code.length !== 6 || status === "verifying"}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
            >
              {status === "verifying" ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-4 text-xs font-bold text-red-500 uppercase tracking-widest">{message}</p>
        )}

        {status === "success" && (
          <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
            Redirecting to dashboard...
          </p>
        )}

        <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 transition-all">
          <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
