"use client"

import { useEffect, useState, Fragment } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { useToast } from "@/components/ui/use-toast"

export default function DepartmentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [departments, setDepartments] = useState<any[]>([])
  const [fetching, setFetching]       = useState(true)
  const [search, setSearch]           = useState("")

  // Create / Edit
  const [showForm, setShowForm]   = useState(false)
  const [editDept, setEditDept]   = useState<any>(null)
  const [form, setForm]           = useState({ name: "", code: "", description: "", sla_high: "24", sla_medium: "48", sla_low: "72" })
  const [saving, setSaving]       = useState(false)

  // Delete
  const [deleteDept, setDeleteDept] = useState<any>(null)
  const [deleting, setDeleting]     = useState(false)

  // Officers per department (expandable)
  const [expandedDept, setExpandedDept]             = useState<string | null>(null)
  const [deptOfficers, setDeptOfficers]             = useState<Record<string, any[]>>({})
  const [deptOfficerLoading, setDeptOfficerLoading] = useState<Record<string, boolean>>({})
  const [addOfficerDept, setAddOfficerDept]         = useState<string | null>(null)
  const [officerForm, setOfficerForm]               = useState({ name: "", username: "", password: "", designation: "", employee_id: "" })
  const [officerSaving, setOfficerSaving]           = useState(false)
  const [officerFormError, setOfficerFormError]     = useState("")
  const [officerShowPwd, setOfficerShowPwd]         = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  const fetchDepts = async () => {
    setFetching(true)
    try {
      const res = await fetch("/api/departments")
      const data = await res.json()
      if (data.departments) setDepartments(data.departments)
    } catch { /* ignore */ }
    finally { setFetching(false) }
  }

  useEffect(() => { if (user) fetchDepts() }, [user])

  const openCreate = () => {
    setEditDept(null)
    setForm({ name: "", code: "", description: "", sla_high: "24", sla_medium: "48", sla_low: "72" })
    setShowForm(true)
  }

  const openEdit = (d: any) => {
    setEditDept(d)
    setForm({ name: d.name, code: d.code, description: d.description || "", sla_high: String(d.sla_high || 24), sla_medium: String(d.sla_medium || 48), sla_low: String(d.sla_low || 72) })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast({ title: "Name and code required", variant: "destructive" }); return }
    setSaving(true)
    try {
      const url    = editDept ? `/api/departments/${editDept.id}` : "/api/departments"
      const method = editDept ? "PUT" : "POST"
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sla_high: Number(form.sla_high), sla_medium: Number(form.sla_medium), sla_low: Number(form.sla_low) }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: editDept ? "Department updated" : "Department created" })
        setShowForm(false)
        fetchDepts()
      } else {
        toast({ title: data.error, variant: "destructive" })
      }
    } catch { toast({ title: "Network error", variant: "destructive" }) }
    finally { setSaving(false) }
  }

  const toggleStatus = async (d: any) => {
    try {
      const res = await fetch(`/api/departments/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: d.status === "active" ? "inactive" : "active" }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: `Department ${d.status === "active" ? "deactivated" : "activated"}` })
        fetchDepts()
      }
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    if (!deleteDept) return
    setDeleting(true)
    try {
      const res  = await fetch(`/api/departments/${deleteDept.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast({ title: `"${deleteDept.name}" deleted` })
        setDeleteDept(null)
        fetchDepts()
      } else {
        toast({ title: data.error || "Delete failed", variant: "destructive" })
      }
    } catch { toast({ title: "Network error", variant: "destructive" }) }
    finally { setDeleting(false) }
  }

  const toggleOfficers = async (deptId: string) => {
    if (expandedDept === deptId) { setExpandedDept(null); return }
    setExpandedDept(deptId)
    if (!deptOfficers[deptId]) {
      setDeptOfficerLoading(p => ({ ...p, [deptId]: true }))
      try {
        const res  = await fetch(`/api/officers?department_id=${deptId}`)
        const data = await res.json()
        setDeptOfficers(p => ({ ...p, [deptId]: data.officers || [] }))
      } catch { /* ignore */ }
      finally { setDeptOfficerLoading(p => ({ ...p, [deptId]: false })) }
    }
  }

  const setOf = (f: string, v: string) => { setOfficerForm(p => ({ ...p, [f]: v })); setOfficerFormError("") }

  const handleAddOfficer = async (deptId: string) => {
    if (!officerForm.name || !officerForm.username || !officerForm.password) {
      setOfficerFormError("Name, username and password are required"); return
    }
    setOfficerSaving(true); setOfficerFormError("")
    try {
      const res  = await fetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
        body: JSON.stringify({ ...officerForm, department_id: deptId }),
      })
      const data = await res.json()
      if (!data.success) { setOfficerFormError(data.error); return }
      setDeptOfficers(p => ({ ...p, [deptId]: [{ ...data.officer, open_count: 0 }, ...(p[deptId] || [])] }))
      setDepartments(p => p.map(d => d.id === deptId ? { ...d, officer_count: (d.officer_count || 0) + 1 } : d))
      setOfficerForm({ name: "", username: "", password: "", designation: "", employee_id: "" })
      setAddOfficerDept(null)
      toast({ title: "Officer added successfully" })
    } catch { setOfficerFormError("Network error") }
    finally { setOfficerSaving(false) }
  }

  const filtered = departments.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">

        {/* Gov-navy header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Administration · Departments</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-saffron animate-pulse" />
            {departments.filter(d => d.status === "active").length} Active
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-6">

          {/* Title row */}
          <div className="border-b border-slate-200 pb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Administration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Departments</h1>
              <p className="text-slate-500 text-sm mt-1">Manage departments, SLA deadlines and their field officers</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchDepts}
                className="p-2.5 border border-slate-200 rounded text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
              <button onClick={openCreate}
                className="flex items-center gap-2 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black text-sm px-5 py-2.5 rounded shadow transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Department
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              placeholder="Search by name or code…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-gov-navy text-slate-800 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3.5">Department</th>
                    <th className="text-left px-6 py-3.5">Code</th>
                    <th className="text-left px-6 py-3.5">SLA (H / M / L)</th>
                    <th className="text-left px-6 py-3.5">Officers</th>
                    <th className="text-left px-6 py-3.5">Open</th>
                    <th className="text-left px-6 py-3.5">Status</th>
                    <th className="text-left px-6 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fetching ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">account_balance</span>
                        <p className="font-bold text-slate-400">No departments found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(d => (
                      <Fragment key={d.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">{d.name}</div>
                            {d.description && <div className="text-slate-400 text-xs mt-0.5 truncate max-w-[220px]">{d.description}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-gov-navy bg-gov-navy/8 px-2 py-0.5 rounded text-xs font-bold border border-gov-navy/15">{d.code}</code>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                            {d.sla_high}h&nbsp;/&nbsp;{d.sla_medium}h&nbsp;/&nbsp;{d.sla_low}h
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleOfficers(d.id)}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-gov-navy transition-colors font-medium">
                              <span className="material-symbols-outlined text-[16px]">badge</span>
                              <span>{d.officer_count ?? 0}</span>
                              <span className="material-symbols-outlined text-[14px]">
                                {expandedDept === d.id ? "expand_less" : "expand_more"}
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{d.open_count ?? 0}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${d.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                              {d.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {/* Edit */}
                              <div className="relative group">
                                <button onClick={() => openEdit(d)}
                                  className="p-1.5 text-slate-400 hover:text-gov-navy hover:bg-slate-100 rounded transition-colors">
                                  <span className="material-symbols-outlined text-[17px]">edit</span>
                                </button>
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">Edit</span>
                              </div>
                              {/* Toggle active/inactive */}
                              <div className="relative group">
                                <button onClick={() => toggleStatus(d)}
                                  className={`p-1.5 rounded transition-colors ${d.status === "active" ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                                  <span className="material-symbols-outlined text-[17px]">{d.status === "active" ? "pause_circle" : "play_circle"}</span>
                                </button>
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">
                                  {d.status === "active" ? "Deactivate" : "Activate"}
                                </span>
                              </div>
                              {/* Delete */}
                              <div className="relative group">
                                <button onClick={() => setDeleteDept(d)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                  <span className="material-symbols-outlined text-[17px]">delete</span>
                                </button>
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">Delete</span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable officers panel */}
                        {expandedDept === d.id && (
                          <tr>
                            <td colSpan={7} className="px-6 pb-5 pt-1 bg-slate-50 border-b border-slate-200">
                              <div className="rounded border border-slate-200 overflow-hidden bg-white shadow-sm">
                                {/* Panel header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gov-navy text-[18px]">badge</span>
                                    <span className="text-sm font-bold text-slate-700">Officers — {d.name}</span>
                                    {deptOfficers[d.id] && (
                                      <span className="text-[10px] bg-gov-navy/10 text-gov-navy px-2 py-0.5 rounded-full font-bold border border-gov-navy/20">
                                        {deptOfficers[d.id].length}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => { setAddOfficerDept(addOfficerDept === d.id ? null : d.id); setOfficerFormError("") }}
                                    className="flex items-center gap-1.5 bg-gov-saffron hover:bg-[#e68a2e] text-white font-bold text-xs px-3 py-1.5 rounded transition-colors">
                                    <span className="material-symbols-outlined text-[15px]">person_add</span>
                                    Add Officer
                                  </button>
                                </div>

                                {/* Inline add officer form */}
                                {addOfficerDept === d.id && (
                                  <div className="px-4 py-4 bg-amber-50/40 border-b border-amber-100 space-y-3">
                                    {officerFormError && (
                                      <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[14px]">error</span>{officerFormError}
                                      </p>
                                    )}
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Full Name *</label>
                                        <input className={iCls} value={officerForm.name} onChange={e => setOf("name", e.target.value)} placeholder="e.g. Riyaz Ahmed" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Username *</label>
                                        <input className={`${iCls} font-mono`} value={officerForm.username} onChange={e => setOf("username", e.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="e.g. riyaz.ahmed" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Password *</label>
                                        <div className="relative">
                                          <input type={officerShowPwd ? "text" : "password"} className={`${iCls} pr-8`}
                                            value={officerForm.password} onChange={e => setOf("password", e.target.value)} placeholder="Min. 6 chars" />
                                          <button type="button" onClick={() => setOfficerShowPwd(p => !p)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <span className="material-symbols-outlined text-[16px]">{officerShowPwd ? "visibility_off" : "visibility"}</span>
                                          </button>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Designation</label>
                                        <input className={iCls} value={officerForm.designation} onChange={e => setOf("designation", e.target.value)} placeholder="SDO, JE, Inspector…" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Employee ID</label>
                                        <input className={`${iCls} font-mono`} value={officerForm.employee_id} onChange={e => setOf("employee_id", e.target.value)} placeholder="JK-2024-1234" />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => handleAddOfficer(d.id)} disabled={officerSaving}
                                        className="flex items-center gap-1.5 bg-gov-saffron hover:bg-[#e68a2e] text-white font-bold text-xs px-4 py-2 rounded disabled:opacity-60 transition-colors">
                                        {officerSaving
                                          ? <><span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span> Adding…</>
                                          : <><span className="material-symbols-outlined text-[14px]">person_add</span> Add Officer</>}
                                      </button>
                                      <button onClick={() => { setAddOfficerDept(null); setOfficerFormError("") }}
                                        className="text-slate-500 hover:text-slate-700 text-xs font-bold px-3 py-2 border border-slate-200 rounded hover:bg-white transition-colors">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Officers list */}
                                {deptOfficerLoading[d.id] ? (
                                  <div className="px-4 py-6 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Loading officers…
                                  </div>
                                ) : !deptOfficers[d.id] || deptOfficers[d.id].length === 0 ? (
                                  <div className="px-4 py-6 text-center text-slate-400 text-sm">
                                    No officers assigned yet. Click "Add Officer" above to assign one.
                                  </div>
                                ) : (
                                  <div className="divide-y divide-slate-100">
                                    {deptOfficers[d.id].map(o => (
                                      <div key={o.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gov-navy/10 border border-gov-navy/20 flex items-center justify-center text-gov-navy font-bold text-xs flex-shrink-0">
                                            {(o.name?.[0] || "O").toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="text-slate-800 text-sm font-semibold">{o.name}</p>
                                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                              <span className="text-slate-400 text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">@{o.username}</span>
                                              {o.designation && <span className="text-slate-500 text-[10px]">{o.designation}</span>}
                                              {o.employee_id && <span className="text-slate-400 text-[10px] font-mono">#{o.employee_id}</span>}
                                            </div>
                                          </div>
                                        </div>
                                        {o.open_count > 0 && (
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.open_count > 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                                            {o.open_count} open
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !saving && setShowForm(false)}>
          <div className="bg-white rounded shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-gov-saffron text-3xl">account_balance</span>
              <div>
                <p className="font-black text-slate-900">{editDept ? "Edit Department" : "New Department"}</p>
                <p className="text-sm text-slate-500">{editDept ? "Update details below" : "Fill in the details to create"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-gov">Department Name <span className="text-red-500">*</span></label>
                  <input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Health Department" />
                </div>
                <div>
                  <label className="label-gov">Code <span className="text-red-500">*</span></label>
                  <input className={`${inputCls} font-mono uppercase`} placeholder="e.g. HME" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div>
                <label className="label-gov">Description <span className="text-slate-300 font-normal">(Optional)</span></label>
                <textarea rows={2} className={`${inputCls} resize-none`} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this department" />
              </div>
              <div>
                <label className="label-gov">SLA Deadlines (hours)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "High", key: "sla_high", placeholder: "24" },
                    { label: "Medium", key: "sla_medium", placeholder: "48" },
                    { label: "Low", key: "sla_low", placeholder: "72" },
                  ].map(s => (
                    <div key={s.key}>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">{s.label}</label>
                      <input type="number" placeholder={s.placeholder} className={inputCls}
                        value={(form as any)[s.key]}
                        onChange={e => setForm(p => ({ ...p, [s.key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving
                  ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Saving…</>
                  : <><span className="material-symbols-outlined text-[16px]">{editDept ? "save" : "add_circle"}</span> {editDept ? "Update" : "Create Department"}</>}
              </button>
              <button onClick={() => setShowForm(false)} disabled={saving}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50 disabled:opacity-60">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteDept(null)}>
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
              <div>
                <p className="font-black text-slate-900">Delete Department?</p>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-5">
              <p className="font-bold text-slate-800">{deleteDept.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{deleteDept.code}</p>
              {(deleteDept.officer_count > 0 || deleteDept.open_count > 0) && (
                <p className="text-xs text-amber-600 mt-1 font-bold">
                  {deleteDept.officer_count > 0 && `${deleteDept.officer_count} officer(s) will be unassigned`}
                  {deleteDept.officer_count > 0 && deleteDept.open_count > 0 && " · "}
                  {deleteDept.open_count > 0 && `${deleteDept.open_count} open complaint(s) affected`}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting
                  ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Deleting…</>
                  : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteDept(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = "w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800"
const iCls     = "w-full border border-slate-200 px-2.5 py-1.5 text-xs rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white"
