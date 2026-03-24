"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

const SM: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:      { label: "Pending",      color: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-blue-500" },
  APPROVED:     { label: "Approved",     color: "bg-green-50 text-green-700 border-green-200",     dot: "bg-gov-green" },
  REJECTED:     { label: "Rejected",     color: "bg-red-50 text-red-700 border-red-200",           dot: "bg-red-500" },
  PAID:         { label: "Paid",         color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED:    { label: "Cancelled",    color: "bg-slate-100 text-slate-500 border-slate-200",    dot: "bg-slate-300" },
}

export default function AdminRedCrossDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [app, setApp]         = useState<any>(null)
  const [citizen, setCitizen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || !["superadmin", "subadmin"].includes(user.role)))
      router.push("/auth/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      try {
        const res = await fetch(`/api/red-cross/${id}`, {
          headers: { "x-user-id": user.id, "x-user-role": user.role },
        })
        const data = await res.json()
        if (data.success) {
          setApp(data.application)
          setCitizen(data.citizen)
        } else {
          setError("Application not found")
        }
      } catch { setError("Failed to load application") }
      finally { setLoading(false) }
    }
    load()
  }, [id, user])

  if (isLoading || !user) return null
  const sm = app ? (SM[app.status] || SM["PENDING"]) : null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-red-700 text-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/admin/red-cross" className="text-red-300 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              {/* mini red cross */}
              <div className="w-5 h-5 relative flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-4 bg-white" />
                  <div className="absolute w-4 h-1 bg-white" />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">Admin · Red Cross Application Detail</p>
            </div>
          </div>
          {app && <span className="font-mono font-bold text-red-200 text-sm">{app.id}</span>}
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-5xl">error_outline</span>
            <p className="font-bold">{error}</p>
            <Link href="/admin/red-cross">
              <button className="btn-navy px-4 py-2 text-sm">Back to Red Cross</button>
            </Link>
          </div>
        ) : (
          <div className="p-8 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Status banner */}
              <div className={`rounded border px-5 py-4 flex items-center gap-4 ${sm?.color}`}>
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${sm?.dot}`} />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Application Status</p>
                  <p className="font-black text-lg leading-tight">{sm?.label}</p>
                </div>
                {app.reviewed_at && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Reviewed On</p>
                    <p className="text-sm font-bold">
                      {new Date(app.reviewed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>

              {/* Application Details */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600 text-[18px]">volunteer_activism</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Application Details</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category of Need</p>
                      <p className="font-bold text-slate-800">{app.purpose_category || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                      <p className="font-bold text-slate-800">
                        {new Date(app.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div className="bg-slate-50 rounded p-4 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Requested</p>
                      <p className="text-2xl font-black text-slate-800">
                        {app.amount_requested ? `₹${Number(app.amount_requested).toLocaleString("en-IN")}` : "—"}
                      </p>
                    </div>
                    <div className={`rounded p-4 border ${app.approved_amount ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100"}`}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Approved</p>
                      <p className={`text-2xl font-black ${app.approved_amount ? "text-gov-green" : "text-slate-300"}`}>
                        {app.approved_amount ? `₹${Number(app.approved_amount).toLocaleString("en-IN")}` : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Description of Need */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description of Need</p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded p-4 border border-slate-100">
                      {app.purpose || "—"}
                    </p>
                  </div>

                  {/* Admin Remarks */}
                  {app.admin_remarks && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-500 text-[18px] flex-shrink-0 mt-0.5">admin_panel_settings</span>
                      <div>
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Admin / Bank Remarks</p>
                        <p className="text-sm text-blue-800">{app.admin_remarks}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Ref */}
                  {app.payment_ref && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0 mt-0.5">payments</span>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Payment Reference</p>
                        <p className="font-mono font-black text-emerald-800">{app.payment_ref}</p>
                        {app.paid_at && (
                          <p className="text-xs text-emerald-600 mt-0.5">
                            Paid on {new Date(app.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {app.documents && app.documents.length > 0 && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">attach_file</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                      Supporting Documents ({app.documents.length})
                    </h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {app.documents.map((url: string, i: number) => {
                      const isPdf = url.toLowerCase().includes(".pdf")
                      return (
                        <button key={i} onClick={() => setPreview(url)}
                          className="flex items-center gap-3 border border-slate-200 rounded p-3 hover:border-red-400 hover:bg-red-50 transition-colors group text-left w-full">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-red-600 text-[22px] flex-shrink-0">
                            {isPdf ? "picture_as_pdf" : "image"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">Document {i + 1}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{isPdf ? "PDF" : "Image"}</p>
                          </div>
                          <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-red-600 ml-auto flex-shrink-0">open_in_new</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Application ID card */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-red-50">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Application ID</p>
                  <p className="font-mono font-black text-red-700 text-sm">{app?.id}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Status",    value: sm?.label },
                    { label: "Category",  value: app?.purpose_category },
                    { label: "Requested", value: app?.amount_requested ? `₹${Number(app.amount_requested).toLocaleString("en-IN")}` : "—" },
                    { label: "Approved",  value: app?.approved_amount  ? `₹${Number(app.approved_amount).toLocaleString("en-IN")}` : "—" },
                    { label: "Location",  value: [app?.village, app?.block, app?.district].filter(Boolean).join(", ") || "—" },
                  ].map(row => (
                    <div key={row.label} className="px-5 py-2.5 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</p>
                      <p className="text-xs font-bold text-slate-700 text-right max-w-[160px]">{row.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Details from application */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Personal Details</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Full Name",   value: app?.full_name },
                    { label: "Father/Husband", value: app?.father_name || null },
                    { label: "Date of Birth", value: app?.dob ? new Date(app.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null },
                    { label: "Gender",      value: app?.gender },
                    { label: "Aadhaar",     value: app?.aadhaar ? `XXXX XXXX ${app.aadhaar.slice(-4)}` : null },
                    { label: "Mobile",      value: app?.mobile ? `+91 ${app.mobile}` : null },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="px-5 py-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registered Citizen match */}
              {citizen && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">person_check</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Registered Citizen</h2>
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gov-navy/10 border border-gov-navy/20 flex items-center justify-center text-gov-navy font-black flex-shrink-0">
                      {(citizen.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{citizen.name}</p>
                      <p className="font-mono text-xs text-slate-500">+91 {citizen.mobile}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Back links */}
              <div className="space-y-2">
                <Link href="/admin/red-cross"
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Red Cross List
                </Link>
                <Link href="/admin/citizens"
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-gov-navy transition-colors">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  Citizens Registry
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Document Preview Overlay */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white hover:text-red-300 flex items-center gap-1 font-bold text-sm">
              <span className="material-symbols-outlined">close</span> Close
            </button>
            {preview.toLowerCase().includes(".pdf") ? (
              <iframe src={preview} className="w-full h-[85vh] rounded" title="Document Preview" />
            ) : (
              <img src={preview} alt="Document" className="max-h-[85vh] mx-auto rounded shadow-2xl object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
