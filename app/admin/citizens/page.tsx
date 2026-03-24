"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DISTRICTS, getBlocks } from "@/lib/location-data"

type Citizen = {
  id: string
  name: string
  mobile: string
  alt_mobile?: string
  email?: string
  gender?: string
  address?: string
  district?: string
  block?: string
  village?: string
  complaints_filed: number
  created_at: string
}

type ArziRecord = {
  id: string
  category: string
  status: string
  created_at: string
  block: string
  village: string
  description: string
}

type RedCrossRecord = {
  id: string
  purpose_category: string
  purpose: string
  amount_requested: string
  approved_amount: string
  status: string
  created_at: string
}

const ARZI_STATUS: Record<string, { label: string; cls: string }> = {
  SUBMITTED:   { label: "Unassigned",  cls: "bg-amber-100 text-amber-800 border-amber-200" },
  REASSIGNED:  { label: "Returned",    cls: "bg-orange-100 text-orange-800 border-orange-200" },
  ASSIGNED:    { label: "Assigned",    cls: "bg-blue-100 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  RESOLVED:    { label: "Resolved",    cls: "bg-green-100 text-green-700 border-green-200" },
  CLOSED:      { label: "Closed",      cls: "bg-slate-100 text-slate-600 border-slate-200" },
  REJECTED:    { label: "Rejected",    cls: "bg-red-100 text-red-700 border-red-200" },
  ESCALATED:   { label: "Escalated",   cls: "bg-purple-100 text-purple-700 border-purple-200" },
}

const RC_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:      { label: "Pending",      cls: "bg-amber-100 text-amber-800 border-amber-200" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  APPROVED:     { label: "Approved",     cls: "bg-green-100 text-green-700 border-green-200" },
  REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700 border-red-200" },
  PAID:         { label: "Paid",         cls: "bg-blue-100 text-blue-700 border-blue-200" },
}

type Tab = "profile" | "arzis" | "redcross"

export default function AdminCitizensPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [total, setTotal]       = useState(0)
  const [pages, setPages]       = useState(1)
  const [page, setPage]         = useState(1)
  const [fetching, setFetching] = useState(false)
  const [selected, setSelected] = useState<Citizen | null>(null)

  // Filters
  const [q, setQ]               = useState("")
  const [district, setDistrict] = useState("")
  const [block, setBlock]       = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")

  // Detail modal state
  const [activeTab, setActiveTab]           = useState<Tab>("profile")
  const [citizenArzis, setCitizenArzis]     = useState<ArziRecord[]>([])
  const [citizenRC, setCitizenRC]           = useState<RedCrossRecord[]>([])
  const [loadingDetail, setLoadingDetail]   = useState(false)

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || !["superadmin", "subadmin"].includes(user.role))) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(t)
  }, [q])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [debouncedQ, district, block])

  // Fetch citizens list
  const fetchCitizens = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(debouncedQ && { q: debouncedQ }),
        ...(district  && { district }),
        ...(block     && { block }),
      })
      const res = await fetch(`/api/admin/citizens?${params}`, {
        headers: { "x-user-id": user.id, "x-user-role": user.role },
      })
      const data = await res.json()
      if (data.success) {
        setCitizens(data.citizens)
        setTotal(data.total)
        setPages(data.pages)
      }
    } finally { setFetching(false) }
  }, [user, page, debouncedQ, district, block])

  useEffect(() => { fetchCitizens() }, [fetchCitizens])

  // Open citizen detail — fetch arzis + red cross in parallel
  const openCitizen = async (c: Citizen) => {
    setSelected(c)
    setActiveTab("profile")
    setCitizenArzis([])
    setCitizenRC([])
    setLoadingDetail(true)
    try {
      const [compRes, rcRes] = await Promise.all([
        fetch("/api/complaints?citizen=true", {
          headers: { "x-user-id": c.id, "x-user-role": "superadmin" },
        }),
        fetch("/api/red-cross", {
          headers: { "x-user-id": user!.id, "x-user-role": "superadmin" },
        }),
      ])
      const [compData, rcData] = await Promise.all([compRes.json(), rcRes.json()])
      setCitizenArzis(compData.complaints || [])
      setCitizenRC((rcData.applications || []).filter((a: any) => a.citizen_id === c.id))
    } catch { /* silent */ }
    finally { setLoadingDetail(false) }
  }

  const closeModal = () => setSelected(null)

  const blocks = district ? getBlocks(district) : []

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Administration · Citizens Registry
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            {total} Registered Citizens
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto space-y-6">

          {/* Title */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-gov-saffron inline-block" />
              <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Administration</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Citizens Registry</h1>
            <p className="text-slate-500 text-sm mt-1">Search and view registered citizen profiles</p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Registered", value: total,                                                 icon: "group",       color: "border-l-gov-navy" },
              { label: "Filed Arzis",      value: citizens.filter(c => c.complaints_filed > 0).length,  icon: "description", color: "border-l-gov-saffron" },
              { label: "No Arzis Yet",     value: citizens.filter(c => c.complaints_filed === 0).length, icon: "inbox",      color: "border-l-slate-300" },
            ].map(s => (
              <div key={s.label} className={`gov-card border-l-4 ${s.color} p-5 flex items-center gap-4`}>
                <span className="material-symbols-outlined text-slate-300 text-4xl">{s.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900">{String(s.value).padStart(2, "0")}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded shadow-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text" value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Search by name, mobile, email, village…"
                  className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400"
                />
              </div>
              <select value={district} onChange={e => { setDistrict(e.target.value); setBlock("") }}
                className="border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-700 bg-white">
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={block} onChange={e => setBlock(e.target.value)} disabled={!district}
                className="border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-700 bg-white disabled:bg-slate-50 disabled:text-slate-400">
                <option value="">{!district ? "Select district first" : "All Blocks"}</option>
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {(debouncedQ || district || block) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active filters:</span>
                {debouncedQ && <FilterTag label={`"${debouncedQ}"`} onRemove={() => setQ("")} />}
                {district   && <FilterTag label={district} onRemove={() => { setDistrict(""); setBlock("") }} />}
                {block      && <FilterTag label={block} onRemove={() => setBlock("")} />}
                <button onClick={() => { setQ(""); setDistrict(""); setBlock("") }}
                  className="text-[10px] text-red-500 font-bold hover:underline ml-2">Clear all</button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {fetching ? "Loading…" : `Showing ${citizens.length} of ${total}`}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                Page {page} / {pages || 1}
              </div>
            </div>

            {fetching ? (
              <div className="p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-3 animate-spin">progress_activity</span>
                Searching citizens…
              </div>
            ) : citizens.length === 0 ? (
              <div className="p-16 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">person_search</span>
                <p className="font-bold text-slate-400">No citizens found</p>
                <p className="text-sm text-slate-300 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50">
                      <th className="px-5 py-3 text-left font-bold">#</th>
                      <th className="px-5 py-3 text-left font-bold">Name</th>
                      <th className="px-5 py-3 text-left font-bold">Mobile</th>
                      <th className="px-5 py-3 text-left font-bold">Location</th>
                      <th className="px-5 py-3 text-left font-bold">Arzis</th>
                      <th className="px-5 py-3 text-left font-bold">Registered</th>
                      <th className="px-5 py-3 text-left font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {citizens.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">
                          {(page - 1) * 25 + idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gov-navy/10 border border-gov-navy/20 flex items-center justify-center text-gov-navy font-black text-sm flex-shrink-0">
                              {(c.name || c.mobile || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">{c.name || "—"}</p>
                              {c.gender && <p className="text-[10px] text-slate-400">{c.gender}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono font-bold text-slate-800 text-xs">+91 {c.mobile}</p>
                          {c.email && <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{c.email}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-slate-700 text-xs">{[c.village, c.block, c.district].filter(Boolean).join(", ") || "—"}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {c.complaints_filed > 0 ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-gov-navy/10 text-gov-navy border-gov-navy/20">
                                {c.complaints_filed}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">filed</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-medium">None</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => openCitizen(c)}
                            className="flex items-center gap-1.5 bg-gov-navy text-white text-[11px] font-bold px-3 py-1.5 rounded hover:bg-[#001a40] transition-colors">
                            <span className="material-symbols-outlined text-[14px]">person_search</span>
                            View Full Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="text-xs font-bold text-slate-600 hover:text-gov-navy disabled:opacity-40 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span> Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = page <= 4 ? i + 1 : i + page - 3
                    if (p < 1 || p > pages) return null
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 text-xs font-bold rounded transition-all ${p === page ? "bg-gov-navy text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                        {p}
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                  className="text-xs font-bold text-slate-600 hover:text-gov-navy disabled:opacity-40 flex items-center gap-1">
                  Next <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Citizen Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gov-navy px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gov-saffron flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {(selected.name || selected.mobile || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-black text-base leading-tight">{selected.name || "Unknown"}</p>
                  <p className="text-slate-400 text-[11px]">+91 {selected.mobile} · Citizen ID: <span className="font-mono">{selected.id.slice(0, 8)}…</span></p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tricolor accent */}
            <div className="h-0.5 flex flex-shrink-0">
              <div className="flex-1 bg-gov-saffron" />
              <div className="flex-1 bg-white border-y border-slate-100" />
              <div className="flex-1 bg-gov-green" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
              {([
                { id: "profile",  label: "Profile",     icon: "person" },
                { id: "arzis",    label: `Arzis (${citizenArzis.length})`,       icon: "description" },
                { id: "redcross", label: `Red Cross (${citizenRC.length})`,       icon: "favorite" },
              ] as { id: Tab; label: string; icon: string }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
                    activeTab === t.id
                      ? "border-gov-navy text-gov-navy bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">

              {loadingDetail ? (
                <div className="p-12 text-center text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>
                  Loading citizen data…
                </div>
              ) : (

                <>
                  {/* ── PROFILE TAB ── */}
                  {activeTab === "profile" && (
                    <div className="divide-y divide-slate-100">
                      {[
                        { icon: "phone_iphone",   label: "Mobile",      value: `+91 ${selected.mobile}` },
                        { icon: "call",            label: "Alt. Mobile", value: selected.alt_mobile ? `+91 ${selected.alt_mobile}` : null },
                        { icon: "mail",            label: "Email",       value: selected.email || null },
                        { icon: "person",          label: "Gender",      value: selected.gender || null },
                        { icon: "home",            label: "Address",     value: selected.address || null },
                        { icon: "location_city",   label: "District",    value: selected.district || null },
                        { icon: "map",             label: "Block",       value: selected.block || null },
                        { icon: "villa",           label: "Village",     value: selected.village || null },
                        { icon: "calendar_today",  label: "Registered",  value: new Date(selected.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) },
                        { icon: "description",     label: "Arzis Filed", value: `${selected.complaints_filed} arzi${selected.complaints_filed !== 1 ? "s" : ""} filed` },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label} className="px-6 py-3.5 flex items-start gap-3">
                          <span className="material-symbols-outlined text-slate-300 text-[18px] mt-0.5 flex-shrink-0">{f.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                            <p className="text-sm font-semibold text-slate-800 break-words">{f.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── ARZIS TAB ── */}
                  {activeTab === "arzis" && (
                    citizenArzis.length === 0 ? (
                      <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">inbox</span>
                        <p className="font-bold text-slate-400">No Arzis filed yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {citizenArzis.map(a => {
                          const sm = ARZI_STATUS[a.status] || ARZI_STATUS["SUBMITTED"]
                          return (
                            <div key={a.id} className="px-6 py-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                  <p className="font-mono text-[11px] font-bold text-gov-navy">{a.id}</p>
                                  <p className="font-bold text-slate-800 text-sm mt-0.5">{a.category}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{a.village}, {a.block}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sm.cls}`}>{sm.label}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(a.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                </div>
                              </div>
                              {a.description && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded px-3 py-2 line-clamp-2">{a.description}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  )}

                  {/* ── RED CROSS TAB ── */}
                  {activeTab === "redcross" && (
                    citizenRC.length === 0 ? (
                      <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">favorite</span>
                        <p className="font-bold text-slate-400">No Red Cross applications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {citizenRC.map(r => {
                          const sm = RC_STATUS[r.status] || RC_STATUS["PENDING"]
                          return (
                            <div key={r.id} className="px-6 py-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                  <p className="font-mono text-[11px] font-bold text-red-700">{r.id}</p>
                                  <p className="font-bold text-slate-800 text-sm mt-0.5">{r.purpose_category || "Emergency Aid"}</p>
                                  {r.amount_requested && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Requested: <span className="font-bold text-slate-700">₹{Number(r.amount_requested).toLocaleString("en-IN")}</span>
                                      {r.approved_amount && (
                                        <> · Approved: <span className="font-bold text-green-700">₹{Number(r.approved_amount).toLocaleString("en-IN")}</span></>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sm.cls}`}>{sm.label}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                </div>
                              </div>
                              {r.purpose && (
                                <p className="text-xs text-slate-500 bg-red-50 border border-red-100 rounded px-3 py-2 line-clamp-2">{r.purpose}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                {citizenArzis.length} Arzis · {citizenRC.length} Red Cross Applications
              </p>
              <button onClick={closeModal}
                className="px-5 py-2 bg-gov-navy text-white text-xs font-bold rounded hover:bg-[#001a40] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 bg-gov-navy/10 text-gov-navy text-[10px] font-bold px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">
        <span className="material-symbols-outlined text-[12px]">close</span>
      </button>
    </span>
  )
}
