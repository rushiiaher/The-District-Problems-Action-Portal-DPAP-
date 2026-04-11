"use client"

import { useState, useRef, useEffect } from "react"
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
  const [loginOpen, setLoginOpen]       = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loginRef     = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) &&
          !(e.target as Element).closest('#mobile-toggle-subadmin')) setMobileMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-8 z-50 border-b border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[88px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-black leading-tight uppercase tracking-tight">E-ARZI ANANTNAG</h1>
                <p className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-widest mt-0.5">District Public Service Portal</p>
                <p className="text-[9px] md:text-[10px] font-bold text-black tracking-wide">जिला सार्वजनिक सेवा पोर्टल</p>
                <p className="text-[9px] md:text-[10px] font-bold text-black tracking-wide" style={{ fontFamily: "serif" }}>ضلعی عوامی خدمات پورٹل</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { label: "Home", href: "/" },
                { label: "Arzi", href: "/#grievance" },
                { label: "Red Cross", href: "/#red" },
                { label: "Helplines", href: "/helpline" },
              ].map(item => (
                <Link key={item.label} href={item.href} className="text-sm font-bold text-slate-700 hover:text-gov-navy transition-colors border-b-2 border-transparent hover:border-gov-navy py-1 uppercase tracking-wider">
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/complaint/track" className="bg-slate-100 hover:bg-slate-200 text-gov-navy border border-slate-300 px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">search</span> Track Arzi
              </Link>
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setLoginOpen(o => !o)}
                  className="flex items-center gap-2 px-6 py-2 bg-gov-navy text-white font-bold text-sm hover:bg-[#001a40] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span> Login
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>arrow_drop_down</span>
                </button>
                {loginOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-300 shadow-xl z-50">
                    <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Login Type</p>
                    </div>
                    <Link href="/auth/login?tab=citizen" onClick={() => setLoginOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gov-navy/10 transition-colors border-b border-slate-100 cursor-pointer">
                        <span className="material-symbols-outlined text-gov-navy">badge</span>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Citizen Portal</p>
                          <p className="text-[11px] text-slate-500">Register or Track</p>
                        </div>
                      </div>
                    </Link>
                    <Link href="/auth/login?tab=staff" onClick={() => setLoginOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gov-navy/10 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-gov-navy">admin_panel_settings</span>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Official / Staff</p>
                          <p className="text-[11px] text-slate-500">Department Access</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              id="mobile-toggle-subadmin"
              className="lg:hidden text-gov-navy p-2 border border-slate-300 hover:bg-slate-50 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-300 shadow-xl flex flex-col p-4 space-y-1 z-50">
            {[
              { label: "Home", href: "/" },
              { label: "Arzi", href: "/#grievance" },
              { label: "Red Cross", href: "/#red" },
              { label: "Helplines", href: "/helpline" },
            ].map(item => (
              <Link key={item.label} href={item.href} className="text-sm font-bold text-slate-700 p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link href="/auth/login?tab=citizen" className="bg-gov-navy text-white text-center font-bold py-3 text-sm border border-[#001a40]" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
              <Link href="/auth/login?tab=staff" className="bg-gov-navy text-white text-center font-bold py-3 text-sm border border-[#001a40]" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
            </div>
            <Link href="/complaint/track" className="bg-slate-100 text-slate-800 border border-slate-300 text-center font-bold py-3 text-sm w-full mt-3 block" onClick={() => setMobileMenuOpen(false)}>
              Track Arzi Status
            </Link>
          </div>
        )}
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
