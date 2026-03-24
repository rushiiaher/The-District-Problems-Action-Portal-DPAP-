"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

type Application = {
  id: string
  full_name: string
  purpose: string
  purpose_category?: string
  amount_requested?: number
  approved_amount?: number
  status: string
  admin_remarks?: string
  payment_ref?: string
  created_at: string
  reviewed_at?: string
  paid_at?: string
}

const STATUS_STEPS = ["PENDING", "UNDER_REVIEW", "APPROVED", "PAID"]

const STATUS_META: Record<string, { label: string; color: string; border: string; dot: string; icon: string }> = {
  PENDING:      { label: "Pending",      color: "bg-amber-50 text-amber-800",   border: "border-amber-200",  dot: "bg-amber-400",  icon: "schedule" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-blue-50 text-blue-800",     border: "border-blue-200",   dot: "bg-blue-500",   icon: "rate_review" },
  APPROVED:     { label: "Approved",     color: "bg-green-50 text-gov-green",   border: "border-green-200",  dot: "bg-gov-green",  icon: "check_circle" },
  REJECTED:     { label: "Rejected",     color: "bg-red-50 text-red-700",       border: "border-red-200",    dot: "bg-red-500",    icon: "cancel" },
  PAID:         { label: "Paid ✓",       color: "bg-emerald-50 text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", icon: "payments" },
  CANCELLED:    { label: "Cancelled",    color: "bg-slate-50 text-slate-500",   border: "border-slate-200",  dot: "bg-slate-300",  icon: "block" },
}

export default function RedCrossStatusPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [apps, setApps]       = useState<Application[]>([])
  const [fetching, setFetching] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) router.push("/auth/login?tab=citizen")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/red-cross", { headers: { "x-user-id": user.id, "x-user-role": "citizen" } })
      .then(r => r.json())
      .then(d => { if (d.applications) setApps(d.applications) })
      .finally(() => setFetching(false))
  }, [user])

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-red-700 text-white sticky top-0 z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">Citizen Portal · Financial Help Status</p>
          <Link href="/citizen/red-cross"
            className="flex items-center gap-1.5 bg-white text-red-700 font-black text-xs px-3 py-1.5 rounded hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined text-[16px]">add</span> New Arzi
          </Link>
        </header>

        <div className="p-8 max-w-3xl mx-auto space-y-5">
          {/* Title */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Financial Help Arzis</h1>
            <p className="text-slate-500 text-sm mt-1">Track the status of your financial aid applications</p>
          </div>

          {fetching ? (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>
              Loading…
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-red-100 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-8 bg-red-300" /><div className="absolute w-8 h-2 bg-red-300" />
                </div>
              </div>
              <p className="font-bold text-slate-400 mb-1">No applications yet</p>
              <p className="text-sm text-slate-300 mb-4">Submit your first financial help application</p>
              <Link href="/citizen/red-cross"
                className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-5 py-2.5 rounded text-sm hover:bg-red-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span> Apply Now
              </Link>
            </div>
          ) : (
            apps.map(app => {
              const sm = STATUS_META[app.status] || STATUS_META["PENDING"]
              const isRejected = app.status === "REJECTED"
              const isExpanded = expanded === app.id

              return (
                <div key={app.id} className={`bg-white border rounded shadow-sm overflow-hidden ${sm.border}`}>
                  {/* Card header */}
                  <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <span className={`material-symbols-outlined text-2xl ${isRejected ? "text-red-500" : app.status === "PAID" ? "text-emerald-500" : app.status === "APPROVED" ? "text-gov-green" : "text-amber-400"}`}>
                        {sm.icon}
                      </span>
                      <div>
                        <p className="font-black text-slate-900 text-sm leading-tight">{app.purpose_category || "Red Cross Aid"}</p>
                        <p className="font-mono text-[11px] text-slate-400">{app.id.slice(0,8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.approved_amount && (
                        <span className="text-gov-green font-black text-sm">₹{app.approved_amount.toLocaleString("en-IN")}</span>
                      )}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wide flex items-center gap-1 ${sm.color} ${sm.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} /> {sm.label}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </button>

                  {/* Progress pipeline (non-rejected) */}
                  {!isRejected && (
                    <div className="px-6 pb-3">
                      <div className="flex items-center gap-0">
                        {STATUS_STEPS.map((step, i) => {
                          const passed = STATUS_STEPS.indexOf(app.status) >= i
                          const active = app.status === step
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className={`flex flex-col items-center`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  active ? "border-red-600 bg-red-600" : passed ? "border-gov-green bg-gov-green" : "border-slate-200 bg-white"
                                }`}>
                                  {passed && !active && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap ${passed ? "text-slate-700" : "text-slate-300"}`}>
                                  {step === "UNDER_REVIEW" ? "Review" : step === "PAID" ? "Paid" : step.charAt(0) + step.slice(1).toLowerCase()}
                                </p>
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 rounded ${STATUS_STEPS.indexOf(app.status) > i ? "bg-gov-green" : "bg-slate-200"}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-6 py-4 space-y-3 bg-slate-50/50">
                      <Detail label="Purpose" value={app.purpose} />
                      {app.amount_requested && <Detail label="Amount Requested" value={`₹${app.amount_requested.toLocaleString("en-IN")}`} />}
                      {app.approved_amount  && <Detail label="Approved Amount" value={`₹${app.approved_amount.toLocaleString("en-IN")}`} highlight />}
                      {app.admin_remarks    && <Detail label="Admin Remarks" value={app.admin_remarks} />}
                      {app.payment_ref     && <Detail label="Payment Reference" value={app.payment_ref} mono />}
                      {app.paid_at         && <Detail label="Payment Date" value={new Date(app.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />}
                      <Detail label="Submitted On" value={new Date(app.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />

                      {isRejected && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                          <span className="material-symbols-outlined text-red-500 text-[16px] flex-shrink-0 mt-0.5">info</span>
                          <p className="text-xs text-red-700">
                            <span className="font-bold">Arzi Rejected.</span> {app.admin_remarks || "Please contact the district office for more information."}
                            {" "}<Link href="/citizen/red-cross" className="font-bold underline">Apply again</Link>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

function Detail({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm mt-0.5 ${highlight ? "font-black text-gov-green" : mono ? "font-mono font-bold text-slate-700" : "text-slate-700"}`}>{value}</p>
    </div>
  )
}
