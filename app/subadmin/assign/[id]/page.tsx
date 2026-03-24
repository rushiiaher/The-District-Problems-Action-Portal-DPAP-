"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import Link from "next/link"

type Arzi = {
  id: string
  category: string
  description: string
  status: string
  block: string
  village: string
  district?: string
  has_attachments: boolean
  rejection_reason?: string
  assignment_note?: string
  assigned_dept_name?: string
  assigned_officer_name?: string
  assigned_officer_designation?: string
  sla_deadline?: string
  created_at: string
}

type Attachment = { id: string; file_url: string; file_type?: string; created_at: string }
type Department = { id: string; name: string; code: string }
type Officer    = { id: string; name: string; designation?: string; open_count: number }
type Timeline   = { id: string; actor_role: string; action: string; remarks?: string; timestamp: string }

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  SUBMITTED:   { label: "Submitted",   color: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-500" },
  ASSIGNED:    { label: "Assigned",    color: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  REASSIGNED:  { label: "Returned",    color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  RESOLVED:    { label: "Resolved",    color: "bg-green-50 text-gov-green border-green-200",    dot: "bg-gov-green" },
  CLOSED:      { label: "Closed",      color: "bg-slate-100 text-slate-600 border-slate-200",   dot: "bg-slate-400" },
  REJECTED:    { label: "Rejected",    color: "bg-red-50 text-red-700 border-red-200",          dot: "bg-red-500" },
  ESCALATED:   { label: "Escalated",   color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
}


export default function AssignArziPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [complaint, setArzi] = useState<Arzi | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [timeline, setTimeline]   = useState<Timeline[]>([])
  const [citizen, setCitizen]     = useState<any>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [officers, setOfficers]   = useState<Officer[]>([])
  const [loading, setLoading]     = useState(true)
  const [fetchingOfficers, setFetchingOfficers] = useState(false)

  const [selectedDept, setSelectedDept]     = useState("")
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [note, setNote]                     = useState("")
  const [submitting, setSubmitting]         = useState(false)
  const [success, setSuccess]               = useState(false)
  const [error, setError]                   = useState("")

  // Attachment preview modal
  const [preview, setPreview] = useState<Attachment | null>(null)

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "subadmin")) router.push("/subadmin/login")
  }, [user, isLoading, router])

  // Load complaint + departments
  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      const [cRes, dRes] = await Promise.all([
        fetch(`/api/complaints/${id}`, { headers: { "x-user-id": user.id, "x-user-role": user.role } }),
        fetch("/api/admin/departments",  { headers: { "x-user-id": user.id, "x-user-role": user.role } }),
      ])
      const cData = await cRes.json()
      const dData = await dRes.json()
      if (cData.complaint)   setArzi(cData.complaint)
      if (cData.attachments) setAttachments(cData.attachments)
      if (cData.timeline)    setTimeline(cData.timeline)
      if (cData.citizen)     setCitizen(cData.citizen)
      if (dData.departments) setDepartments(dData.departments)
      setLoading(false)
    }
    load()
  }, [id, user])

  // Load officers when dept changes
  useEffect(() => {
    if (!selectedDept) { setOfficers([]); return }
    setFetchingOfficers(true); setSelectedOfficer("")
    fetch(`/api/officers?department_id=${selectedDept}`)
      .then(r => r.json())
      .then(d => setOfficers(d.officers || []))
      .catch(() => {})
      .finally(() => setFetchingOfficers(false))
  }, [selectedDept])

  const handleAssign = async () => {
    if (!selectedDept || !selectedOfficer) { setError("Select both department and officer"); return }
    setSubmitting(true); setError("")
    try {
      const res = await fetch(`/api/complaints/${id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user!.id,
          "x-user-role": user!.role,
        },
        body: JSON.stringify({ department_id: selectedDept, officer_id: selectedOfficer, note }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push("/subadmin/queue"), 1800)
      } else {
        setError(data.error || "Assignment failed")
      }
    } catch { setError("Network error. Please try again.") }
    finally { setSubmitting(false) }
  }

  if (isLoading || !user) return null

  const sm = complaint ? (STATUS_META[complaint.status] || STATUS_META["SUBMITTED"]) : null

  const isAlreadyAssigned = complaint?.status === "ASSIGNED" || complaint?.status === "IN_PROGRESS"

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <Link href="/subadmin/queue" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">
              Sub Admin · Assign Arzi
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
        ) : !complaint ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <p>Arzi not found</p>
          </div>
        ) : (
          <div className="p-8 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT: Arzi Details ────────────── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Status banner */}
              <div className={`rounded border px-4 py-3 flex items-center gap-3 ${sm?.color}`}>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sm?.dot}`} />
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Current Status</span>
                  <p className="font-black text-base leading-tight">{sm?.label}</p>
                </div>
              </div>

              {/* Arzi details card */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[18px]">description</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Arzi Details</h2>
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
                  <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm text-slate-700">{[complaint.village, complaint.block, complaint.district].filter(Boolean).join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                      <p className="text-sm text-slate-700">{new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    {complaint.sla_deadline && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SLA Deadline</p>
                        <p className={`text-sm font-bold ${new Date(complaint.sla_deadline) < new Date() ? "text-red-600" : "text-gov-green"}`}>
                          {new Date(complaint.sla_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {complaint.rejection_reason && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-orange-500 text-[18px] flex-shrink-0 mt-0.5">warning</span>
                      <div>
                        <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-0.5">Officer Rejection Reason</p>
                        <p className="text-sm text-orange-800">{complaint.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Current assignment */}
                  {isAlreadyAssigned && complaint.assigned_dept_name && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-[18px] flex-shrink-0 mt-0.5">assignment_ind</span>
                      <div>
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-0.5">Currently Assigned To</p>
                        <p className="text-sm font-bold text-blue-800">{complaint.assigned_officer_name}</p>
                        <p className="text-xs text-blue-600">{complaint.assigned_officer_designation} · {complaint.assigned_dept_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Citizen Info */}
              {citizen && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gov-navy text-[18px]">person</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Citizen</h2>
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Name",    value: citizen.name },
                      { label: "Mobile",  value: citizen.mobile ? `+91 ${citizen.mobile}` : null },
                      { label: "Address", value: citizen.address },
                      { label: "Location", value: [citizen.village, citizen.block, citizen.district].filter(Boolean).join(", ") },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className="col-span-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                        <p className="text-sm text-slate-800 font-medium">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gov-green text-[18px]">attach_file</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                      Attachments <span className="text-slate-400 font-normal ml-1">({attachments.length})</span>
                    </h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attachments.map((att) => {
                      const isPdf = att.file_type === "application/pdf" || att.file_url.endsWith(".pdf")
                      const isImg = att.file_type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(att.file_url)
                      return (
                        <button
                          key={att.id}
                          onClick={() => setPreview(att)}
                          className="group relative rounded border border-slate-200 overflow-hidden hover:border-gov-navy transition-all aspect-square bg-slate-50 flex flex-col items-center justify-center gap-2">
                          {isImg ? (
                            <img
                              src={att.file_url}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-4xl text-slate-300">
                              {isPdf ? "picture_as_pdf" : "insert_drive_file"}
                            </span>
                          )}
                          {/* hover overlay */}
                          <div className="absolute inset-0 bg-gov-navy/0 group-hover:bg-gov-navy/60 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">open_in_full</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-white/90 border-t border-slate-200 px-2 py-1">
                            <p className="text-[9px] font-bold text-slate-500 uppercase truncate">
                              {isPdf ? "PDF Document" : isImg ? "Image" : "File"}
                            </p>
                          </div>
                        </button>
                      )
                    })}
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

            {/* ── RIGHT: Assignment Panel ────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Success state */}
              {success ? (
                <div className="bg-white border border-gov-green/30 rounded shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gov-green/10 border-2 border-gov-green/30 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-gov-green text-4xl">check_circle</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg mb-1 uppercase tracking-tight">Assigned!</h3>
                  <p className="text-slate-500 text-sm">Redirecting to queue…</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gov-saffron text-[18px]">assignment_ind</span>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                      {isAlreadyAssigned ? "Reassign Arzi" : "Assign Arzi"}
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                        <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span> {error}
                      </div>
                    )}
                    {isAlreadyAssigned && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-xs text-amber-700 font-medium">
                        <span className="material-symbols-outlined text-[16px] flex-shrink-0">info</span>
                        This complaint is already assigned. Reassigning will notify the new officer.
                      </div>
                    )}

                    {/* Department */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white">
                        <option value="">— Select Department —</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>

                    {/* Officer */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                        Field Officer <span className="text-red-500">*</span>
                      </label>
                      {fetchingOfficers ? (
                        <div className="border border-slate-200 rounded px-3 py-2.5 text-sm text-slate-400 flex items-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          Loading officers…
                        </div>
                      ) : (
                        <select value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}
                          disabled={!selectedDept}
                          className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-400">
                          <option value="">
                            {!selectedDept ? "Select department first" : officers.length === 0 ? "No officers in this department" : "— Select Officer —"}
                          </option>
                          {officers.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.name}{o.designation ? ` · ${o.designation}` : ""} ({o.open_count} open)
                            </option>
                          ))}
                        </select>
                      )}
                      {selectedDept && officers.length === 0 && !fetchingOfficers && (
                        <p className="text-[10px] text-red-500 mt-1">No officers found for this department. Add officers first.</p>
                      )}
                    </div>

                    {/* Internal note */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                        Internal Note <span className="text-slate-300 font-normal">(Optional — not shown to citizen)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Add routing instructions, priority notes, or context for the officer…"
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button onClick={handleAssign} disabled={submitting || !selectedDept || !selectedOfficer}
                      className="w-full bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-3.5 rounded text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md mt-2">
                      {submitting
                        ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Assigning…</>
                        : <><span className="material-symbols-outlined text-[18px]">assignment_ind</span> {isAlreadyAssigned ? "Reassign Officer" : "Assign to Officer"}</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Quick status reference */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Arzi ID</p>
                  <p className="font-mono font-black text-gov-navy">{complaint.id}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Status",   value: sm?.label },
                    { label: "Category", value: complaint.category },
                    { label: "Location", value: `${complaint.village}, ${complaint.block}` },
                    { label: "Attachments", value: attachments.length > 0 ? `${attachments.length} file(s)` : "None" },
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

      {/* ── Attachment Preview Modal ── */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-gov-navy px-4 py-3 rounded-t">
              <p className="text-white text-sm font-bold">
                {preview.file_type?.startsWith("image/") ? "Image Preview" : "Document Preview"}
              </p>
              <div className="flex items-center gap-3">
                <a href={preview.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white flex items-center gap-1 text-xs font-bold"
                  onClick={e => e.stopPropagation()}>
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  Open Original
                </a>
                <a href={preview.file_url} download
                  className="text-slate-300 hover:text-white flex items-center gap-1 text-xs font-bold"
                  onClick={e => e.stopPropagation()}>
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </a>
                <button onClick={() => setPreview(null)}
                  className="text-slate-300 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="bg-white rounded-b overflow-auto flex-1 flex items-center justify-center p-4 min-h-[400px]">
              {preview.file_type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(preview.file_url) ? (
                <img src={preview.file_url} alt="Attachment preview"
                  className="max-w-full max-h-[75vh] object-contain rounded shadow" />
              ) : preview.file_type === "application/pdf" || preview.file_url.endsWith(".pdf") ? (
                <iframe src={preview.file_url} className="w-full h-[75vh] rounded" title="PDF Preview" />
              ) : (
                <div className="text-center text-slate-500 p-8">
                  <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">insert_drive_file</span>
                  <p className="font-bold mb-2">Preview not available</p>
                  <a href={preview.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-gov-navy font-bold text-sm hover:underline flex items-center gap-1 justify-center">
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span> Open file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </SidebarProvider>
  )
}
