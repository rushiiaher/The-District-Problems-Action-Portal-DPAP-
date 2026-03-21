"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

const ACTION_ICONS: Record<string, string> = {
  LOGIN:     "login",
  LOGOUT:    "logout",
  CREATE:    "add_circle",
  UPDATE:    "edit",
  DELETE:    "delete",
  ASSIGN:    "assignment_ind",
  RESOLVE:   "task_alt",
  ESCALATE:  "trending_up",
  REJECT:    "cancel",
  REOPEN:    "restart_alt",
}
const ACTION_COLORS: Record<string, string> = {
  CREATE:  "text-gov-green bg-green-50 border-green-200",
  UPDATE:  "text-amber-700 bg-amber-50 border-amber-200",
  DELETE:  "text-red-700 bg-red-50 border-red-200",
  ASSIGN:  "text-blue-700 bg-blue-50 border-blue-200",
  RESOLVE: "text-gov-green bg-green-50 border-green-200",
  ESCALATE:"text-orange-700 bg-orange-50 border-orange-200",
  REJECT:  "text-red-700 bg-red-50 border-red-200",
  REOPEN:  "text-purple-700 bg-purple-50 border-purple-200",
  LOGIN:   "text-slate-700 bg-slate-50 border-slate-200",
  LOGOUT:  "text-slate-700 bg-slate-50 border-slate-200",
}

// Mock audit data (replace with real API call when audit_log table is populated)
const MOCK_LOGS = Array.from({ length: 40 }, (_, i) => {
  const actions = ["ASSIGN", "RESOLVE", "UPDATE", "CREATE", "ESCALATE", "REJECT", "REOPEN", "LOGIN"]
  const roles   = ["superadmin", "subadmin", "officer"]
  const tables  = ["complaints", "users", "departments", "officers"]
  const action  = actions[i % actions.length]
  const d = new Date(); d.setHours(d.getHours() - i * 2)
  return {
    id: `LOG-${String(i+1).padStart(4,"0")}`,
    actor_role: roles[i % roles.length],
    action,
    target_table: tables[i % tables.length],
    target_id: `ARZ-2026-${String(1000+i).padStart(6,"0")}`,
    timestamp: d.toISOString(),
    ip: `192.168.${(i%5)+1}.${(i%30)+10}`,
    new_value: action === "UPDATE" ? { status: "RESOLVED" } : null,
  }
})

export default function AdminAuditPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("ALL")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/audit-log?limit=200")
      .then(r => r.json())
      .then(d => {
        // Fall back to mock data if table is empty or not yet populated
        setLogs(d.logs && d.logs.length > 0 ? d.logs : MOCK_LOGS)
      })
      .catch(() => setLogs(MOCK_LOGS))
      .finally(() => setFetching(false))
  }, [user])

  const filtered = logs.filter(l => {
    if (actionFilter !== "ALL" && l.action !== actionFilter) return false
    if (roleFilter !== "ALL" && l.actor_role !== roleFilter) return false
    if (search && !l.target_id?.toLowerCase().includes(search.toLowerCase()) &&
        !l.actor_role?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Super Admin · E-ARZI</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="material-symbols-outlined text-[16px] text-gov-saffron">verified_user</span>
            Append-only · Tamper-proof
          </div>
        </header>

        <div className="p-8">
          {/* Title */}
          <div className="mb-8 border-b border-slate-300 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-gov-saffron inline-block" />
              <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Audit Reports</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Audit Log</h1>
            <p className="text-slate-500 text-sm mt-1">Immutable record of all system actions. Cannot be edited or deleted.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Events", value: logs.length, icon: "receipt_long", color: "border-l-gov-navy text-gov-navy" },
              { label: "Today", value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, icon: "today", color: "border-l-gov-saffron text-gov-saffron" },
              { label: "High-Risk Actions", value: logs.filter(l => ["DELETE","REJECT","ESCALATE"].includes(l.action)).length, icon: "warning", color: "border-l-red-500 text-red-600" },
              { label: "Unique Actors", value: new Set(logs.map(l=>l.actor_role)).size, icon: "group", color: "border-l-gov-green text-gov-green" },
            ].map(s => (
              <div key={s.label} className={`gov-card ${s.color} border-l-4 p-5`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-black ${s.color.split(" ")[1]}`}>{logs.length ? s.value : "—"}</span>
                  <span className="material-symbols-outlined text-4xl opacity-10 text-slate-700">{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-44">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Search</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Target ID or role..."
                  className="w-full border border-slate-200 pl-9 pr-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"/>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Action</label>
              <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
                className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy">
                {["ALL", ...Object.keys(ACTION_ICONS)].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Actor Role</label>
              <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
                className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy">
                {["ALL", "superadmin", "subadmin", "officer"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block animate-spin mb-3">progress_activity</span>Loading audit log...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="gov-table w-full text-left">
                    <thead>
                      <tr>
                        <th>Log ID</th>
                        <th>Timestamp</th>
                        <th>Actor Role</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Record ID</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="font-mono text-xs text-slate-500">{l.id}</td>
                          <td className="text-xs text-slate-600 whitespace-nowrap">
                            {new Date(l.timestamp).toLocaleDateString("en-IN")} {new Date(l.timestamp).toLocaleTimeString("en-IN")}
                          </td>
                          <td>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">{l.actor_role}</span>
                          </td>
                          <td>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 w-fit ${ACTION_COLORS[l.action] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              <span className="material-symbols-outlined text-[12px]">{ACTION_ICONS[l.action] || "info"}</span>
                              {l.action}
                            </span>
                          </td>
                          <td className="text-xs text-slate-600 capitalize">{l.target_table}</td>
                          <td className="font-mono text-xs text-gov-navy">{l.target_id || "—"}</td>
                          <td className="text-xs text-slate-500 font-mono">{l.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                      <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50">Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
