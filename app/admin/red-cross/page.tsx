"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"

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
  mobile?: string
  district?: string; block?: string; village?: string
  documents?: string[]
  health_documents?: string[]
  bank_account_no?: string
  bank_name?: string
  ifsc_code?: string
  bank_branch?: string
  created_at: string; reviewed_at?: string; paid_at?: string
  citizen_id: string
}

const SM: Record<string, { label: string; badge: string; dot: string }> = {
  PENDING:   { label: "Pending",   badge: "bg-amber-100 text-amber-800 border-amber-200",      dot: "bg-amber-400"   },
  APPROVED:  { label: "Approved",  badge: "bg-green-100 text-green-700 border-green-200",      dot: "bg-gov-green"   },
  REJECTED:  { label: "Rejected",  badge: "bg-red-100 text-red-700 border-red-200",            dot: "bg-red-500"     },
  PAID:      { label: "Paid",      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", badge: "bg-slate-100 text-slate-500 border-slate-200",      dot: "bg-slate-300"   },
}

const STAT_CARDS = ["PENDING", "APPROVED", "REJECTED", "PAID"]
const BORDER_COLOR: Record<string, string> = {
  PENDING:  "border-l-amber-400",
  APPROVED: "border-l-gov-green",
  REJECTED: "border-l-red-500",
  PAID:     "border-l-emerald-500",
}

export default function AdminRedCrossPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [apps,     setApps]     = useState<Application[]>([])
  const [fetching, setFetching] = useState(true)

  // filters
  const [statusFilter,   setStatusFilter]   = useState("")
  const [search,         setSearch]         = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dateFrom,       setDateFrom]       = useState("")
  const [dateTo,         setDateTo]         = useState("")

  // modal
  const [selected, setSelected] = useState<Application | null>(null)
  const [action,   setAction]   = useState<"approve" | "reject" | null>(null)
  const [amount,   setAmount]   = useState("")
  const [remarks,  setRemarks]  = useState("")
  const [saving,   setSaving]   = useState(false)
  const [revErr,   setRevErr]   = useState("")
  const [preview,  setPreview]  = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || !["superadmin", "subadmin"].includes(user.role)))
      router.push("/auth/login")
  }, [user, isLoading, router])

  const fetchApps = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const res = await fetch("/api/red-cross", {
        headers: { "x-user-id": user.id, "x-user-role": user.role },
      })
      const d = await res.json()
      if (d.applications) setApps(d.applications)
    } catch { /* ignore */ }
    finally { setFetching(false) }
  }, [user])

  useEffect(() => { fetchApps() }, [fetchApps])

  // Derived unique categories for the dropdown
  const categories = useMemo(() => {
    const set = new Set(apps.map(a => a.purpose_category).filter(Boolean))
    return Array.from(set).sort() as string[]
  }, [apps])

  // Client-side filtering
  const filtered = useMemo(() => apps.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false
    if (categoryFilter && a.purpose_category !== categoryFilter) return false
    if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false
    if (dateTo   && new Date(a.created_at) > new Date(dateTo + "T23:59:59")) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !a.full_name?.toLowerCase().includes(q) &&
        !a.mobile?.includes(q) &&
        !a.purpose_category?.toLowerCase().includes(q) &&
        !a.purpose?.toLowerCase().includes(q) &&
        !a.village?.toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [apps, statusFilter, categoryFilter, dateFrom, dateTo, search])

  const counts: Record<string, number> = {}
  STAT_CARDS.forEach(s => { counts[s] = apps.filter(a => a.status === s).length })

  const hasFilters = !!statusFilter || !!search || !!categoryFilter || !!dateFrom || !!dateTo
  const clearFilters = () => {
    setStatusFilter(""); setSearch(""); setCategoryFilter(""); setDateFrom(""); setDateTo("")
  }

  const openModal = (app: Application) => {
    setSelected(app); setAction(null); setAmount(""); setRemarks(""); setRevErr("")
  }

  const handleReview = async () => {
    if (!selected || !action) return
    if (action === "approve" && (!amount || parseFloat(amount) <= 0)) {
      setRevErr("Enter a valid approved amount"); return
    }
    setSaving(true); setRevErr("")
    const res = await fetch(`/api/red-cross/${selected.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
      body: JSON.stringify({ action, approved_amount: amount, admin_remarks: remarks }),
    })
    const d = await res.json()
    if (!d.success) { setRevErr(d.error); setSaving(false); return }
    setApps(p => p.map(a => a.id === selected.id ? { ...a, ...d.application } : a))
    setSelected(null); setSaving(false)
  }

  if (isLoading || !user) return null

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-red-700 text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <div className="w-5 h-5 relative flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-4 bg-white" /><div className="absolute w-4 h-1 bg-white" />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200 hidden sm:block">
              Administration · Financial Help in Emergency
            </p>
          </div>
          <p className="text-xs text-red-200">{apps.length} total</p>
        </header>

        <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">

          {/* Title */}
          <div className="border-b border-slate-200 pb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-8 bg-red-600 inline-block" />
                <span className="text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Administration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Financial Help in Emergency</h1>
              <p className="text-slate-500 text-sm mt-1">
                {fetching ? "Loading…" : (
                  <>
                    <span className="font-bold text-slate-800">{filtered.length}</span> of{" "}
                    <span className="font-bold">{apps.length}</span> applications
                  </>
                )}
              </p>
            </div>
            <button
              onClick={fetchApps}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded shadow-sm hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${fetching ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAT_CARDS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`bg-white border border-slate-200 shadow-sm ${BORDER_COLOR[s]} border-l-4 p-4 text-left transition-all hover:shadow-md rounded ${statusFilter === s ? "ring-2 ring-red-600/20" : ""}`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{SM[s].label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{String(counts[s] || 0).padStart(2, "0")}</p>
              </button>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-4 space-y-3">
            {/* Row 1: search + status + category */}
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-48">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Search</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Name, mobile, category, village…"
                    className="w-full border border-slate-200 pl-9 pr-3 py-2 text-sm rounded focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="min-w-36">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-red-500"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(SM).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="min-w-44">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-red-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: date range + clear */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-red-500"
                />
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
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
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">volunteer_activism</span>
                <p className="font-bold text-slate-400">No applications match your filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-3 text-sm text-red-600 font-bold underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50">
                      {["#", "Applicant", "Category", "Requested", "Approved", "Status", "Date", "Action"].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((app, idx) => {
                      const sm = SM[app.status] || SM["PENDING"]
                      const canReview = app.status === "PENDING"
                      return (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-800 text-xs">{app.full_name}</p>
                            <p className="text-[10px] text-slate-400">{app.mobile ? `+91 ${app.mobile}` : ""}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-slate-600 max-w-[130px] leading-tight">{app.purpose_category || "—"}</p>
                            {app.documents && app.documents.length > 0 && (
                              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                                <span className="material-symbols-outlined text-[11px]">attach_file</span>
                                {app.documents.length} doc{app.documents.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-bold text-slate-700">
                            {app.amount_requested ? `₹${app.amount_requested.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-black text-gov-green">
                            {app.approved_amount ? `₹${app.approved_amount.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border w-fit ${sm.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} /> {sm.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {new Date(app.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => openModal(app)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${
                                canReview ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">{canReview ? "rate_review" : "open_in_new"}</span>
                              {canReview ? "Review" : "View"}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white rounded shadow-xl w-full max-w-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-red-700 px-6 py-5 flex items-center justify-between rounded-t">
              <div>
                <p className="text-white font-black">{selected.full_name}</p>
                <p className="text-red-200 text-[11px]">{selected.purpose_category || "Red Cross Aid"}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-red-200 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="h-0.5 flex">
              <div className="flex-1 bg-gov-saffron" /><div className="flex-1 bg-white border-y" /><div className="flex-1 bg-gov-green" />
            </div>

            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {[
                { label: "Mobile",           value: selected.mobile ? `+91 ${selected.mobile}` : null },
                { label: "Location",         value: [selected.village, selected.block, selected.district].filter(Boolean).join(", ") || null },
                { label: "Purpose",          value: selected.purpose },
                { label: "Requested Amount", value: selected.amount_requested ? `₹${selected.amount_requested.toLocaleString("en-IN")}` : null },
                { label: "Approved Amount",  value: selected.approved_amount ? `₹${selected.approved_amount.toLocaleString("en-IN")}` : null },
                { label: "Admin Remarks",    value: selected.admin_remarks || null },
                { label: "Submitted",        value: new Date(selected.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="px-6 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${f.label === "Approved Amount" ? "text-gov-green font-black" : "text-slate-800"}`}>
                    {f.value}
                  </p>
                </div>
              ))}

              {/* Bank Details */}
              {(selected.bank_account_no || selected.bank_name || selected.ifsc_code) && (
                <div className="px-6 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Details</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      { label: "Account No.",  value: selected.bank_account_no },
                      { label: "Bank Name",    value: selected.bank_name },
                      { label: "IFSC Code",    value: selected.ifsc_code },
                      { label: "Branch",       value: selected.bank_branch },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label}>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                        <p className="text-sm font-mono font-semibold text-slate-800">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Documents */}
              {selected.documents && selected.documents.length > 0 && (
                <div className="px-6 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Supporting Documents</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selected.documents.map((url, i) => {
                      const isImg = /\.(jpg|jpeg|png|webp)$/i.test(url)
                      return (
                        <button key={i} onClick={() => setPreview(url)}
                          className="group relative aspect-square rounded border border-slate-200 overflow-hidden bg-slate-50 hover:border-red-400 transition-all">
                          {isImg
                            ? <img src={url} alt="doc" className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-3xl text-slate-300 block my-3 mx-auto">picture_as_pdf</span>}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100">open_in_full</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Health / Medical Documents */}
              {selected.health_documents && selected.health_documents.length > 0 && (
                <div className="px-6 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Health / Medical Documents</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selected.health_documents.map((url, i) => {
                      const isImg = /\.(jpg|jpeg|png|webp)$/i.test(url)
                      return (
                        <button key={i} onClick={() => setPreview(url)}
                          className="group relative aspect-square rounded border border-slate-200 overflow-hidden bg-slate-50 hover:border-red-400 transition-all">
                          {isImg
                            ? <img src={url} alt="health doc" className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-3xl text-slate-300 block my-3 mx-auto">picture_as_pdf</span>}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100">open_in_full</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {selected.status === "PENDING" && (
              <div className="px-6 py-5 border-t border-slate-200 space-y-4">
                {revErr && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>{revErr}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAction("approve")}
                    className={`py-2.5 rounded font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${action === "approve" ? "bg-gov-green border-gov-green text-white" : "border-gov-green text-gov-green hover:bg-green-50"}`}>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Approve
                  </button>
                  <button onClick={() => setAction("reject")}
                    className={`py-2.5 rounded font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${action === "reject" ? "bg-red-600 border-red-600 text-white" : "border-red-400 text-red-600 hover:bg-red-50"}`}>
                    <span className="material-symbols-outlined text-[18px]">cancel</span> Reject
                  </button>
                </div>
                {action === "approve" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Approved Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="e.g. 10000"
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-green font-bold"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Remarks {action === "reject" && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows={2} value={remarks} onChange={e => setRemarks(e.target.value)}
                    placeholder={action === "approve" ? "Approval notes…" : "Reason for rejection (visible to citizen)…"}
                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-gov-navy resize-none"
                  />
                </div>
                {action && (
                  <button onClick={handleReview} disabled={saving}
                    className={`w-full font-black py-3 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${action === "approve" ? "bg-gov-green hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
                    {saving
                      ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Saving…</>
                      : <>Confirm {action === "approve" ? "Approval" : "Rejection"}</>}
                  </button>
                )}
              </div>
            )}

            {selected.status !== "PENDING" && (
              <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
                <button onClick={() => setSelected(null)} className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document preview overlay */}
      {preview && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-gov-navy px-4 py-3 rounded-t">
              <p className="text-white text-sm font-bold">Document Preview</p>
              <div className="flex gap-3">
                <a href={preview} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>Open
                </a>
                <a href={preview} download className="text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">download</span>Download
                </a>
                <button onClick={() => setPreview(null)} className="text-slate-300 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-b p-4 flex items-center justify-center min-h-[300px]">
              {/\.(jpg|jpeg|png|webp)$/i.test(preview)
                ? <img src={preview} alt="Preview" className="max-w-full max-h-[65vh] object-contain rounded" />
                : <iframe src={preview} className="w-full h-[65vh] rounded" title="Doc" />}
            </div>
          </div>
        </div>
      )}
    </div>
    </SidebarProvider>
  )
}
