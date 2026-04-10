"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

export const dynamic = "force-dynamic"
import Link from "next/link"

const STATUS_STEPS = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED:   "bg-slate-100 text-slate-700 border-slate-300",
  ASSIGNED:    "bg-blue-50 text-blue-800 border-blue-200",
  REASSIGNED:  "bg-orange-50 text-orange-700 border-orange-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  ESCALATED:   "bg-red-50 text-red-800 border-red-200",
  RESOLVED:    "bg-emerald-50 text-emerald-800 border-emerald-200",
  REOPENED:    "bg-orange-50 text-orange-800 border-orange-200",
  CLOSED:      "bg-green-50 text-green-700 border-green-200",
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f4f7f9]">
        <span className="material-symbols-outlined animate-spin text-4xl text-gov-navy">progress_activity</span>
      </div>
    }>
      <TrackForm />
    </Suspense>
  )
}

function TrackForm() {
  const searchParams = useSearchParams()
  const [complaintId, setComplaintId] = useState(searchParams.get("id") || "")
  const [complaint, setComplaint] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrack = async () => {
    const id = complaintId.trim().toUpperCase()
    if (!id) { setError("Please enter your Arzi ID"); return }
    setLoading(true); setError(""); setComplaint(null); setTimeline([])
    try {
      const res = await fetch(`/api/complaints/${id}?public=true`)
      const data = await res.json()
      if (data.success && data.complaint) {
        setComplaint(data.complaint)
        setTimeline(data.timeline || [])
      } else {
        setError("Arzi not found. Please check your Arzi ID.")
      }
    } catch { setError("Network error. Please try again.") }
    finally { setLoading(false) }
  }

  const currentStep = complaint ? STATUS_STEPS.indexOf(complaint.status.replace("REOPENED", "IN_PROGRESS")) : -1

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter">
      {/* Header */}
      <header className="bg-white border-b border-black shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-[88px]">
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
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden md:flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-gov-navy">
              <span className="material-symbols-outlined text-base">arrow_back</span> Back to Home
            </Link>
            <Link href="/auth/login">
              <button className="btn-navy px-4 py-2 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">add_task</span> Submit Arzi
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-white text-3xl">find_in_page</span>
          </div>
          <h2 className="text-3xl font-black text-gov-navy uppercase tracking-tight">Track Your Arzi</h2>
          <p className="text-slate-500 mt-2">Enter your Arzi ID to see real-time status</p>
        </div>

        {/* Search bar */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Arzi ID</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                value={complaintId}
                onChange={e => setComplaintId(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleTrack()}
                placeholder="ARZ-2026-000123"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded text-sm font-mono focus:outline-none focus:border-gov-saffron focus:ring-1 focus:ring-gov-saffron"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading}
              className="btn-saffron px-8 py-3 text-sm flex items-center gap-2"
            >
              {loading ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : <span className="material-symbols-outlined text-base">search</span>}
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span> {error}
            </p>
          )}
        </div>

        {/* Result */}
        {complaint && (
          <div className="animate-fade-in-up">
            {/* Progress steps */}
            <div className="bg-white border border-slate-200 rounded shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-gov-navy uppercase text-sm tracking-wider">Arzi Status</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_BADGE[complaint.status] || STATUS_BADGE.SUBMITTED}`}>
                  {complaint.status.replace("_", " ")}
                </span>
              </div>

              <div className="relative flex items-start justify-between mb-8">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200">
                  <div
                    className="h-full bg-gov-navy transition-all duration-700"
                    style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
                  />
                </div>
                {STATUS_STEPS.map((step, idx) => (
                  <div key={step} className="flex flex-col items-center gap-2 flex-1 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs z-10 ${idx <= currentStep ? "bg-gov-navy border-gov-navy text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                      {idx < currentStep ? <span className="material-symbols-outlined text-sm">check</span> : idx + 1}
                    </div>
                    <p className={`text-[10px] font-bold uppercase text-center leading-tight ${idx <= currentStep ? "text-gov-navy" : "text-slate-400"}`}>
                      {step.replace("_", " ")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Complaint details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Arzi ID</p>
                  <p className="text-sm font-bold text-gov-navy font-mono">{complaint.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                  <p className="text-sm font-bold text-slate-800">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Filed On</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(complaint.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                {complaint.assigned_dept_name && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dept Assigned</p>
                    <p className="text-sm font-bold text-slate-800">{complaint.assigned_dept_name}</p>
                  </div>
                )}
                {complaint.sla_deadline && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">SLA Deadline</p>
                    <p className="text-sm font-bold text-slate-800">{new Date(complaint.sla_deadline).toLocaleDateString("en-IN")}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                  <p className="text-sm font-bold text-slate-800">{complaint.block}, {complaint.village}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                <h3 className="font-extrabold text-gov-navy uppercase text-sm tracking-wider mb-6">Activity Timeline</h3>
                <div className="relative">
                  <div className="absolute left-[19px] top-6 bottom-2 w-px bg-slate-200" />
                  <div className="space-y-6">
                    {timeline.map((event, idx) => (
                      <div key={event.id || idx} className="relative pl-12">
                        <div className={`absolute left-0 top-1 h-3 w-3 rounded-full ring-4 ring-white ${idx === 0 ? "bg-gov-saffron animate-pulse" : idx < timeline.length - 1 ? "bg-gov-green" : "bg-gov-navy"}`} />
                        <p className="text-sm font-bold text-slate-800">{event.action.replace("_", " ")}</p>
                        <p className="text-[11px] text-slate-500">{new Date(event.timestamp).toLocaleString("en-IN")}</p>
                        {event.remarks && <p className="text-xs text-slate-600 mt-1">{event.remarks}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-4 bg-gov-navy/5 border border-gov-navy/10 p-4 rounded flex items-start gap-3">
              <span className="material-symbols-outlined text-gov-navy text-[18px] mt-0.5">verified_user</span>
              <p className="text-xs text-slate-600">
                This information is real-time data from the E-ARZI System. For queries, contact the District Informatics Center at <span className="font-bold">01932-222333</span>.
              </p>
            </div>
          </div>
        )}

        {/* Helpline */}
        <div className="text-center mt-10 text-xs text-slate-500">
          <p>For assistance, call our Toll Free Helpline: <span className="font-bold text-gov-navy">1800-112-233</span></p>
          <p className="mt-1">Available 24×7 · helpdesk-ant@jk.gov.in</p>
        </div>
      </main>

      {/* Footer strip */}
      <div className="gov-banner mt-auto" />
      <div className="bg-slate-900 py-4 text-[11px] text-slate-500 text-center">
        © 2026 District Administration Anantnag · Powered by E-ARZI · National Informatics Centre (NIC)
      </div>
    </div>
  )
}
