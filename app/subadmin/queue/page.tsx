"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"

type Complaint = {
  id: string
  category: string
  status: string
  block: string
  village: string
  description: string
  has_attachments: boolean
  rejection_reason?: string
  assignment_note?: string
  assigned_dept_name?: string
  department_name?: string
  created_at: string
  sla_deadline?: string
}

const STATUS_META: Record<string, { label: string; rowColor: string; badge: string; dot: string }> = {
  SUBMITTED:   { label: "Unassigned",   rowColor: "",                          badge: "bg-amber-100 text-amber-800 border-amber-200",   dot: "bg-amber-500" },
  REASSIGNED:  { label: "Returned",     rowColor: "bg-orange-50/40",           badge: "bg-orange-100 text-orange-800 border-orange-200", dot: "bg-orange-500" },
  ASSIGNED:    { label: "Assigned",     rowColor: "bg-blue-50/30",             badge: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  IN_PROGRESS: { label: "In Progress",  rowColor: "bg-indigo-50/30",           badge: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  RESOLVED:    { label: "Resolved",     rowColor: "bg-green-50/30",            badge: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-500" },
  CLOSED:      { label: "Closed",       rowColor: "bg-slate-50/50",            badge: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400" },
  REJECTED:    { label: "Rejected",     rowColor: "bg-red-50/30",              badge: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-500" },
  ESCALATED:   { label: "Escalated",    rowColor: "bg-purple-50/30",           badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
}


const CATEGORIES = [
  "Water Supply & Sanitation", "Road Repair & Maintenance", "Electricity / Power Supply",
  "Drainage & Sewage", "Public Health", "Education", "Agriculture",
  "Revenue & Land Records", "Social Welfare", "Public Works", "Environment",
  "Law & Order (Non-Emergency)", "Other",
]

export default function SubAdminQueuePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [fetching, setFetching]     = useState(true)

  // Filters
  const [statusFilter,   setStatusFilter]   = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [search, setSearch] = useState("")

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "subadmin")) router.push("/subadmin/login")
  }, [user, isLoading, router])

  const fetchComplaints = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      // Subadmin sees all complaints (except fully closed ones by default)
      const res = await fetch("/api/complaints?all=true&limit=500", {
        headers: { "x-user-id": user.id, "x-user-role": user.role },
      })
      const data = await res.json()
      if (data.complaints) setComplaints(data.complaints)
    } finally { setFetching(false) }
  }, [user])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  // Derived counts
  const unassigned  = complaints.filter(c => c.status === "SUBMITTED").length
  const returned    = complaints.filter(c => c.status === "REASSIGNED").length
  const inProgress  = complaints.filter(c => c.status === "IN_PROGRESS").length
  const resolved    = complaints.filter(c => c.status === "RESOLVED").length

  // Filter the list
  const filtered = complaints.filter(c => {
    if (statusFilter   && c.status !== statusFilter)     return false
    if (categoryFilter && c.category !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.id.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)
        && !c.block.toLowerCase().includes(q) && !c.village.toLowerCase().includes(q)) return false
    }
    return true
  })

  const needsAction = filtered.filter(c => ["SUBMITTED", "REASSIGNED"].includes(c.status))
  const assigned    = filtered.filter(c => !["SUBMITTED", "REASSIGNED"].includes(c.status))

  if (isLoading || !user) return null

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">Sub Admin · Complaint Queue</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 w-32 md:w-56"
              />
            </div>
            <button onClick={fetchComplaints}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white border border-white/20 px-2 md:px-3 py-1.5 rounded hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[14px]">refresh</span> <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-5">

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Needs Assignment", value: unassigned, icon: "inbox",       color: "border-l-amber-400",   click: () => setStatusFilter("SUBMITTED") },
              { label: "Returned",         value: returned,  icon: "undo",         color: "border-l-orange-400",  click: () => setStatusFilter("REASSIGNED") },
              { label: "In Progress",      value: inProgress, icon: "pending",     color: "border-l-blue-400",    click: () => setStatusFilter("IN_PROGRESS") },
              { label: "Resolved Today",   value: resolved,  icon: "check_circle", color: "border-l-gov-green",   click: () => setStatusFilter("RESOLVED") },
            ].map(s => (
              <button key={s.label} onClick={s.click}
                className={`gov-card border-l-4 ${s.color} p-4 flex items-center gap-4 text-left hover:shadow-md transition-all ${statusFilter === (s.label === "Needs Assignment" ? "SUBMITTED" : s.label === "Returned" ? "REASSIGNED" : s.label === "In Progress" ? "IN_PROGRESS" : "RESOLVED") ? "ring-2 ring-gov-navy/20" : ""}`}>
                <span className="material-symbols-outlined text-3xl text-slate-300">{s.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900">{String(s.value).padStart(2, "0")}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-4 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter:</span>

            <select value={statusFilter}   onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 text-xs font-semibold rounded py-1.5 px-3 text-slate-700 bg-white focus:outline-none focus:border-gov-navy">
              <option value="">All Statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="border border-slate-200 text-xs font-semibold rounded py-1.5 px-3 text-slate-700 bg-white focus:outline-none focus:border-gov-navy">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {(statusFilter || categoryFilter || search) && (
              <button onClick={() => { setStatusFilter(""); setCategoryFilter(""); setSearch("") }}
                className="text-[10px] text-red-500 font-bold hover:underline ml-1">
                Clear all
              </button>
            )}

            <div className="ml-auto text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {filtered.length} records
            </div>
          </div>

          {/* ── Needs Action Table ── */}
          {needsAction.length > 0 && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-amber-50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">
                  Needs Your Action — {needsAction.length} complaints
                </p>
              </div>
              <ComplaintsTable complaints={needsAction} type="action" />
            </div>
          )}

          {/* ── Assigned / Tracking Table ── */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gov-navy" />
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                All Complaints — {fetching ? "…" : assigned.length}
              </p>
            </div>
            {fetching ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>
                Loading complaints…
              </div>
            ) : assigned.length === 0 && needsAction.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">inbox</span>
                <p className="font-bold text-slate-400">No complaints match your filters</p>
              </div>
            ) : (
              <ComplaintsTable complaints={assigned} type="track" />
            )}
          </div>
        </div>
      </main>
    </div>
    </SidebarProvider>
  )
}

