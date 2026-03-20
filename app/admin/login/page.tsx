"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"

export default function AdminLoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError("Please enter both username and password")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()

      if (data.success && data.user) {
        if (data.user.role !== "superadmin") {
          setError("Access denied. This portal is restricted to Super Administrators only.")
          setLoading(false)
          return
        }
        login(data.user)
        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Invalid credentials. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#001a40] flex flex-col font-inter">

      {/* Tricolor top accent */}
      <div className="h-1 w-full flex-shrink-0">
        <div className="h-full" style={{ background: "linear-gradient(to right, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%)" }} />
      </div>

      {/* Header strip */}
      <div className="bg-[#002147] border-b border-white/10 py-4 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gov-saffron flex items-center justify-center">
            <span className="text-white font-black text-[11px]">J&K</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide">E-ARZI ANANTNAG</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">District Administration Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
          Secure Government Network
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Lock icon + title */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gov-saffron/10 border-2 border-gov-saffron/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-gov-saffron text-4xl">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Super Administrator
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Anantnag District Administration Control Panel
            </p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-red-900/40 border border-red-500/30 rounded text-[11px] text-red-300 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Restricted Access — Authorised Personnel Only
            </div>
          </div>

          {/* Login card */}
          <div className="bg-[#002147] border border-white/10 rounded p-8 shadow-2xl">

            {error && (
              <div className="mb-5 p-3 bg-red-900/40 border border-red-500/40 rounded flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 flex-shrink-0">error</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Administrator Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">person</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    className="w-full bg-[#001a40] border border-white/10 text-white placeholder-slate-600 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-gov-saffron/60 focus:bg-[#001530] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">key</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    className="w-full bg-[#001a40] border border-white/10 text-white placeholder-slate-600 pl-10 pr-12 py-3 rounded text-sm focus:outline-none focus:border-gov-saffron/60 focus:bg-[#001530] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gov-saffron hover:bg-[#e68a2e] disabled:opacity-60 text-white font-bold py-3.5 rounded text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-2"
              >
                {loading
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Authenticating...</>
                  : <><span className="material-symbols-outlined text-[18px]">login</span> Access Admin Panel</>
                }
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mt-8 pt-5">
              <div className="flex items-start gap-3 text-[11px] text-slate-500">
                <span className="material-symbols-outlined text-[16px] text-slate-600 mt-0.5">info</span>
                <p>
                  This is a high-security portal. All login attempts are logged and monitored. Unauthorised access is a criminal offence under the IT Act, 2000.
                </p>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center mt-8">
            <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#001030] border-t border-white/5 py-4 px-8 text-center flex-shrink-0">
        <p className="text-[11px] text-slate-600">
          © 2026 District Administration, Anantnag · Government of Jammu &amp; Kashmir · NIC Hosted
        </p>
      </div>
    </div>
  )
}
