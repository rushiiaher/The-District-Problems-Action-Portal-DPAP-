"use client"

import { useState, Suspense, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f4f7f9]">
        <span className="material-symbols-outlined animate-spin text-4xl text-gov-navy">progress_activity</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Pre-select tab from URL: ?tab=citizen or ?tab=staff
  const [tab, setTab] = useState<"citizen" | "staff">(
    (searchParams.get("tab") === "staff" ? "staff" : "citizen") as "citizen" | "staff"
  )

  // Citizen OTP state
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  // Staff state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Mobile nav
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) &&
          !(e.target as Element).closest('#mobile-toggle-login')) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSendOtp = async () => {
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number"); return
    }
    setSendingOtp(true); setError(""); setInfo("")
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        setInfo(data.dev ? "Dev mode: use OTP 1234" : "OTP sent to your mobile number")
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch { setError("Network error. Please try again.") }
    finally { setSendingOtp(false) }
  }

  const handleCitizenLogin = async () => {
    if (!otp) { setError("Please enter the OTP"); return }
    setLoggingIn(true); setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        login(data.user)
        router.push("/citizen/dashboard")
      } else {
        setError(data.error || "Invalid OTP")
      }
    } catch { setError("Network error") }
    finally { setLoggingIn(false) }
  }

  const handleStaffLogin = async () => {
    if (!username || !password) { setError("Enter username and password"); return }
    setLoggingIn(true); setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        login(data.user)
        const dest: Record<string, string> = { superadmin: "/admin/dashboard", subadmin: "/subadmin/queue", officer: "/officer/inbox", bank_manager: "/bank/dashboard" }
        router.push(dest[data.user.role] || "/")
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch { setError("Network error") }
    finally { setLoggingIn(false) }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter">

      {/* ─── HEADER (matches home page) ─── */}
      <header className="bg-white border-b border-black shadow-sm sticky top-0 z-50">
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
              <Link href="/" className="flex items-center gap-2 px-6 py-2 bg-gov-navy text-white font-bold text-sm hover:bg-[#001a40] transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Home
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              id="mobile-toggle-login"
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
              { label: "Red Cross Society", href: "/#red" },
              { label: "Helplines", href: "/helpline" },
            ].map(item => (
              <Link key={item.label} href={item.href} className="text-sm font-bold text-slate-700 p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/complaint/track" className="bg-slate-100 text-slate-800 border border-slate-300 text-center font-bold py-3 text-sm w-full mt-3 block" onClick={() => setMobileMenuOpen(false)}>
              Track Arzi Status
            </Link>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
            </div>
            <h2 className="text-2xl font-black text-gov-navy">Sign in to E-Arzi</h2>
            <p className="text-sm text-slate-500 mt-1">Anantnag District Arzi Portal</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-200 rounded p-1 mb-6">
            <button
              onClick={() => { setTab("citizen"); setError(""); setInfo("") }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded transition-all ${tab === "citizen" ? "bg-gov-navy text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <span className="material-symbols-outlined text-base">phone_iphone</span>
              Citizen (OTP)
            </button>
            <button
              onClick={() => { setTab("staff"); setError(""); setInfo("") }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded transition-all ${tab === "staff" ? "bg-gov-navy text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <span className="material-symbols-outlined text-base">shield</span>
              Staff Login
            </button>
          </div>

          {/* Form card */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span> {error}
              </div>
            )}
            {info && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">info</span> {info}
              </div>
            )}

            {tab === "citizen" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Mobile Number</label>
                  <div className="flex">
                    <span className="bg-slate-100 border border-r-0 border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-l">+91</span>
                    <input
                      type="tel" maxLength={10}
                      placeholder="9876543210"
                      value={mobile} onChange={e => setMobile(e.target.value)}
                      className="flex-1 border border-slate-300 px-3 py-2.5 text-sm rounded-r focus:outline-none focus:border-gov-saffron"
                      disabled={otpSent}
                    />
                  </div>
                </div>
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="w-full btn-navy py-3 text-base flex items-center justify-center gap-2"
                  >
                    {sendingOtp ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">send</span>}
                    {sendingOtp ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Enter OTP</label>
                      <input
                        type="text" maxLength={4}
                        placeholder="4-digit OTP"
                        value={otp} onChange={e => setOtp(e.target.value)}
                        className="w-full border border-slate-300 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-saffron text-center tracking-widest font-bold text-lg"
                      />
                    </div>
                    <button
                      onClick={handleCitizenLogin}
                      disabled={loggingIn}
                      className="w-full btn-navy py-3 text-base flex items-center justify-center gap-2"
                    >
                      {loggingIn ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">login</span>}
                      {loggingIn ? "Verifying..." : "Verify & Login"}
                    </button>
                    <button onClick={() => { setOtpSent(false); setOtp(""); setInfo("") }} className="w-full text-sm text-slate-500 hover:text-gov-navy font-medium">
                      Change Mobile Number
                    </button>
                  </>
                )}
                <p className="text-center text-xs text-slate-500">
                  New user?{" "}
                  <Link href="/citizen/register" className="text-gov-navy font-bold hover:underline">Register here</Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Username</label>
                  <input
                    type="text" placeholder="staff.username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-saffron"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Password</label>
                  <input
                    type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleStaffLogin()}
                    className="w-full border border-slate-300 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-saffron"
                  />
                </div>
                <button
                  onClick={handleStaffLogin}
                  disabled={loggingIn}
                  className="w-full btn-navy py-3 text-base flex items-center justify-center gap-2"
                >
                  {loggingIn ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">login</span>}
                  {loggingIn ? "Signing in..." : "Sign In"}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Contact your administrator for login credentials
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-6">
            District Administration Anantnag · Government of J&K
          </p>
        </div>
      </main>
    </div>
  )
}