// ── Reusable table component ──────────────────────────────────────────────
function ComplaintsTable({ complaints, type }: { complaints: Complaint[]; type: "action" | "track" }) {
  if (complaints.length === 0) return (
    <div className="px-6 py-8 text-center text-slate-400 text-sm">No records in this section</div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50">
            <th className="px-5 py-3 text-left font-bold">ID</th>
            <th className="px-5 py-3 text-left font-bold">Category</th>
            <th className="px-5 py-3 text-left font-bold">Location</th>
            <th className="px-5 py-3 text-left font-bold">Status</th>
            {type === "track" && <th className="px-5 py-3 text-left font-bold">Department</th>}
            <th className="px-5 py-3 text-left font-bold">Date</th>
            <th className="px-5 py-3 text-left font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {complaints.map(c => {
            const sm = STATUS_META[c.status] || STATUS_META["SUBMITTED"]
            const isOverdue = c.sla_deadline && new Date(c.sla_deadline) < new Date()

            return (
              <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${sm.rowColor}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <span title="SLA Overdue" className="material-symbols-outlined text-[14px] text-red-500">warning</span>
                    )}
                    <span className="font-mono font-bold text-gov-navy text-xs">{c.id}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-slate-800 text-xs max-w-[160px] leading-tight">{c.category}</p>
                  {c.has_attachments && (
                    <span className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-[11px]">attach_file</span> Attachments
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600">
                  {c.village}, {c.block}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full border w-fit ${sm.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sm.dot}`} />
                    {sm.label}
                  </span>
                  {c.status === "REASSIGNED" && c.rejection_reason && (
                    <p className="text-[9px] text-orange-600 mt-0.5 max-w-[120px] leading-tight truncate" title={c.rejection_reason}>
                      ↩ {c.rejection_reason}
                    </p>
                  )}
                </td>
                {type === "track" && (
                  <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[120px] truncate">
                    {c.assigned_dept_name || c.department_name || "—"}
                  </td>
                )}
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/subadmin/assign/${c.id}`}>
                    <button className={`flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${
                      ["SUBMITTED", "REASSIGNED"].includes(c.status)
                        ? "bg-gov-saffron text-white hover:bg-[#e68a2e] shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {["SUBMITTED", "REASSIGNED"].includes(c.status) ? "assignment_ind" : "open_in_new"}
                      </span>
                      {["SUBMITTED", "REASSIGNED"].includes(c.status) ? "Assign" : "View"}
                    </button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
