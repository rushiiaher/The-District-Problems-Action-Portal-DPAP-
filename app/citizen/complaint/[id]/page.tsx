"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft, Clock, MapPin, FileText, User, Building2,
  Star, RefreshCw, CheckCircle, AlertTriangle, Loader2,
  MessageSquare, Upload
} from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  SUBMITTED: { label: "Submitted", className: "status-submitted", icon: Clock },
  ASSIGNED: { label: "Assigned", className: "status-assigned", icon: User },
  REASSIGNED: { label: "Reassigned", className: "status-reassigned", icon: RefreshCw },
  IN_PROGRESS: { label: "In Progress", className: "status-in_progress", icon: AlertTriangle },
  ESCALATED: { label: "Escalated", className: "status-escalated", icon: AlertTriangle },
  RESOLVED: { label: "Resolved", className: "status-resolved", icon: CheckCircle },
  REOPENED: { label: "Reopened", className: "status-reopened", icon: RefreshCw },
  CLOSED: { label: "Closed", className: "status-closed", icon: CheckCircle },
  AUTO_CLOSED: { label: "Auto Closed", className: "status-auto_closed", icon: Clock },
  REJECTED: { label: "Rejected", className: "status-rejected", icon: AlertTriangle },
}

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [complaint, setComplaint] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [reopenReason, setReopenReason] = useState("")

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await fetch(`/api/complaints/${id}`)
        const data = await res.json()
        if (data.complaint) {
          setComplaint(data.complaint)
          setTimeline(data.timeline || [])
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    if (id) fetchComplaint()
  }, [id])

  const handleFeedback = async () => {
    if (!rating) { toast({ title: "Please select a rating", variant: "destructive" }); return }
    setSubmittingFeedback(true)
    try {
      const res = await fetch(`/api/complaints/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: feedback }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Thank you for your feedback!" })
        setComplaint((c: any) => ({ ...c, status: "CLOSED" }))
      }
    } finally { setSubmittingFeedback(false) }
  }

  const handleReopen = async () => {
    if (!reopenReason.trim()) { toast({ title: "Please provide a reason", variant: "destructive" }); return }
    setReopening(true)
    try {
      const res = await fetch(`/api/complaints/${id}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reopenReason }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Complaint reopened" })
        setComplaint((c: any) => ({ ...c, status: "REOPENED", reopen_count: c.reopen_count + 1 }))
        setReopening(false)
      } else {
        toast({ title: data.error, variant: "destructive" })
      }
    } finally { setReopening(false) }
  }

  if (loading) return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </main>
    </div>
  )

  if (!complaint) return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Arzi not found</h2>
          <p className="text-slate-400 text-sm mb-4">The Arzi ID doesn't exist or you don't have access.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    </div>
  )

  const cfg = STATUS_CONFIG[complaint.status] || { label: complaint.status, className: "status-submitted" }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 p-6 text-white overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Complaint header */}
          <div className="glass rounded-2xl p-6 border border-white/5 mb-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-slate-500 text-xs mb-1 font-mono">{complaint.id}</div>
                <h1 className="font-['Outfit'] text-xl font-bold text-white">{complaint.category}</h1>
              </div>
              <Badge className={`px-3 py-1 text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-5">{complaint.description}</p>

            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{complaint.village}, {complaint.block}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Filed {new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              {complaint.assigned_dept_name && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{complaint.assigned_dept_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Feedback panel for RESOLVED */}
          {complaint.status === "RESOLVED" && !complaint.has_feedback && (
            <div className="glass rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5 mb-5">
              <h3 className="font-semibold text-white mb-3">Rate Your Experience</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-xl text-lg transition-all ${n <= rating ? "bg-amber-500/20 text-amber-400 scale-110" : "bg-white/5 text-slate-600 hover:text-amber-400"}`}
                  >
                    <Star className={`w-5 h-5 mx-auto ${n <= rating ? "fill-amber-400" : ""}`} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Optional comment..."
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 mb-3 resize-none h-20"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <div className="flex gap-3">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={handleFeedback} disabled={submittingFeedback}>
                  {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit & Close"}
                </Button>
                {complaint.reopen_count < 3 && (
                  <Button size="sm" variant="outline" className="text-orange-400 border-orange-400/30 hover:bg-orange-400/10">
                    Reopen Instead
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Reopen panel */}
          {complaint.status === "RESOLVED" && complaint.reopen_count < 3 && (
            <div className="glass rounded-2xl p-5 border border-orange-500/20 mb-5">
              <h3 className="font-semibold text-white text-sm mb-3">Not satisfied? Reopen this complaint</h3>
              <Textarea
                placeholder="Reason for reopening..."
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 mb-3 resize-none h-20"
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
              />
              <Button size="sm" className="bg-orange-600 hover:bg-orange-500" onClick={handleReopen} disabled={reopening}>
                {reopening ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" />Reopen Complaint</>}
              </Button>
              <p className="text-slate-500 text-xs mt-2">Remaining reopens: {3 - complaint.reopen_count}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Complaint Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-slate-500 text-sm">No timeline events yet.</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((ev, i) => (
                  <div key={ev.id || i} className="flex gap-4 relative">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-white/5" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 pt-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">{ev.action?.replace(/_/g, " ")}</span>
                        <span className="text-slate-600 text-xs">by {ev.actor_role}</span>
                      </div>
                      {ev.remarks && <p className="text-slate-400 text-xs mb-1">{ev.remarks}</p>}
                      <div className="text-slate-600 text-xs">{new Date(ev.timestamp).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
