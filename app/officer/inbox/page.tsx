"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"

const SLA_PCT = (created: string, deadline: string) => {
  if (!deadline || !created) return 0
  const now = Date.now()
  const start = new Date(created).getTime()
  const end = new Date(deadline).getTime()
  return Math.max(0, Math.round(((now - start) / (end - start)) * 100))
}

const STATUS_BADGE: Record<string, string> = {
  ASSIGNED:    "bg-blue-50 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  ESCALATED:   "bg-red-50 text-red-800 border-red-200",
  RESOLVED:    "bg-emerald-50 text-emerald-800 border-emerald-200",
  CLOSED:      "bg-green-50 text-green-700 border-green-200",
}

export default function OfficerInboxPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [tab, setTab] = useState<"active" | "resolved">("active")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "officer")) router.push("/auth/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/complaints?officer=true", { headers: { "x-user-id": user.id, "x-user-role": "officer" } })
      .then(r => r.json()).then(d => { if (d.complaints) setComplaints(d.complaints) })
      .catch(() => {}).finally(() => setFetching(false))
  }, [user])

  const withSla = complaints.map(c => ({ ...c, slaPct: SLA_PCT(c.created_at, c.sla_deadline) }))
  const active = withSla.filter(c => ["ASSIGNED", "IN_PROGRESS", "ESCALATED"].includes(c.status)).sort((a, b) => b.slaPct - a.slaPct)
  const resolved = withSla.filter(c => ["RESOLVED", "CLOSED", "AUTO_CLOSED"].includes(c.status))
  const overdue = active.filter(c => c.slaPct >= 100).length
  const atRisk = active.filter(c => c.slaPct >= 50 && c.slaPct < 100).length
  const displayed = tab === "active" ? active : resolved

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Navy header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Officer Portal · E-ARZI</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-300 hover:text-white">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.name || "Officer"}</p>
                <p className="text-[10px] text-slate-400 uppercase">Field Officer</p>
              </div>
              <div className="size-8 rounded-full bg-gov-saffron flex items-center justify-center font-bold text-sm text-white">
                {(user.name || "O")[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          {/* Title */}
          <div className="mb-8 flex items-end justify-between border-b border-slate-300 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Officer Portal</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Complaint Inbox</h1>
              <p className="text-slate-500 text-sm mt-1">
                <span className="font-bold text-gov-navy">{active.length}</span> active ·{" "}
                <span className="font-bold text-red-600">{overdue}</span> overdue ·{" "}
                <span className="font-bold text-amber-500">{atRisk}</span> at risk
              </p>
            </div>
            <button
              onClick={() => setFetching(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-sm hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active Cases", value: active.length, color: "border-l-gov-navy", textColor: "text-gov-navy", icon: "inbox" },
              { label: "Overdue", value: overdue, color: "border-l-red-500", textColor: "text-red-600", icon: "warning" },
              { label: "Resolved", value: resolved.length, color: "border-l-gov-green", textColor: "text-gov-green", icon: "task_alt" },
            ].map(s => (
              <div key={s.label} className={`gov-card ${s.color} border-l-4 p-5`}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-black ${s.textColor}`}>{s.value}</span>
                  <span className={`material-symbols-outlined text-4xl opacity-10 text-slate-800`}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-200 rounded p-1 mb-6 w-fit">
            {["active", "resolved"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`px-6 py-2 text-sm font-bold rounded capitalize transition-all ${tab === t ? "bg-gov-navy text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t} ({t === "active" ? active.length : resolved.length})
              </button>
            ))}
          </div>

          {/* List */}
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin block mx-auto mb-3">progress_activity</span>
                Loading your inbox...
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-14 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">inbox</span>
                <p className="text-slate-500">No {tab} complaints</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {displayed.map(c => (
                  <Link key={c.id} href={`/officer/complaint/${c.id}`}>
                    <div className="px-6 py-5 hover:bg-amber-50/20 transition-colors flex items-center gap-4 cursor-pointer group">
                      {/* SLA indicator */}
                      {tab === "active" && (
                        <div className="w-1.5 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex flex-col-reverse">
                          <div
                            className={`w-full rounded-full ${c.slaPct >= 100 ? "bg-red-500" : c.slaPct >= 50 ? "bg-amber-400" : "bg-gov-green"}`}
                            style={{ height: `${Math.min(100, c.slaPct)}%` }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{c.category}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_BADGE[c.status] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
                            {c.status.replace("_", " ")}
                          </span>
                          {tab === "active" && c.slaPct >= 100 && (
                            <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">🔴 Overdue</span>
                          )}
                          {tab === "active" && c.slaPct >= 50 && c.slaPct < 100 && (
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">🟡 At Risk</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="font-mono font-bold">{c.id}</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>{c.village}
                          </span>
                          {c.sla_deadline && tab === "active" && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                              Due {new Date(c.sla_deadline).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-gov-navy transition-colors">chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
