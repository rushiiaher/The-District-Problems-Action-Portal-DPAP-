"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminPriorityCasesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [tab, setTab] = useState<"EMERGENCY" | "ESCALATED" | "OVERDUE">("EMERGENCY")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/complaints?all=true")
      .then(r => r.json())
      .then(d => { if (d.complaints) setCases(d.complaints) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user])

  const now = Date.now()
  const emergency  = cases.filter(c => c.priority === "EMERGENCY" && !["RESOLVED","CLOSED","AUTO_CLOSED"].includes(c.status))
  const escalated  = cases.filter(c => c.status === "ESCALATED")
  const overdue    = cases.filter(c => c.sla_deadline && new Date(c.sla_deadline).getTime() < now && !["RESOLVED","CLOSED","AUTO_CLOSED"].includes(c.status))

  const displayed = tab === "EMERGENCY" ? emergency : tab === "ESCALATED" ? escalated : overdue

  const tabConfig = [
    { key: "EMERGENCY", label: "Emergency", count: emergency.length, color: "text-red-600", bg: "bg-red-600", icon: "emergency", dotColor: "bg-red-500" },
    { key: "ESCALATED", label: "Escalated", count: escalated.length, color: "text-orange-600", bg: "bg-orange-500", icon: "escalator_warning", dotColor: "bg-orange-500" },
    { key: "OVERDUE",   label: "SLA Overdue", count: overdue.length, color: "text-amber-600", bg: "bg-amber-500", icon: "schedule", dotColor: "bg-amber-400" },
  ]

  const slaPct = (c: any) => {
    if (!c.sla_deadline || !c.created_at) return 0
    const start = new Date(c.created_at).getTime()
    const end = new Date(c.sla_deadline).getTime()
    return Math.min(120, Math.round(((now - start) / (end - start)) * 100))
  }

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Super Admin · E-ARZI</p>
          <div className="flex items-center gap-2 text-xs text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {emergency.length + escalated.length + overdue.length} cases require attention
          </div>
        </header>

        <div className="p-8 max-w-5xl">
          {/* Title */}
          <div className="mb-8 border-b border-slate-300 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-red-500 inline-block" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-[0.2em]">Priority Cases</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">High-Attention Complaints</h1>
            <p className="text-slate-500 text-sm mt-1">Cases requiring immediate executive action</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tabConfig.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`gov-card border-l-4 p-5 text-left transition-all ${tab === t.key ? "border-l-gov-navy ring-2 ring-gov-navy/20" : "border-l-slate-200 hover:border-l-slate-400"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${t.dotColor} ${t.count > 0 ? "animate-pulse" : ""}`} />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.label}</span>
                </div>
                <div className={`text-3xl font-black ${t.color}`}>{fetching ? "—" : t.count}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">Active cases</div>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">{tabConfig.find(t=>t.key===tab)?.icon}</span>
              <span className="text-sm font-bold text-slate-700">{tabConfig.find(t=>t.key===tab)?.label} Cases</span>
              <span className="ml-auto text-xs text-slate-400">{displayed.length} total</span>
            </div>

            {fetching ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-3 animate-spin">progress_activity</span>
                Loading...
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-14 text-center">
                <span className="material-symbols-outlined text-5xl block mb-3 text-slate-200">check_circle</span>
                <p className="text-slate-400 font-bold">No {tabConfig.find(t=>t.key===tab)?.label.toLowerCase()} cases</p>
                <p className="text-slate-400 text-sm mt-1">All clear in this category</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {displayed.map(c => {
                  const pct = slaPct(c)
                  return (
                    <div key={c.id} className="px-6 py-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      {/* SLA bar */}
                      <div className="w-1.5 h-14 bg-slate-100 rounded-full overflow-hidden flex flex-col-reverse flex-shrink-0">
                        <div className={`w-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-400" : pct >= 50 ? "bg-amber-400" : "bg-gov-green"}`}
                          style={{ height: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gov-navy">{c.id}</span>
                          <span className="font-bold text-slate-800">{c.category}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${c.priority === "EMERGENCY" ? "bg-red-600 text-white" : c.priority === "HIGH" ? "bg-orange-500 text-white" : "bg-amber-400 text-white"}`}>
                            {c.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>{c.village}, {c.block}
                          </span>
                          {c.sla_deadline && (
                            <span className={`flex items-center gap-1 font-bold ${pct >= 100 ? "text-red-600" : "text-slate-500"}`}>
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {pct >= 100 ? `${Math.round((now - new Date(c.sla_deadline).getTime()) / 3600000)}h overdue` : `Due ${new Date(c.sla_deadline).toLocaleDateString("en-IN")}`}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            Filed {new Date(c.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${c.status === "ESCALATED" ? "bg-red-50 text-red-800 border-red-200" : c.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-200"}`}>
                          {c.status?.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-slate-400">{c.department_name || "Unassigned"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
