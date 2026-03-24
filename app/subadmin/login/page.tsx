"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"

export default function SubAdminLoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const handleLogin = async () => {
    if (!username.trim() || !password) { setError("Enter your username and password"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()

      if (!data.success || !data.user) {
        setError(data.error || "Invalid credentials"); return
      }
      if (data.user.role !== "subadmin") {
        setError("Access denied. This portal is for Sub Administrators only."); return
      }

      login(data.user)
      router.push("/subadmin/queue")
    } catch { setError("Network error. Please try again.") }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter">

      {/* Tricolor */}
      <div className="gov-banner" />

      {/* Gov strip */}
      <div className="bg-slate-100 border-b border-slate-200 text-[11px] py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="text-slate-600 font-medium">
            GOVERNMENT OF JAMMU &amp; KASHMIR /&nbsp;
            <span className="text-slate-400">जम्मू और कश्मीर सरकार</span>
          </span>
          <span className="text-slate-400">District Administration Anantnag</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm tricolor-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0 overflow-hidden p-1.5"><img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain"/></div>
            <div className="border-l border-slate-300 pl-4">
              <h1 className="text-xl font-black tracking-tight text-gov-navy uppercase">E-ARZI ANANTNAG</h1>
              <p className="text-[11px] font-semibold text-gov-green uppercase tracking-wide">District Arzi Portal</p>
            </div>
          </Link>
          <Link href="/auth/login" className="text-sm font-bold text-slate-500 hover:text-gov-navy flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span> Citizen Portal
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">

          {/* Icon + title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <span className="material-symbols-outlined text-white text-[40px]">admin_panel_settings</span>
            </div>
            <div className="flex items-center gap-2 justify-center mb-2">
              <span className="h-0.5 w-10 bg-gov-saffron" />
              <span className="text-[10px] font-bold text-gov-saffron uppercase tracking-[0.25em]">Restricted Portal</span>
              <span className="h-0.5 w-10 bg-gov-saffron" />
            </div>
            <h2 className="text-2xl font-black text-gov-navy uppercase tracking-tight">Sub Admin Login</h2>
            <p className="text-sm text-slate-500 mt-1">Anantnag District Arzi Administration</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            {/* Card top accent */}
            <div className="h-1 flex">
              <div className="flex-1 bg-gov-saffron" />
              <div className="flex-1 bg-white border-y border-slate-200" />
              <div className="flex-1 bg-gov-green" />
            </div>

            <div className="p-8 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    person
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError("") }}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="your.username"
                    className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError("") }}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 pl-9 pr-10 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{showPwd ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gov-navy hover:bg-[#001a40] text-white font-black py-3.5 rounded text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md mt-2">
                {loading
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Signing In…</>
                  : <><span className="material-symbols-outlined text-[18px]">login</span> Sign In to Portal</>}
              </button>

              {/* Info */}
              <p className="text-center text-[11px] text-slate-400">
                Credentials issued by Super Administrator only
              </p>
            </div>
          </div>

          {/* Other portals */}
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <Link href="/auth/login?tab=citizen"
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:border-gov-navy/40 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-gov-green">phone_iphone</span>
              Citizen Portal
            </Link>
            <Link href="/admin/login"
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:border-gov-navy/40 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-gov-saffron">shield</span>
              Admin Login
            </Link>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-6">
            District Administration Anantnag · Government of J&K
          </p>
        </div>
      </main>
    </div>
  )
}
