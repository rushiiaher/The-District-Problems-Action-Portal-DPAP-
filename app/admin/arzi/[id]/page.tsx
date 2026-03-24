"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  SUBMITTED:   { label: "Unassigned",   color: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-500" },
  REASSIGNED:  { label: "Returned",     color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  ASSIGNED:    { label: "Assigned",     color: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-blue-500" },
  IN_PROGRESS: { label: "In Progress",  color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  RESOLVED:    { label: "Resolved",     color: "bg-green-50 text-green-700 border-green-200",     dot: "bg-gov-green" },
  CLOSED:      { label: "Closed",       color: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400" },
  REJECTED:    { label: "Rejected",     color: "bg-red-50 text-red-700 border-red-200",           dot: "bg-red-500" },
  ESCALATED:   { label: "Escalated",    color: "bg-purple-50 text-purple-700 border-purple-200",  dot: "bg-purple-500" },
}

export default function AdminArziDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [complaint, setComplaint]   = useState<any>(null)
  const [timeline, setTimeline]     = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [citizen, setCitizen]       = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")

  useEffect(() => {
    if (!isLoading && (!user || !["superadmin", "subadmin"].includes(user.role)))
      router.push("/auth/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      try {
        const res = await fetch(`/api/complaints/${id}`, {
          headers: { "x-user-id": user.id, "x-user-role": user.role },
        })
        const data = await res.json()
        if (data.success) {
          setComplaint(data.complaint)
          setTimeline(data.timeline || [])
          setAttachments(data.attachments || [])
          setCitizen(data.citizen)
        } else {
          setError("Arzi not found")
        }
      } catch { setError("Failed to load arzi") }
      finally { setLoading(false) }
    }
    load()
  }, [id, user])

  if (isLoading || !user) return null
  const sm = complaint ? (STATUS_META[complaint.status] || STATUS_META["SUBMITTED"]) : null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/admin/citizens" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Admin · Arzi Detail
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-5xl">error_outline</span>
            <p className="font-bold">{error}</p>
            <Link href="/admin/citizens">
              <button className="btn-navy px-4 py-2 text-sm">Back to Citizens</button>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Current Status</p>
                  <p className="font-black text-lg leading-tight">{sm?.label}</p>
                </div>
                {complaint.sla_deadline && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">SLA Deadline</p>
                    <p className={`text-sm font-bold ${new Date(complaint.sla_deadline) < new Date() ? "text-red-600" : ""}`}>
                      {new Date(complaint.sla_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>

              {/* Arzi Details */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[18px]">description</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Arzi Details</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="font-bold text-slate-800 text-base">{complaint.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded p-3 border border-slate-100">{complaint.description}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm text-slate-700 font-medium">
                        {[complaint.village, complaint.block, complaint.district].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                      <p className="text-sm text-slate-700 font-medium">
                        {new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    {complaint.reopen_count > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reopened</p>
                        <p className="text-sm text-orange-600 font-bold">{complaint.reopen_count} time(s)</p>
                      </div>
                    )}
                  </div>

                  {complaint.assignment_note && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[18px] flex-shrink-0 mt-0.5">sticky_note_2</span>
                      <div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">Assignment Note</p>
                        <p className="text-sm text-amber-800">{complaint.assignment_note}</p>
                      </div>
                    </div>
                  )}

                  {complaint.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0 mt-0.5">cancel</span>
                      <div>
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-0.5">Rejection Reason</p>
                        <p className="text-sm text-red-800">{complaint.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">attach_file</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Attachments ({attachments.length})</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {attachments.map((a, i) => (
                      <a key={a.id || i} href={a.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-slate-200 rounded p-3 hover:border-gov-navy/40 hover:bg-slate-50 transition-colors group">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-gov-navy text-[22px]">
                          {a.file_type === "application/pdf" ? "picture_as_pdf" : "image"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">Attachment {i + 1}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{a.file_type?.split("/")[1] || "file"}</p>
                        </div>
                        <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-gov-navy ml-auto flex-shrink-0">open_in_new</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

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
                        <div key={t.id || i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${ts?.dot || "bg-slate-300"}`} />
                            {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[24px]" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                {t.action.replace(/_/g, " ")}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(t.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                {" · "}
                                {new Date(t.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.actor_role}</p>
                            {t.remarks && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 rounded px-3 py-2">{t.remarks}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Arzi ID card */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arzi ID</p>
                  <p className="font-mono font-black text-gov-navy text-base">{complaint?.id}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Status",      value: sm?.label },
                    { label: "Category",    value: complaint?.category },
                    { label: "Location",    value: complaint ? [complaint.village, complaint.block].filter(Boolean).join(", ") : "—" },
                    { label: "Filed",       value: complaint ? new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                    { label: "Attachments", value: attachments.length > 0 ? `${attachments.length} file(s)` : "None" },
                  ].map(row => (
                    <div key={row.label} className="px-5 py-2.5 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</p>
                      <p className="text-xs font-bold text-slate-700 text-right max-w-[160px]">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Info */}
              {citizen && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Filed By</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gov-navy/10 border border-gov-navy/20 flex items-center justify-center text-gov-navy font-black flex-shrink-0">
                        {(citizen.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{citizen.name}</p>
                        <p className="font-mono text-xs text-slate-500">+91 {citizen.mobile}</p>
                      </div>
                    </div>
                    {citizen.address && (
                      <div className="bg-slate-50 rounded p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                        {citizen.address}
                        {[citizen.village, citizen.block, citizen.district].filter(Boolean).length > 0 && (
                          <p className="text-slate-400 mt-1">{[citizen.village, citizen.block, citizen.district].filter(Boolean).join(", ")}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned To */}
              {(complaint?.assigned_dept_name || complaint?.assigned_officer_name) && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">assignment_ind</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Assigned To</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {complaint.assigned_dept_name && (
                      <div className="px-5 py-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Department</p>
                        <p className="font-bold text-slate-800 text-sm">{complaint.assigned_dept_name}</p>
                      </div>
                    )}
                    {complaint.assigned_officer_name && (
                      <div className="px-5 py-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Officer</p>
                        <p className="font-bold text-slate-800 text-sm">{complaint.assigned_officer_name}</p>
                        {complaint.assigned_officer_designation && (
                          <p className="text-xs text-slate-400">{complaint.assigned_officer_designation}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Back link */}
              <Link href="/admin/citizens"
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-gov-navy transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Citizens Registry
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
