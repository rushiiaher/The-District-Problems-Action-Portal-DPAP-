"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import Link from "next/link"

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED:   "bg-slate-100 text-slate-700 border-slate-300",
  ASSIGNED:    "bg-blue-50 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  ESCALATED:   "bg-red-50 text-red-800 border-red-200",
  RESOLVED:    "bg-emerald-50 text-emerald-800 border-emerald-200",
  CLOSED:      "bg-green-50 text-green-700 border-green-200",
  REJECTED:    "bg-red-100 text-red-900 border-red-300",
  REOPENED:    "bg-orange-50 text-orange-800 border-orange-200",
}

const STATUSES = ["ALL", "SUBMITTED", "ASSIGNED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED", "REJECTED"]

const CATEGORIES = [
  "Water Supply & Sanitation",
  "Road Repair & Maintenance",
  "Electricity / Power Supply",
  "Drainage & Sewage",
  "Public Health",
  "Education",
  "Agriculture",
  "Revenue & Land Records",
  "Social Welfare",
  "Public Works",
  "Environment",
  "Law & Order (Non-Emergency)",
  "Grievance",
  "Cancer Disease",
  "Other than Cancer",
  "Other",
]

export default function AdminComplaintsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [complaints,   setComplaints]   = useState<any[]>([])
  const [departments,  setDepartments]  = useState<any[]>([])
  const [fetching,     setFetching]     = useState(true)

  // filters
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [deptFilter,   setDeptFilter]   = useState("ALL")
  const [dateFrom,     setDateFrom]     = useState("")
  const [dateTo,       setDateTo]       = useState("")

  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const [cRes, dRes] = await Promise.all([
        fetch("/api/complaints?all=true", {
          headers: { "x-user-id": user.id, "x-user-role": user.role },
        }),
        fetch("/api/departments"),
      ])
      const cData = await cRes.json()
      const dData = await dRes.json()
      if (cData.complaints) setComplaints(cData.complaints)
      if (dData.departments) setDepartments(dData.departments)
    } catch { /* ignore */ }
    finally { setFetching(false) }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = complaints.filter(c => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false
    if (deptFilter !== "ALL" && c.assigned_dept_id !== deptFilter) return false
    if (dateFrom && new Date(c.created_at) < new Date(dateFrom)) return false
    if (dateTo   && new Date(c.created_at) > new Date(dateTo + "T23:59:59")) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !c.id?.toLowerCase().includes(q) &&
        !c.category?.toLowerCase().includes(q) &&
        !c.village?.toLowerCase().includes(q) &&
        !c.block?.toLowerCase().includes(q) &&
        !c.citizen_name?.toLowerCase().includes(q) &&
        !c.citizen_mobile?.includes(q)
      ) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const hasFilters = statusFilter !== "ALL" || categoryFilter !== "ALL" || deptFilter !== "ALL" || search || dateFrom || dateTo

  const clearFilters = () => {
    setStatusFilter("ALL"); setCategoryFilter("ALL"); setDeptFilter("ALL")
    setSearch(""); setDateFrom(""); setDateTo(""); setPage(1)
  }

  if (isLoading || !user) return null

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">Super Admin · E-ARZI</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            Systems Operational
          </div>
        </header>

        <div className="p-4 md:p-8">
          {/* Title */}
          <div className="mb-6 md:mb-8 border-b border-slate-200 pb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">All Arzis</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Arzi Registry</h1>
              <p className="text-slate-500 text-sm mt-1">
                {fetching ? "Loading…" : (
                  <>
                    <span className="font-bold text-gov-navy">{filtered.length}</span> of{" "}
                    <span className="font-bold">{complaints.length}</span> complaints
                  </>
                )}
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded shadow-sm hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${fetching ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-4 mb-6 space-y-3">
            {/* Row 1: search + status + category */}
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-48">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Search</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="ID, name, mobile, category, village…"
                    className="w-full border border-slate-200 pl-9 pr-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="min-w-36">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                  className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace("_", " ")}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="min-w-48">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
                  className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: department + date range + clear */}
            <div className="flex flex-wrap gap-3 items-end">
              {/* Department */}
              <div className="min-w-56">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Department</label>
                <select
                  value={deptFilter}
                  onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
                  className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                  className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPage(1) }}
                  className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                />
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-500 hover:text-gov-navy border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">clear</span>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            {fetching ? (
              <div className="p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-3 animate-spin">progress_activity</span>
                Loading complaints…
              </div>
            ) : paged.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl block mb-3 text-slate-200">fact_check</span>
                <p className="font-bold">No complaints match your filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-3 text-sm text-gov-navy font-bold underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-5 py-3">Arzi ID / Citizen</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Village / Block</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Department</th>
                        <th className="px-5 py-3">Filed On</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paged.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-5 py-3">
                            <p className="font-mono text-xs font-black text-gov-navy">{c.id}</p>
                            {c.citizen_name && (
                              <p className="text-xs text-slate-500 mt-0.5">{c.citizen_name}</p>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-800">{c.category}</td>
                          <td className="px-5 py-3 text-slate-600 text-xs">{[c.village, c.block].filter(Boolean).join(", ")}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${STATUS_STYLES[c.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              {c.status?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600 text-xs">{c.department_name || <span className="text-slate-300">—</span>}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                          <td className="px-5 py-3">
                            <Link href={`/admin/complaints/${c.id}`}>
                              <span className="material-symbols-outlined text-slate-300 group-hover:text-gov-navy text-[20px] cursor-pointer transition-colors">open_in_new</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const p = totalPages <= 7 ? i + 1 : Math.max(1, Math.min(page - 3, totalPages - 6)) + i
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1.5 text-xs font-bold rounded border ${page === p ? "bg-gov-navy text-white border-gov-navy" : "border-slate-200 hover:bg-slate-50"}`}
                          >
                            {p}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
    </SidebarProvider>
  )
}
