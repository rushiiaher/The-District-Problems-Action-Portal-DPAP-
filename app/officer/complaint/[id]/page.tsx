"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import Link from "next/link"

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  SUBMITTED:   { label: "Submitted",   color: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-500" },
  ASSIGNED:    { label: "Assigned",    color: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  REASSIGNED:  { label: "Returned",    color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  RESOLVED:    { label: "Resolved",    color: "bg-green-50 text-gov-green border-green-200",    dot: "bg-gov-green" },
  CLOSED:      { label: "Closed",      color: "bg-slate-100 text-slate-600 border-slate-200",   dot: "bg-slate-400" },
  ESCALATED:   { label: "Escalated",   color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
}

export default function OfficerComplaintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [complaint, setComplaint] = useState<any>(null)
  const [timeline, setTimeline]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")

  // Action form state
  const [expectedDate, setExpectedDate]     = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [remarks, setRemarks]               = useState("")
  const [submitting, setSubmitting]         = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [actionSuccess, setActionSuccess]   = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "officer")) router.push("/auth/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      try {
        const res = await fetch(`/api/complaints/${id}`, {
          headers: { "x-user-id": user.id, "x-user-role": user.role },
        })
        const data = await res.json()
        if (data.complaint) { setComplaint(data.complaint); setTimeline(data.timeline || []) }
        else setError("Complaint not found")
      } catch { setError("Failed to load complaint") }
      finally { setLoading(false) }
    }
    load()
  }, [id, user])

  const doAction = async (action: string, body: Record<string, any>) => {
    setSubmitting(action)
    setError("")
    try {
      const res = await fetch(`/api/complaints/${id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user!.id,
          "x-user-role": user!.role,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setComplaint((c: any) => ({ ...c, status: data.status || c.status }))
        // Refresh timeline
        const r2 = await fetch(`/api/complaints/${id}`, {
          headers: { "x-user-id": user!.id, "x-user-role": user!.role },
        })
        const d2 = await r2.json()
        if (d2.timeline) setTimeline(d2.timeline)
        setShowRejectForm(false)
        setShowResolveForm(false)
        setRemarks(""); setRejectionReason(""); setResolutionNote(""); setExpectedDate("")
        setActionSuccess(action)
        setTimeout(() => setActionSuccess(""), 3000)
      } else {
        setError(data.error || `${action} failed`)
      }
    } catch { setError("Network error. Please try again.") }
    finally { setSubmitting(null) }
  }

  if (isLoading || !user) return null

  const sm = complaint ? (STATUS_META[complaint.status] || STATUS_META["SUBMITTED"]) : null
  const canAccept  = complaint?.status === "ASSIGNED"
  const canUpdate  = complaint?.status === "IN_PROGRESS"
  const canResolve = complaint?.status === "IN_PROGRESS"

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <Link href="/officer/inbox" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">
              Officer Portal · Complaint Detail
            </p>
          </div>
          {complaint && (
            <span className="font-mono font-bold text-gov-saffron text-sm">{complaint.id}</span>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ) : error && !complaint ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-5xl">error_outline</span>
            <p className="font-bold">{error}</p>
            <Link href="/officer/inbox">
              <button className="btn-navy px-4 py-2 text-sm">Back to Inbox</button>
            </Link>
          </div>
        ) : (
          <div className="p-4 md:p-8 max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT: Details + Timeline ─── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Status banner */}
              <div className={`rounded border px-4 py-3 flex items-center gap-3 ${sm?.color}`}>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sm?.dot}`} />
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Current Status</span>
                  <p className="font-black text-base leading-tight">{sm?.label}</p>
                </div>
                {complaint?.sla_deadline && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">SLA Deadline</p>
                    <p className={`text-sm font-bold ${new Date(complaint.sla_deadline) < new Date() ? "text-red-600" : ""}`}>
                      {new Date(complaint.sla_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                )}
              </div>

              {/* Complaint card */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[18px]">description</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Complaint Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="font-bold text-slate-800">{complaint.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-slate-700 text-sm leading-relaxed">{complaint.description}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm text-slate-700">{[complaint.village, complaint.block, complaint.district].filter(Boolean).join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                      <p className="text-sm text-slate-700">{new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  {complaint.assignment_note && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">Sub-Admin Note</p>
                        <p className="text-sm text-amber-800">{complaint.assignment_note}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {timeline.length > 0 && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">timeline</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Activity Timeline</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {timeline.map((t, i) => {
                      const ts = STATUS_META[t.action]
                      return (
                        <div key={t.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${ts?.dot || "bg-slate-300"}`} />
                            {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[24px]" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t.action.replace(/_/g, " ")}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(t.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                {" "}
                                {new Date(t.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.actor_role}</p>
                            {t.remarks && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.remarks}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Action Panel ─── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Success flash */}
              {actionSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-green text-[22px]">check_circle</span>
                  <p className="font-bold text-gov-green text-sm capitalize">{actionSuccess} successful!</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2 text-sm text-red-700">
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span> {error}
                </div>
              )}

              {/* Actions panel */}
              {(canAccept || canUpdate || canResolve) && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gov-saffron text-[18px]">manage_accounts</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Actions</h2>
                  </div>
                  <div className="p-6 space-y-4">

                    {/* Accept */}
                    {canAccept && !showRejectForm && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                            Expected Resolution Date <span className="text-slate-300 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="date"
                            value={expectedDate}
                            onChange={e => setExpectedDate(e.target.value)}
                            className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => doAction("accept", { expected_date: expectedDate })}
                            disabled={!!submitting}
                            className="flex-1 bg-gov-green hover:bg-[#1a7a3e] text-white font-bold py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                          >
                            {submitting === "accept"
                              ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                              : <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                            Accept & Start
                          </button>
                          <button
                            onClick={() => setShowRejectForm(true)}
                            className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reject form */}
                    {showRejectForm && (
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                          Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Wrong department, incomplete information, etc."
                          className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 resize-none"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (!rejectionReason.trim()) { setError("Enter a rejection reason"); return }
                              doAction("reject", { reason: rejectionReason })
                            }}
                            disabled={!!submitting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {submitting === "reject"
                              ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                              : "Confirm Reject"}
                          </button>
                          <button
                            onClick={() => { setShowRejectForm(false); setRejectionReason("") }}
                            className="px-4 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Progress update */}
                    {canUpdate && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                          Progress Remarks
                        </label>
                        <textarea
                          rows={2}
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          placeholder="Describe action taken, current status, next steps…"
                          className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 resize-none"
                        />
                        <button
                          onClick={() => doAction("update", { remarks })}
                          disabled={!!submitting}
                          className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                          {submitting === "update"
                            ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            : <span className="material-symbols-outlined text-[18px]">add_comment</span>}
                          Add Update
                        </button>
                      </div>
                    )}

                    {/* Resolve */}
                    {canResolve && !showResolveForm && (
                      <div className="border-t border-slate-100 pt-4">
                        <button
                          onClick={() => setShowResolveForm(true)}
                          className="w-full bg-gov-green hover:bg-[#1a7a3e] text-white font-bold py-3 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">task_alt</span>
                          Mark as Resolved
                        </button>
                      </div>
                    )}

                    {/* Resolve form */}
                    {showResolveForm && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                          Resolution Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={resolutionNote}
                          onChange={e => setResolutionNote(e.target.value)}
                          placeholder="Describe the resolution — what was done and the outcome…"
                          className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 resize-none"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (!resolutionNote.trim()) { setError("Enter a resolution note"); return }
                              doAction("resolve", { resolution_note: resolutionNote })
                            }}
                            disabled={!!submitting}
                            className="flex-1 bg-gov-green hover:bg-[#1a7a3e] text-white font-bold py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {submitting === "resolve"
                              ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                              : "Confirm Resolution"}
                          </button>
                          <button
                            onClick={() => { setShowResolveForm(false); setResolutionNote("") }}
                            className="px-4 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status complete message */}
              {!canAccept && !canUpdate && !canResolve && complaint && (
                <div className="bg-white border border-slate-200 rounded shadow-sm p-6 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-200 block mb-3">
                    {complaint.status === "RESOLVED" || complaint.status === "CLOSED" ? "task_alt" : "info"}
                  </span>
                  <p className="font-bold text-slate-600 text-sm">
                    {complaint.status === "RESOLVED" || complaint.status === "CLOSED"
                      ? "This complaint has been resolved."
                      : `No actions available for status: ${sm?.label}`}
                  </p>
                </div>
              )}

              {/* Quick reference */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Complaint Reference</p>
                  <p className="font-mono font-black text-gov-navy">{complaint?.id}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Status",    value: sm?.label },
                    { label: "Category",  value: complaint?.category },
                    { label: "Location",  value: complaint ? `${complaint.village}, ${complaint.block}` : "" },
                  ].map(row => (
                    <div key={row.label} className="px-5 py-2.5 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</p>
                      <p className="text-xs font-bold text-slate-700">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </SidebarProvider>
  )
}
