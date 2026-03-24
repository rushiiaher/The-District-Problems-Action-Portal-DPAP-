"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"

const CATEGORIES = [
  "Water Supply & Sanitation",
  "Road Repair & Maintenance",
  "Electricity / Power Supply",
  "Drainage & Sewage",
  "Public Health",
  "Education",
  "Agriculture",
  "Revenue & Land Records",
  "Social Welfare",
  "Public Works",
  "Environment",
  "Law & Order (Non-Emergency)",
  "Other",
]


export default function SubmitComplaintPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Auth guard — redirect to login if not a citizen
  useEffect(() => {
    if (user === null) router.push("/auth/login?tab=citizen")
  }, [user, router])

  const [form, setForm] = useState({
    category: "", description: "",
    district: "Anantnag", block: "", village: "",
  })
  const [files, setFiles]         = useState<FileList | null>(null)
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null)
  const [dupWarning, setDupWarning] = useState(false)
  const [error, setError]         = useState("")

  const set = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }))

  // ── Profile incomplete gate ───────────────────────────────────────────────
  // Citizen must have a name and address before they can submit a complaint
  const profileIncomplete = user?.role === "citizen" && (!user.name || !(user as any).address)

  if (!user) return null  // waiting for auth check

  if (profileIncomplete) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="bg-white border border-slate-200 rounded shadow-lg p-10 max-w-md w-full text-center">
            <div className="h-1 w-full flex mb-8 rounded-full overflow-hidden">
              <div className="flex-1 bg-gov-saffron" />
              <div className="flex-1 bg-white border-y border-slate-200" />
              <div className="flex-1 bg-gov-green" />
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-amber-500 text-4xl">account_circle</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
              Complete Your Profile First
            </h2>
            <p className="text-slate-500 text-sm mb-3 leading-relaxed">
              Your profile is missing some required information. Please complete your
              <strong> citizen profile</strong> with your name and address before filing a complaint.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-left space-y-2">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Missing Information</p>
              {[
                ...(!user.name               ? [{ icon: "person",      label: "Full name" }]        : []),
                ...(!(user as any).address   ? [{ icon: "location_on", label: "Home address" }]      : []),
              ].map(item => (
                <div key={item.icon} className="flex items-center gap-2 text-sm text-amber-800">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {/* Already logged in → go to profile edit, NOT register */}
              <Link href="/citizen/profile"
                className="flex-1 bg-gov-saffron hover:bg-[#e68a2e] text-white font-bold text-sm py-3 rounded transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Complete Profile
              </Link>
              <Link href="/auth/login?tab=citizen"
                className="flex-1 border-2 border-gov-navy text-gov-navy font-bold text-sm py-3 rounded hover:bg-gov-navy/5 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">login</span>
                Already Registered
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const handleSubmit = async (confirm = false) => {
    if (!form.category || !form.description || !form.block || !form.village) {
      setError("Please fill in all required fields marked with *")
      return
    }
    setError("")
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append("confirm_duplicate", String(confirm))
      if (files) Array.from(files).forEach(f => fd.append("files", f))

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "x-user-id": user?.id || "" },
        body: fd,
      })
      const data = await res.json()

      if (data.duplicate && !confirm) { setDupWarning(true); setLoading(false); return }
      if (data.success) { setSubmitted({ id: data.complaint_id }) }
      else { setError(data.error || "Submission failed. Please try again.") }
    } catch { setError("Network error. Please check your connection.") }
    finally { setLoading(false) }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="bg-white border border-slate-200 rounded shadow-lg p-10 max-w-md w-full text-center">
            {/* Tricolor accent */}
            <div className="h-1 w-full flex mb-8 rounded-full overflow-hidden">
              <div className="flex-1 bg-gov-saffron" />
              <div className="flex-1 bg-white border-y border-slate-200" />
              <div className="flex-1 bg-gov-green" />
            </div>

            <div className="w-16 h-16 rounded-full bg-gov-green/10 border-2 border-gov-green/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-gov-green text-4xl">task_alt</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
              Complaint Registered!
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your problem/complaint has been successfully submitted to the District Administration.
              You will receive an SMS update at each stage of processing.
            </p>

            <div className="bg-gov-navy/5 border border-gov-navy/20 rounded p-5 mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Complaint ID</p>
              <p className="font-mono text-2xl font-black text-gov-navy tracking-wider">{submitted.id}</p>
              <p className="text-[11px] text-slate-400 mt-1">Save this ID to track your complaint status</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/citizen/dashboard")}
                className="flex-1 px-4 py-2.5 border-2 border-gov-navy text-gov-navy font-bold text-sm rounded hover:bg-gov-navy/5 transition-colors"
              >
                My Dashboard
              </button>
              <button
                onClick={() => router.push(`/citizen/complaint/${submitted.id}`)}
                className="flex-1 px-4 py-2.5 bg-gov-navy text-white font-bold text-sm rounded hover:bg-[#001a40] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">find_in_page</span>
                Track Status
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Page header */}
        <header className="h-14 bg-gov-navy text-white flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Citizen Portal · E-ARZI</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            Secure Submission
          </div>
        </header>

        <div className="p-8 max-w-2xl mx-auto">

          {/* Title */}
          <div className="mb-8 border-b border-slate-300 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-gov-saffron inline-block" />
              <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">New Problem/Complaint</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Submit a Complaint</h1>
            <p className="text-slate-500 text-sm mt-1">
              Your complaint will be reviewed and assigned to the concerned department within 24 hours.
            </p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0">error</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Duplicate warning */}
          {dupWarning && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-300 rounded flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5 flex-shrink-0">warning</span>
              <div>
                <p className="font-bold text-amber-800 text-sm mb-1">Possible Duplicate Complaint</p>
                <p className="text-amber-700 text-xs mb-3">
                  A complaint with the same category and village was filed in the last 7 days. Do you still want to proceed?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handleSubmit(true)} className="px-4 py-1.5 bg-gov-saffron text-white text-xs font-bold rounded hover:bg-[#e68a2e]">
                    Yes, Submit Anyway
                  </button>
                  <button onClick={() => setDupWarning(false)} className="px-4 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">

            {/* ── Section 1: Complaint Details ── */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-gov-navy text-[20px]">description</span>
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Complaint Details</h2>
              </div>
              <div className="p-6 space-y-5">

                {/* Category */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={e => set("category", e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white"
                  >
                    <option value="">— Select a category —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>


                {/* Description */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    maxLength={1000}
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Describe the issue in detail — what happened, since when, and the impact on the community..."
                    className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy resize-none text-slate-800 placeholder-slate-400"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">{form.description.length}/1000</div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Location ── */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-gov-green text-[20px]">location_on</span>
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Location</h2>
              </div>
              <div className="p-6">
                <LocationSelector
                  district={form.district}
                  block={form.block}
                  village={form.village}
                  onChange={(field, val) => set(field, val)}
                  required
                />
              </div>
            </div>

            {/* ── Section 3: Attachments ── */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-gov-saffron text-[20px]">attach_file</span>
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Attachments <span className="text-slate-400 font-normal text-xs">(Optional)</span></h2>
              </div>
              <div className="p-6">
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded p-8 text-center transition-colors ${files && files.length > 0 ? "border-gov-green bg-gov-green/5" : "border-slate-200 hover:border-gov-navy/40 hover:bg-slate-50"}`}>
                    <span className={`material-symbols-outlined text-4xl mb-3 block ${files && files.length > 0 ? "text-gov-green" : "text-slate-300"}`}>upload_file</span>
                    {files && files.length > 0 ? (
                      <>
                        <p className="font-bold text-gov-green text-sm">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
                        <p className="text-slate-400 text-xs mt-1">{Array.from(files).map(f => f.name).join(", ")}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-600 text-sm font-medium mb-1">Click to browse or drag files here</p>
                        <p className="text-slate-400 text-xs">JPG, PNG, PDF · Max 5MB per file</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={e => setFiles(e.target.files)}
                  />
                </label>
              </div>
            </div>

            {/* ── Info notice ── */}
            <div className="flex items-start gap-3 p-4 bg-gov-navy/5 border border-gov-navy/15 rounded">
              <span className="material-symbols-outlined text-gov-navy text-[18px] mt-0.5 flex-shrink-0">info</span>
              <p className="text-slate-600 text-xs leading-relaxed">
                After submission, your complaint will be reviewed by the Sub-Admin and assigned to the relevant department.
                You will receive an <strong>SMS confirmation</strong> with your unique Complaint ID.
                Track your complaint anytime at <strong>earzi.jk.gov.in</strong>.
              </p>
            </div>

            {/* ── Submit button ── */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full bg-gov-saffron hover:bg-[#e68a2e] disabled:opacity-60 text-white font-black py-4 rounded text-base flex items-center justify-center gap-3 transition-all shadow-lg"
              style={{ borderRadius: 4 }}
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Submitting...</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]">send</span> Submit Problem/Complaint</>
              )}
            </button>

          </div>
        </div>
      </main>
    </div>
  )
}
