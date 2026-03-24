"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
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

export default function AdminComplaintsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/complaints?all=true")
      .then(r => r.json())
      .then(d => { if (d.complaints) setComplaints(d.complaints) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user])

  const filtered = complaints.filter(c => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (search && !c.id?.toLowerCase().includes(search.toLowerCase()) &&
        !c.category?.toLowerCase().includes(search.toLowerCase()) &&
        !c.village?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Super Admin · E-ARZI</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            Systems Operational
          </div>
        </header>

        <div className="p-8">
          {/* Title */}
          <div className="mb-8 border-b border-slate-300 pb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">All Complaints</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Complaint Registry</h1>
              <p className="text-slate-500 text-sm mt-1">
                {fetching ? "Loading..." : `${filtered.length} of ${complaints.length} complaints`}
              </p>
            </div>
            <button onClick={() => { setFetching(true); fetch("/api/complaints?all=true").then(r=>r.json()).then(d=>{if(d.complaints)setComplaints(d.complaints)}).finally(()=>setFetching(false)) }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-sm font-bold rounded shadow-sm hover:bg-slate-50">
              <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Search</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="ID, category, village..."
                  className="w-full border border-slate-200 pl-9 pr-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Status</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(statusFilter !== "ALL" || search) && (
              <button onClick={() => { setStatusFilter("ALL"); setSearch(""); setPage(1) }}
                className="text-sm text-slate-500 hover:text-gov-navy flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">clear</span> Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            {fetching ? (
              <div className="p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-3 animate-spin">progress_activity</span>
                Loading complaints...
              </div>
            ) : paged.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl block mb-3 text-slate-200">fact_check</span>
                No complaints match your filters
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="gov-table w-full text-left">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Category</th>
                        <th>Village / Block</th>
                        <th>Status</th>
                        <th>Department</th>
                        <th>Filed On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="font-mono text-xs font-bold text-gov-navy">{c.id}</td>
                          <td className="font-medium text-slate-800">{c.category}</td>
                          <td className="text-slate-600">{c.village}, {c.block}</td>
                          <td>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${STATUS_STYLES[c.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              {c.status?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="text-slate-600 text-xs">{c.department_name || "—"}</td>
                          <td className="text-slate-500 text-xs">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                          <td>
                            <Link href={`/admin/complaints/${c.id}`}>
                              <span className="material-symbols-outlined text-slate-400 hover:text-gov-navy text-[20px] cursor-pointer">open_in_new</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                      {Array.from({length: Math.min(totalPages, 7)}, (_, i) => i+1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          className={`px-3 py-1.5 text-xs font-bold rounded border ${page===p ? "bg-gov-navy text-white border-gov-navy" : "border-slate-200 hover:bg-slate-50"}`}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
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
