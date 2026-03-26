"use client"

import { useEffect, useRef, useState } from "react"
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
  REOPENED:    { label: "Reopened",    color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  CLOSED:      { label: "Closed",      color: "bg-slate-100 text-slate-600 border-slate-200",   dot: "bg-slate-400" },
  AUTO_CLOSED: { label: "Auto Closed", color: "bg-slate-100 text-slate-600 border-slate-200",   dot: "bg-slate-400" },
  ESCALATED:   { label: "Escalated",   color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  REJECTED:    { label: "Rejected",    color: "bg-red-50 text-red-700 border-red-200",           dot: "bg-red-500" },
}

type Message = {
  id: string
  sender_id: string
  sender_role: string
  sender_name: string
  message: string
  document_urls?: string[] | null
  is_request: boolean
  created_at: string
}

export default function CitizenComplaintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [complaint, setComplaint] = useState<any>(null)
  const [timeline, setTimeline]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [pageErr, setPageErr]     = useState("")

  // Feedback / reopen
  const [rating, setRating]           = useState(0)
  const [feedback, setFeedback]       = useState("")
  const [submittingFb, setSubmittingFb] = useState(false)
  const [fbSuccess, setFbSuccess]     = useState(false)
  const [reopenReason, setReopenReason] = useState("")
  const [reopening, setReopening]     = useState(false)

  // Messaging
  const [messages, setMessages]     = useState<Message[]>([])
  const [msgText, setMsgText]       = useState("")
  const [msgFiles, setMsgFiles]     = useState<File[]>([])
  const [sendingMsg, setSendingMsg] = useState(false)
  const [msgErr, setMsgErr]         = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const msgEndRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) router.push("/auth/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch(`/api/complaints/${id}`, { headers: { "x-user-id": user.id, "x-user-role": user.role } }),
          fetch(`/api/complaints/${id}/messages`, { headers: { "x-user-id": user.id, "x-user-role": user.role } }),
        ])
        const cData = await cRes.json()
        const mData = await mRes.json()
        if (cData.complaint) { setComplaint(cData.complaint); setTimeline(cData.timeline || []) }
        else setPageErr("Arzi not found or you don't have access")
        if (mData.messages) setMessages(mData.messages)
      } catch { setPageErr("Failed to load complaint") }
      finally { setLoading(false) }
    }
    load()
  }, [id, user])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!msgText.trim()) { setMsgErr("Message cannot be empty"); return }
    setSendingMsg(true); setMsgErr("")
    try {
      const fd = new FormData()
      fd.append("message", msgText.trim())
      fd.append("is_request", "false")
      msgFiles.forEach(f => fd.append("documents", f))
      const res = await fetch(`/api/complaints/${id}/messages`, {
        method: "POST",
        headers: { "x-user-id": user!.id, "x-user-role": user!.role },
        body: fd,
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        setMsgText(""); setMsgFiles([])
        if (fileInputRef.current) fileInputRef.current.value = ""
      } else {
        setMsgErr(data.error || "Failed to send")
      }
    } catch { setMsgErr("Network error") }
    finally { setSendingMsg(false) }
  }

  const handleFeedback = async () => {
    if (!rating) { setPageErr("Please select a rating"); return }
    setSubmittingFb(true); setPageErr("")
    try {
      const res = await fetch(`/api/complaints/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
        body: JSON.stringify({ rating, comment: feedback }),
      })
      const data = await res.json()
      if (data.success) {
        setFbSuccess(true)
        setComplaint((c: any) => ({ ...c, status: "CLOSED", has_feedback: true }))
      } else {
        setPageErr(data.error || "Failed to submit feedback")
      }
    } finally { setSubmittingFb(false) }
  }

  const handleReopen = async () => {
    if (!reopenReason.trim()) { setPageErr("Please provide a reason"); return }
    setReopening(true); setPageErr("")
    try {
      const res = await fetch(`/api/complaints/${id}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
        body: JSON.stringify({ reason: reopenReason }),
      })
      const data = await res.json()
      if (data.success) {
        setComplaint((c: any) => ({ ...c, status: "REOPENED", reopen_count: c.reopen_count + 1 }))
        setReopenReason("")
      } else {
        setPageErr(data.error || "Failed to reopen")
      }
    } finally { setReopening(false) }
  }

  if (isLoading || !user) return null

  const sm = complaint ? (STATUS_META[complaint.status] || STATUS_META["SUBMITTED"]) : null
  const canMessage = complaint && ["ASSIGNED", "IN_PROGRESS", "REOPENED"].includes(complaint.status)
  const hasDocRequest = messages.some(m => m.is_request && m.sender_role === "officer")

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <Link href="/citizen/complaints" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">
              Citizen Portal · Arzi Detail
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
        ) : pageErr && !complaint ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-5xl">error_outline</span>
            <p className="font-bold">{pageErr}</p>
            <Link href="/citizen/complaints">
              <button className="px-4 py-2 bg-gov-navy text-white text-sm font-bold rounded">Back to My Arzis</button>
            </Link>
          </div>
        ) : (
          <div className="p-4 md:p-8 max-w-[900px] mx-auto space-y-5">

            {/* Page error */}
            {pageErr && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>{pageErr}
              </div>
            )}

            {/* Document request alert */}
            {hasDocRequest && canMessage && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 text-[22px] flex-shrink-0 mt-0.5">upload_file</span>
                <div>
                  <p className="font-bold text-amber-800 text-sm">The officer has requested documents or information</p>
                  <p className="text-amber-700 text-xs mt-0.5">Please reply in the Communication section below with the required details.</p>
                </div>
              </div>
            )}

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

            {/* Complaint details */}
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
                    <p className="text-sm text-slate-700">{[complaint.village, complaint.block].filter(Boolean).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                    <p className="text-sm text-slate-700">{new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  {complaint.assigned_dept_name && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                      <p className="text-sm text-slate-700">{complaint.assigned_dept_name}</p>
                    </div>
                  )}
                </div>
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

            {/* Messaging Thread */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-gov-navy text-[18px]">forum</span>
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Communication</h2>
                {messages.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Thread */}
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-3xl text-slate-200 block mb-2">chat_bubble_outline</span>
                    <p className="text-xs text-slate-400">No messages yet. The assigned officer may request information here.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isCitizen = msg.sender_role === "citizen"
                    return (
                      <div key={msg.id} className={`flex flex-col ${isCitizen ? "items-end" : "items-start"}`}>
                        {/* Document request badge */}
                        {msg.is_request && (
                          <div className="flex items-center gap-1 mb-1 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded-full">
                            <span className="material-symbols-outlined text-amber-600 text-[12px]">upload_file</span>
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Document Request</span>
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 shadow-sm ${
                          isCitizen
                            ? "bg-gov-green text-white rounded-tr-none"
                            : "bg-slate-100 text-slate-800 rounded-tl-none"
                        }`}>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isCitizen ? "text-green-100" : "text-slate-500"}`}>
                            {msg.sender_name} · {msg.sender_role}
                          </p>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          {msg.document_urls && msg.document_urls.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {msg.document_urls.map((url, i) => {
                                const isImg = /\.(jpg|jpeg|png|webp)$/i.test(url)
                                return (
                                  <button key={i} onClick={() => setPreviewUrl(url)}
                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border transition-all ${
                                      isCitizen ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-slate-200 bg-white text-slate-600 hover:border-gov-navy"
                                    }`}>
                                    <span className="material-symbols-outlined text-[12px]">{isImg ? "image" : "picture_as_pdf"}</span>
                                    Doc {i + 1}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Compose */}
              {canMessage ? (
                <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50">
                  {msgErr && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>{msgErr}
                    </p>
                  )}
                  <textarea
                    rows={2}
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    placeholder="Type your reply or provide requested information…"
                    className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy resize-none bg-white"
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:bg-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">attach_file</span>
                      Attach Files
                    </button>
                    {msgFiles.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-600">
                        <span className="material-symbols-outlined text-[12px]">description</span>
                        {f.name.length > 16 ? f.name.slice(0, 14) + "…" : f.name}
                        <button onClick={() => setMsgFiles(p => p.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 ml-0.5">
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={e => {
                        const picked = Array.from(e.target.files || []).slice(0, 5)
                        setMsgFiles(p => [...p, ...picked].slice(0, 5))
                        e.target.value = ""
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMsg || !msgText.trim()}
                      className="ml-auto flex items-center gap-2 px-5 py-2 bg-gov-navy text-white text-[12px] font-bold rounded hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      {sendingMsg
                        ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        : <span className="material-symbols-outlined text-[16px]">send</span>}
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                  <p className="text-[11px] text-slate-400 text-center">
                    {complaint?.status === "RESOLVED" || complaint?.status === "CLOSED"
                      ? "Complaint is closed — messaging disabled."
                      : "Messaging is available once the complaint is assigned to an officer."}
                  </p>
                </div>
              )}
            </div>

            {/* Feedback panel — RESOLVED and no feedback yet */}
            {complaint.status === "RESOLVED" && !complaint.has_feedback && !fbSuccess && (
              <div className="bg-white border border-green-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-green text-[18px]">star</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Rate Your Experience</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                          n <= rating ? "bg-amber-100 text-amber-500" : "bg-slate-100 text-slate-300 hover:text-amber-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{n <= rating ? "star" : "star_border"}</span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Optional comment…"
                    className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-green resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleFeedback}
                      disabled={submittingFb}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gov-green text-white text-sm font-bold rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {submittingFb
                        ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        : <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                      Submit & Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fbSuccess && (
              <div className="bg-green-50 border border-green-200 rounded p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-gov-green text-[22px]">check_circle</span>
                <p className="font-bold text-gov-green text-sm">Thank you for your feedback! The complaint has been closed.</p>
              </div>
            )}

            {/* Reopen panel — RESOLVED with reopens remaining */}
            {complaint.status === "RESOLVED" && complaint.reopen_count < 3 && (
              <div className="bg-white border border-orange-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-orange-50 border-b border-orange-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-500 text-[18px]">refresh</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Not Satisfied? Reopen</h2>
                  <span className="ml-auto text-[10px] text-orange-600 font-bold">{3 - complaint.reopen_count} reopens left</span>
                </div>
                <div className="p-6 space-y-3">
                  <textarea
                    rows={2}
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    placeholder="Reason for reopening (issue not resolved, incorrect resolution, etc.)…"
                    className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-orange-400 resize-none"
                  />
                  <button
                    onClick={handleReopen}
                    disabled={reopening}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {reopening
                      ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      : <span className="material-symbols-outlined text-[16px]">refresh</span>}
                    Reopen Complaint
                  </button>
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
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t.action?.replace(/_/g, " ")}</p>
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
        )}
      </main>

      {/* Document preview overlay */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-gov-navy px-4 py-3 rounded-t">
              <p className="text-white text-sm font-bold">Document Preview</p>
              <div className="flex gap-3">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>Open
                </a>
                <button onClick={() => setPreviewUrl(null)} className="text-slate-300 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-b p-4 flex items-center justify-center min-h-[300px]">
              {/\.(jpg|jpeg|png|webp)$/i.test(previewUrl)
                ? <img src={previewUrl} alt="Preview" className="max-w-full max-h-[65vh] object-contain rounded" />
                : <iframe src={previewUrl} className="w-full h-[65vh] rounded" title="Doc" />}
            </div>
          </div>
        </div>
      )}
    </div>
    </SidebarProvider>
  )
}
