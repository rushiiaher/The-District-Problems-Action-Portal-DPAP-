"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"

interface Complaint {
  id: string
  status: string
  category: string
  created_at: string
  sla_deadline: string | null
  resolved_at?: string | null
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

export default function OfficerPerformancePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "officer")) router.push("/auth/login")
  }, [user, isLoading, router])

  const fetchComplaints = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const res  = await fetch("/api/complaints?officer=true", {
        headers: { "x-user-id": user.id, "x-user-role": "officer" },
      })
      const data = await res.json()
      if (data.complaints) setComplaints(data.complaints)
    } catch { /* ignore */ }
    finally { setFetching(false) }
  }, [user])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  if (isLoading || !user) return null

  // --- Derived stats ---
  const total    = complaints.length
  const resolved = complaints.filter(c => ["RESOLVED", "CLOSED", "AUTO_CLOSED"].includes(c.status))
  const active   = complaints.filter(c => ["ASSIGNED", "IN_PROGRESS", "ESCALATED"].includes(c.status))
  const overdue  = active.filter(c => {
    if (!c.sla_deadline) return false
    return new Date(c.sla_deadline).getTime() < Date.now()
  })
  const escalated = complaints.filter(c => c.status === "ESCALATED")

  // Avg resolution time (days) for resolved complaints that have both created_at and resolved_at
  const resolvedWithTime = resolved.filter(c => c.resolved_at)
  const avgResolutionDays = resolvedWithTime.length
    ? Math.round(resolvedWithTime.reduce((sum, c) => sum + daysBetween(c.created_at, c.resolved_at!), 0) / resolvedWithTime.length)
    : null

  // Resolution rate
  const resolutionRate = total > 0 ? Math.round((resolved.length / total) * 100) : 0

  // Category breakdown
  const categoryMap: Record<string, number> = {}
  for (const c of complaints) {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1
  }
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])

  // Monthly trend (last 6 months)
  const now = new Date()
  const months: { label: string; received: number; resolved: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" })
    const received = complaints.filter(c => {
      const cd = new Date(c.created_at)
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth()
    }).length
    const res = resolved.filter(c => {
      if (!c.resolved_at) return false
      const rd = new Date(c.resolved_at)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    }).length
    months.push({ label, received, resolved: res })
  }
  const maxMonthVal = Math.max(...months.map(m => Math.max(m.received, m.resolved)), 1)

  const statCards = [
    { label: "Total Assigned",    value: total,            color: "border-l-gov-navy",  textColor: "text-gov-navy",  icon: "inbox"        },
    { label: "Resolved",          value: resolved.length,  color: "border-l-gov-green", textColor: "text-gov-green", icon: "task_alt"     },
    { label: "Active",            value: active.length,    color: "border-l-blue-500",  textColor: "text-blue-600",  icon: "hourglass_top"},
    { label: "Overdue",           value: overdue.length,   color: "border-l-red-500",   textColor: "text-red-600",   icon: "warning"      },
    { label: "Escalated",         value: escalated.length, color: "border-l-orange-500",textColor: "text-orange-600",icon: "escalator_warning"},
    { label: "Resolution Rate",   value: `${resolutionRate}%`, color: "border-l-emerald-500", textColor: "text-emerald-600", icon: "percent" },
  ]

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Nav header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">Officer Portal · E-ARZI</p>
          </div>
          <div className="flex items-center gap-4">
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

        <div className="p-4 md:p-8 max-w-5xl w-full">
          {/* Title */}
          <div className="mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Officer Portal</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Performance</h1>
              <p className="text-slate-500 text-sm mt-1">Analytics and resolution metrics for your assigned cases</p>
            </div>
            <button
              onClick={fetchComplaints}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded shadow-sm hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${fetching ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
          </div>

          {fetching ? (
            <div className="p-16 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl animate-spin block mx-auto mb-3">progress_activity</span>
              Loading performance data…
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map(s => (
                  <div key={s.label} className={`bg-white rounded border border-slate-200 shadow-sm ${s.color} border-l-4 p-5`}>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-3xl font-black ${s.textColor}`}>{s.value}</span>
                      <span className={`material-symbols-outlined text-4xl opacity-10 ${s.textColor}`}>{s.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Avg resolution time callout */}
              {avgResolutionDays !== null && (
                <div className="bg-white rounded border border-slate-200 shadow-sm p-5 mb-8 flex items-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-gov-navy opacity-20">schedule</span>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Avg. Resolution Time</p>
                    <p className="text-3xl font-black text-gov-navy">
                      {avgResolutionDays} <span className="text-base font-semibold text-slate-500">day{avgResolutionDays !== 1 ? "s" : ""}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Across {resolvedWithTime.length} resolved case{resolvedWithTime.length !== 1 ? "s" : ""} with tracked resolution time</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly trend */}
                <div className="bg-white rounded border border-slate-200 shadow-sm p-5">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5">Monthly Trend (Last 6 Months)</h2>
                  {months.every(m => m.received === 0 && m.resolved === 0) ? (
                    <p className="text-slate-400 text-sm text-center py-8">No data available yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {months.map(m => (
                        <div key={m.label}>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="font-bold w-12">{m.label}</span>
                            <span className="text-slate-400 text-[11px]">{m.received} received · {m.resolved} resolved</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 w-16">Received</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gov-navy rounded-full"
                                  style={{ width: `${Math.round((m.received / maxMonthVal) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-gov-navy w-5 text-right">{m.received}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 w-16">Resolved</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gov-green rounded-full"
                                  style={{ width: `${Math.round((m.resolved / maxMonthVal) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-gov-green w-5 text-right">{m.resolved}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category breakdown */}
                <div className="bg-white rounded border border-slate-200 shadow-sm p-5">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5">Cases by Category</h2>
                  {categories.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No cases assigned yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {categories.map(([cat, count]) => (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-700 truncate flex-1 mr-2">{cat}</span>
                            <span className="text-slate-500 font-mono">{count} · {Math.round((count / total) * 100)}%</span>
                          </div>
                          <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gov-saffron rounded-full"
                              style={{ width: `${Math.round((count / (categories[0]?.[1] || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status breakdown table */}
              <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Status Breakdown</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">Count</th>
                      <th className="px-5 py-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { status: "ASSIGNED",    label: "Assigned",    cls: "bg-blue-50 text-blue-800 border-blue-200" },
                      { status: "IN_PROGRESS", label: "In Progress", cls: "bg-amber-50 text-amber-800 border-amber-200" },
                      { status: "ESCALATED",   label: "Escalated",   cls: "bg-red-50 text-red-800 border-red-200" },
                      { status: "RESOLVED",    label: "Resolved",    cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                      { status: "CLOSED",      label: "Closed",      cls: "bg-green-50 text-green-700 border-green-200" },
                    ].map(row => {
                      const cnt = complaints.filter(c => c.status === row.status).length
                      return (
                        <tr key={row.status} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${row.cls}`}>
                              {row.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-black text-slate-800">{cnt}</td>
                          <td className="px-5 py-3 text-right text-slate-500">{total > 0 ? Math.round((cnt / total) * 100) : 0}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
    </SidebarProvider>
  )
}
