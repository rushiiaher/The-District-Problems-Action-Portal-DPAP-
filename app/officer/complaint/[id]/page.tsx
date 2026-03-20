"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft, Clock, MapPin, CheckCircle, X, Loader2,
  AlertTriangle, MessageSquare, Upload, Calendar
} from "lucide-react"

export default function OfficerComplaintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [complaint, setComplaint] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [remarks, setRemarks] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/complaints/${id}`)
        const data = await res.json()
        if (data.complaint) setComplaint(data.complaint)
        if (data.timeline) setTimeline(data.timeline)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    if (id) load()
  }, [id])

  const doAction = async (action: string, body: Record<string, any>) => {
    setSubmitting(action)
    try {
      const res = await fetch(`/api/complaints/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: `Complaint ${action}ed successfully!` })
        setComplaint((c: any) => ({ ...c, status: data.status }))
        setShowRejectForm(false)
        setShowResolveForm(false)
      } else {
        toast({ title: "Action failed", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </main>
    </div>
  )

  const canAccept = complaint?.status === "ASSIGNED"
  const canUpdate = complaint?.status === "IN_PROGRESS"
  const canResolve = complaint?.status === "IN_PROGRESS"

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 p-6 text-white overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </button>

          {/* Header */}
          <div className="glass rounded-2xl p-6 border border-white/5 mb-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-slate-500 text-xs font-mono mb-1">{complaint?.id}</div>
                <h1 className="font-['Outfit'] text-xl font-bold text-white">{complaint?.category}</h1>
              </div>
              <Badge className={`text-xs px-3 py-1 status-${complaint?.status?.toLowerCase()}`}>
                {complaint?.status?.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{complaint?.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400" />{complaint?.village}, {complaint?.block}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{new Date(complaint?.created_at).toLocaleDateString("en-IN")}</span>
              {complaint?.sla_deadline && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-red-400" />Due: {new Date(complaint?.sla_deadline).toLocaleDateString("en-IN")}</span>
              )}
            </div>
            {complaint?.assignment_note && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                <div className="font-medium mb-0.5">Sub-Admin Note:</div>
                {complaint.assignment_note}
              </div>
            )}
          </div>

          {/* Action panel */}
          {(canAccept || canUpdate || canResolve) && (
            <div className="glass rounded-2xl p-6 border border-white/5 mb-5 space-y-4">
              <h3 className="text-white font-semibold">Actions</h3>

              {/* Accept */}
              {canAccept && !showRejectForm && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-400 text-xs mb-2 block">Expected Resolution Date</Label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 focus:outline-none"
                      value={expectedDate}
                      onChange={e => setExpectedDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => doAction("accept", { expected_date: expectedDate })}
                      disabled={!!submitting}
                    >
                      {submitting === "accept" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" />Accept & Start Working</>}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                      onClick={() => setShowRejectForm(true)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject form */}
              {showRejectForm && (
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs mb-2 block">Rejection Reason *</Label>
                  <Textarea
                    placeholder="Why is this complaint being rejected? (e.g., wrong department, incomplete info)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 resize-none h-24"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="bg-red-600 hover:bg-red-500"
                      onClick={() => { if (!rejectionReason.trim()) { toast({ title: "Enter reason", variant: "destructive" }); return } doAction("reject", { reason: rejectionReason }) }}
                      disabled={!!submitting}
                    >
                      {submitting === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
                    </Button>
                    <Button variant="ghost" className="text-slate-400" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Update + Resolve */}
              {canUpdate && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-400 text-xs mb-2 block">Progress Remarks</Label>
                    <Textarea
                      placeholder="Describe action taken, current status, next steps..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 resize-none h-20"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:border-white/20"
                    onClick={() => doAction("update", { remarks })}
                    disabled={!!submitting}
                  >
                    {submitting === "update" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4 mr-2" />Add Update</>}
                  </Button>
                </div>
              )}

              {canResolve && !showResolveForm && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500 w-full"
                  onClick={() => setShowResolveForm(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}

              {showResolveForm && (
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs mb-2 block">Resolution Note *</Label>
                  <Textarea
                    placeholder="Describe the resolution — what was done and outcome..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 resize-none h-24"
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => { if (!resolutionNote.trim()) { toast({ title: "Enter resolution note", variant: "destructive" }); return } doAction("resolve", { resolution_note: resolutionNote }) }}
                      disabled={!!submitting}
                    >
                      {submitting === "resolve" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Resolution"}
                    </Button>
                    <Button variant="ghost" className="text-slate-400" onClick={() => setShowResolveForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Complaint Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-slate-500 text-sm">No events yet.</p>
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
                      {ev.remarks && <p className="text-slate-400 text-xs mb-1 leading-relaxed">{ev.remarks}</p>}
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
