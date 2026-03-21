"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"

type Step = "form" | "otp" | "success"

export default function CitizenRegisterPage() {
  const { user, login } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user?.role === "citizen") router.push("/citizen/dashboard")
  }, [user, router])

  const [step, setStep] = useState<Step>("form")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  const [form, setForm] = useState({
    name: "",
    gender: "",
    mobile: "",
    alt_mobile: "",
    email: "",
    address: "",
    district: "Anantnag",
    block: "",
    village: "",
  })

  const set = (field: string, val: string) => {
    setForm(p => ({ ...p, [field]: val }))
    setError("")
  }

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setInterval(() => setResendTimer(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendTimer])

  // ── Step 1: Register ──────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.name.trim()) { setError("Full name is required"); return }
    if (!form.gender)      { setError("Please select your gender"); return }
    if (!form.address.trim()) { setError("Address is required"); return }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError("Enter a valid 10-digit Indian mobile number"); return
    }
    if (form.alt_mobile && !/^[6-9]\d{9}$/.test(form.alt_mobile)) {
      setError("Alternate number must be a valid 10-digit mobile number"); return
    }
    if (form.mobile === form.alt_mobile) {
      setError("Alternate number cannot be the same as primary mobile"); return
    }

    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }

      setInfo(data.dev ? "Dev mode — OTP: 123456" : `OTP sent to +91 ${form.mobile}`)
      setStep("otp")
      setResendTimer(60)
    } catch { setError("Network error. Please try again.") }
    finally { setLoading(false) }
  }

  // ── Step 2: Verify OTP & auto-login ──────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setError("Enter the OTP sent to your mobile"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile, otp }),
      })
      const data = await res.json()
      if (!data.success || !data.user) { setError(data.error || "Invalid OTP"); return }

      login(data.user)
      setStep("success")
      setTimeout(() => router.push("/citizen/dashboard"), 2000)
    } catch { setError("Verification failed. Please try again.") }
    finally { setLoading(false) }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      })
      const data = await res.json()
      if (data.success) { setInfo("OTP resent to your mobile"); setResendTimer(60) }
      else { setError(data.error || "Failed to resend") }
    } catch { setError("Network error") }
    finally { setLoading(false) }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter">

      {/* Tricolor bar */}
      <div className="gov-banner" />

      {/* Gov strip */}
      <div className="bg-slate-100 border-b border-slate-200 text-[11px] py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="text-slate-600 font-medium">
            GOVERNMENT OF JAMMU &amp; KASHMIR /&nbsp;
            <span className="text-slate-400">जम्मू और कश्मीर सरकार</span>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm tricolor-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0 overflow-hidden p-1.5"><img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain"/></div>
            <div className="border-l border-slate-300 pl-4">
              <h1 className="text-xl font-black tracking-tight text-gov-navy uppercase">E-ARZI ANANTNAG</h1>
              <p className="text-[11px] font-semibold text-gov-green uppercase tracking-wide">District Grievance Redressal Portal</p>
            </div>
          </Link>
          <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-gov-navy flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span> Back to Login
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-xl">

          {/* Progress steps */}
          <div className="flex items-center gap-0 mb-8 justify-center">
            {["Personal Details", "Verify Mobile", "Done"].map((label, i) => {
              const curr = step === "form" ? 0 : step === "otp" ? 1 : 2
              const done = i < curr; const active = i === curr
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                      done ? "bg-gov-green border-gov-green text-white" :
                      active ? "bg-gov-navy border-gov-navy text-white" :
                      "border-slate-300 text-slate-400"
                    }`}>
                      {done ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 font-bold ${active ? "text-gov-navy" : done ? "text-gov-green" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className={`w-16 h-0.5 mb-4 mx-1 ${i < curr ? "bg-gov-green" : "bg-slate-200"}`} />}
                </div>
              )
            })}
          </div>

          {/* ── STEP 1: Form ── */}
          {step === "form" && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-1 w-6 bg-gov-saffron inline-block" />
                  <span className="text-[10px] font-bold text-gov-saffron uppercase tracking-[0.2em]">New Account</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Citizen Registration</h2>
                <p className="text-slate-500 text-sm mt-1">Create your profile to submit and track grievances</p>
              </div>

              <div className="px-8 py-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span> {error}
                  </div>
                )}

                {/* Section: Identity */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-gov-saffron">person</span> Personal Information
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text" value={form.name} onChange={e => set("name", e.target.value)}
                        placeholder="As per Aadhaar / official records"
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {["Male", "Female", "Other"].map(g => (
                          <button key={g} type="button" onClick={() => set("gender", g)}
                            className={`flex-1 py-2 text-xs font-bold rounded border-2 transition-all ${form.gender === g ? "bg-gov-navy border-gov-navy text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Email <span className="text-slate-300 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email" value={form.email} onChange={e => set("email", e.target.value)}
                        placeholder="you@example.com"
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Mobile */}
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-gov-green">phone_iphone</span> Contact Numbers
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-l">+91</span>
                        <input
                          type="tel" maxLength={10} value={form.mobile}
                          onChange={e => set("mobile", e.target.value.replace(/\D/g, ""))}
                          placeholder="10-digit number"
                          className="flex-1 border border-slate-200 px-3 py-2.5 text-sm rounded-r focus:outline-none focus:border-gov-navy text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Alternate Number <span className="text-slate-300 font-normal">(Optional)</span>
                      </label>
                      <div className="flex">
                        <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-l">+91</span>
                        <input
                          type="tel" maxLength={10} value={form.alt_mobile}
                          onChange={e => set("alt_mobile", e.target.value.replace(/\D/g, ""))}
                          placeholder="10-digit number"
                          className="flex-1 border border-slate-200 px-3 py-2.5 text-sm rounded-r focus:outline-none focus:border-gov-navy text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Address */}
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-gov-navy">location_on</span> Address
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Full Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={form.address} onChange={e => set("address", e.target.value)}
                        placeholder="House no., street, locality..."
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 resize-none"
                      />
                    </div>
                    <LocationSelector
                      district={form.district}
                      block={form.block}
                      village={form.village}
                      onChange={(field, val) => set(field, val)}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button onClick={handleRegister} disabled={loading}
                  className="w-full bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-3.5 rounded text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2">
                  {loading
                    ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Creating Account...</>
                    : <><span className="material-symbols-outlined text-[18px]">how_to_reg</span> Create Account &amp; Send OTP</>}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Already registered?{" "}
                  <Link href="/auth/login?tab=citizen" className="text-gov-navy font-bold hover:underline">Login with OTP</Link>
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-8 pt-7 pb-5 border-b border-slate-100 text-center">
                <div className="w-16 h-16 rounded-full bg-gov-navy/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-gov-navy text-4xl">sms</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Verify Mobile</h2>
                <p className="text-slate-500 text-sm mt-1">
                  OTP sent to <strong className="text-slate-800">+91 {form.mobile}</strong>
                </p>
              </div>

              <div className="px-8 py-7 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span> {error}
                  </div>
                )}
                {info && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2 text-sm text-blue-700">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">info</span> {info}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
                    Enter 4-digit OTP
                  </label>
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError("") }}
                    placeholder="— — — —"
                    className="w-full border-2 border-slate-200 focus:border-gov-navy px-4 py-4 text-2xl font-black text-center tracking-[0.5em] rounded focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>

                <button onClick={handleVerifyOtp} disabled={loading}
                  className="w-full bg-gov-navy hover:bg-[#001a40] text-white font-black py-3.5 rounded text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                  {loading
                    ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Verifying...</>
                    : <><span className="material-symbols-outlined text-[18px]">verified</span> Verify &amp; Activate Account</>}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => { setStep("form"); setOtp(""); setError(""); setInfo("") }}
                    className="text-slate-500 hover:text-gov-navy font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Change Details
                  </button>
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 font-medium">Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={handleResend} disabled={loading}
                      className="text-gov-saffron font-bold hover:underline disabled:opacity-50">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === "success" && (
            <div className="bg-white border border-slate-200 rounded shadow-sm p-10 text-center">
              <div className="h-1 w-full flex mb-8 rounded-full overflow-hidden">
                <div className="flex-1 bg-gov-saffron" />
                <div className="flex-1 bg-white border-y border-slate-200" />
                <div className="flex-1 bg-gov-green" />
              </div>
              <div className="w-16 h-16 rounded-full bg-gov-green/10 border-2 border-gov-green/30 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-gov-green text-4xl">how_to_reg</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Account Activated!</h2>
              <p className="text-slate-600 text-sm mb-3">
                Welcome, <strong>{form.name}</strong>! Your citizen account has been created and verified.
              </p>
              <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
                <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          <p className="text-center text-[11px] text-slate-400 mt-6">
            District Administration Anantnag · Government of J&K
          </p>
        </div>
      </main>
    </div>
  )
}
