"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [depts, setDepts] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()),
      fetch("/api/dashboard/department-performance").then(r => r.json()),
    ]).then(([s, d]) => {
      if (s.stats) setStats(s.stats)
      if (d.departments) setDepts(d.departments)
    }).catch(() => {})
  }, [user])

  if (isLoading || !user) return null

  const statCards = [
    { label: "Total Open Files", value: stats?.total_open ?? "—", icon: "inbox", color: "border-l-gov-navy", textColor: "text-gov-navy", badge: "ACTIVE" },
    { label: "High-Level Escalations", value: stats?.escalated ?? "—", icon: "priority_high", color: "border-l-red-500", textColor: "text-red-600", badge: null },
    { label: "Total Disposals", value: stats?.resolved_week ?? "—", icon: "verified", color: "border-l-gov-green", textColor: "text-gov-green", badge: "RESOLVED" },
    { label: "Avg Resolution SLA", value: stats?.avg_resolution_days ? `${stats.avg_resolution_days} Days` : "—", icon: "schedule", color: "border-l-gov-saffron", textColor: "text-gov-saffron", badge: "-0.5 DAYS" },
    { label: "Active Departments", value: stats?.departments ?? "—", icon: "account_balance", color: "border-l-blue-400", textColor: "text-blue-600", badge: null },
    { label: "Field Officers", value: stats?.officers ?? "—", icon: "badge", color: "border-l-indigo-400", textColor: "text-indigo-600", badge: null },
    { label: "Sub-Admins", value: stats?.subadmins ?? "—", icon: "manage_accounts", color: "border-l-purple-400", textColor: "text-purple-600", badge: null },
    { label: "Satisfaction Rate", value: stats?.satisfaction ? `${stats.satisfaction}%` : "—", icon: "star", color: "border-l-amber-400", textColor: "text-amber-600", badge: null },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Navy top bar */}
        <header className="h-14 flex items-center justify-between pl-14 md:pl-8 pr-4 md:pr-8 bg-gov-navy text-white sticky top-0 z-10">
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>
              <input className="w-full pl-10 pr-4 py-1.5 bg-white/10 border-none rounded text-sm focus:bg-white focus:text-slate-900 outline-none placeholder:text-slate-300" placeholder="Search by Complaint ID, Aadhaar, or Name..." />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="size-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Systems Operational</span>
            </div>
            <button className="relative p-1.5 hover:bg-white/10 rounded">
              <span className="material-symbols-outlined">notifications_active</span>
              <span className="absolute top-1 right-1 size-2 bg-gov-saffron rounded-full border border-gov-navy" />
            </button>
            <div className="hidden md:block h-6 w-px bg-white/20" />
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest">Office of District HQ</p>
              <p className="text-[10px] text-slate-400 uppercase">Administrator</p>
            </div>
            <div className="size-8 rounded-full bg-gov-saffron flex items-center justify-center font-black text-white text-sm">
              {user.name?.[0] || "A"}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {/* Title */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                Executive Oversight Dashboard
              </h1>
              <p className="text-slate-500 mt-2 text-sm">Real-time Performance Metrics &amp; Citizen Grievance Analytics</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[11px] font-bold px-2 py-1 bg-slate-200 text-slate-700 uppercase tracking-wider rounded">Classified Access</span>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button className="hidden md:flex items-center gap-2 px-5 py-2.5 border border-slate-300 bg-white font-bold text-sm rounded hover:bg-slate-50 transition-all text-gov-navy">
                <span className="material-symbols-outlined text-base">calendar_month</span> Quarterly View
              </button>
              <button className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-gov-navy text-white font-bold text-sm rounded hover:bg-[#001a8c] transition-all">
                <span className="material-symbols-outlined text-base">print</span> <span className="hidden md:inline">Print Official Dossier</span><span className="md:hidden">Print</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
            {statCards.map(s => (
              <div key={s.label} className={`gov-card ${s.color} border-l-4 p-6 relative overflow-hidden`}>
                {s.badge && (
                  <span className="absolute top-3 right-3 text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">{s.badge}</span>
                )}
                <span className={`material-symbols-outlined text-3xl ${s.textColor} mb-2 block opacity-80`}>{s.icon}</span>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.textColor} leading-none`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Department performance table */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                  <div className="h-5 w-1 bg-gov-navy" />
                  <h2 className="font-extrabold text-slate-900 uppercase text-sm tracking-wider">Institutional Complaint Volume Trends</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Department", "Total", "Open", "Resolved", "SLA Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest border border-slate-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {depts.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">No data yet</td></tr>
                      ) : depts.map(d => (
                        <tr key={d.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="px-5 py-3.5 text-xs font-bold text-gov-navy border border-slate-200">{d.name}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-700 border border-slate-200 font-bold">{d.total || 0}</td>
                          <td className="px-5 py-3.5 text-xs border border-slate-200">
                            <span className="font-bold text-amber-700">{d.open || 0}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs border border-slate-200">
                            <span className="font-bold text-gov-green">{d.resolved || 0}</span>
                          </td>
                          <td className="px-5 py-3.5 border border-slate-200">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${d.overdue > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                              {d.overdue > 0 ? `${d.overdue} Overdue` : "On Track"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Priority Mandates */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden h-full">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-black text-sm uppercase">Warning</span>
                    <h2 className="font-extrabold text-slate-900 uppercase text-sm tracking-wider">Priority Mandates</h2>
                  </div>
                  <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase">Urgent</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">No Priority Escalations</span>
                    </div>
                    <p className="text-xs text-slate-500">All complaints are within SLA thresholds. System will alert you of any escalations.</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="px-6 pb-6 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
                  {[
                    { label: "Manage Departments", href: "/admin/departments", icon: "account_balance" },
                    { label: "Add Officer", href: "/admin/officers", icon: "badge" },
                    { label: "Add Sub-Admin", href: "/admin/subadmins", icon: "manage_accounts" },
                  ].map(a => (
                    <Link key={a.label} href={a.href}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded border border-slate-200 hover:border-gov-navy hover:bg-gov-navy/5 transition-all cursor-pointer group">
                        <span className="material-symbols-outlined text-gov-navy text-[18px]">{a.icon}</span>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-gov-navy">{a.label}</span>
                        <span className="material-symbols-outlined text-slate-400 text-[16px] ml-auto group-hover:text-gov-navy">chevron_right</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
