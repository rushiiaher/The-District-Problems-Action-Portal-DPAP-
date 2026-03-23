"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
  Building2, PlusCircle, Edit, Power, Users, Loader2, RefreshCw, Search, Trash2,
  ChevronDown, ChevronRight, UserPlus, Eye, EyeOff
} from "lucide-react"
import { Fragment } from "react"

export default function DepartmentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editDept, setEditDept] = useState<any>(null)
  const [form, setForm] = useState({ name: "", code: "", description: "", sla_high: "24", sla_medium: "48", sla_low: "72" })
  const [saving, setSaving] = useState(false)
  const [deleteDept, setDeleteDept] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  // Officers per department
  const [expandedDept, setExpandedDept]           = useState<string | null>(null)
  const [deptOfficers, setDeptOfficers]           = useState<Record<string, any[]>>({})
  const [deptOfficerLoading, setDeptOfficerLoading] = useState<Record<string, boolean>>({})
  const [addOfficerDept, setAddOfficerDept]       = useState<string | null>(null)
  const [officerForm, setOfficerForm]             = useState({ name: "", username: "", password: "", designation: "", employee_id: "" })
  const [officerSaving, setOfficerSaving]         = useState(false)
  const [officerFormError, setOfficerFormError]   = useState("")
  const [officerShowPwd, setOfficerShowPwd]       = useState(false)

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
    setOpen(true)
  }

  const openEdit = (d: any) => {
    setEditDept(d)
    setForm({ name: d.name, code: d.code, description: d.description || "", sla_high: String(d.sla_high || 24), sla_medium: String(d.sla_medium || 48), sla_low: String(d.sla_low || 72) })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast({ title: "Name and code required", variant: "destructive" }); return }
    setSaving(true)
    try {
      const url = editDept ? `/api/departments/${editDept.id}` : "/api/departments"
      const method = editDept ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sla_high: Number(form.sla_high), sla_medium: Number(form.sla_medium), sla_low: Number(form.sla_low) }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: editDept ? "Department updated" : "Department created" })
        setOpen(false)
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
      const res = await fetch(`/api/departments/${deleteDept.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast({ title: `"${deleteDept.name}" deleted successfully` })
        setDeleteDept(null)
        fetchDepts()
      } else {
        toast({ title: data.error || "Delete failed", variant: "destructive" })
      }
    } catch { toast({ title: "Network error", variant: "destructive" }) }
    finally { setDeleting(false) }
  }

  const filtered = departments.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOfficers = async (deptId: string) => {
    if (expandedDept === deptId) { setExpandedDept(null); return }
    setExpandedDept(deptId)
    if (!deptOfficers[deptId]) {
      setDeptOfficerLoading(p => ({ ...p, [deptId]: true }))
      try {
        const res = await fetch(`/api/officers?department_id=${deptId}`)
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
      const res = await fetch("/api/officers", {
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

  if (isLoading || !user) return null

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 p-6 text-white overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-white">Departments</h1>
            <p className="text-slate-400 text-sm mt-1">{departments.filter(d => d.status === "active").length} active departments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={fetchDepts} className="border border-white/10 text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500" onClick={openCreate}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search departments..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5">Department</th>
                  <th className="text-left px-6 py-3.5">Code</th>
                  <th className="text-left px-6 py-3.5">SLA (H/M/L hrs)</th>
                  <th className="text-left px-6 py-3.5">Officers</th>
                  <th className="text-left px-6 py-3.5">Open</th>
                  <th className="text-left px-6 py-3.5">Status</th>
                  <th className="text-left px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fetching ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                      No departments found
                    </td>
                  </tr>
                ) : (
                  filtered.map(d => (
                    <Fragment key={d.id}>
                      <tr className="hover:bg-white/3 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{d.name}</div>
                          {d.description && <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]">{d.description}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs">{d.code}</code>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{d.sla_high}h / {d.sla_medium}h / {d.sla_low}h</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleOfficers(d.id)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{d.officer_count ?? 0}</span>
                            {expandedDept === d.id
                              ? <ChevronDown className="w-3 h-3" />
                              : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{d.open_count ?? 0}</td>
                        <td className="px-6 py-4">
                          <Badge className={d.status === "active" ? "status-resolved" : "status-auto_closed"}>
                            {d.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {/* Edit */}
                            <div className="relative group">
                              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-7 px-2" onClick={() => openEdit(d)}>
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">Edit Department</span>
                            </div>
                            {/* Toggle */}
                            <div className="relative group">
                              <Button size="sm" variant="ghost"
                                className={`h-7 px-2 ${d.status === "active" ? "text-amber-400 hover:text-amber-300" : "text-emerald-400 hover:text-emerald-300"}`}
                                onClick={() => toggleStatus(d)}>
                                <Power className="w-3.5 h-3.5" />
                              </Button>
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">
                                {d.status === "active" ? "Deactivate" : "Activate"}
                              </span>
                            </div>
                            {/* Delete */}
                            <div className="relative group">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setDeleteDept(d)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">Delete Department</span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable officers panel */}
                      {expandedDept === d.id && (
                        <tr>
                          <td colSpan={7} className="px-6 pb-5 pt-0 bg-slate-900/40 border-b border-white/5">
                            <div className="rounded-xl border border-white/10 overflow-hidden mt-1">
                              {/* Panel header */}
                              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm font-semibold text-white">Officers — {d.name}</span>
                                  {deptOfficers[d.id] && (
                                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                                      {deptOfficers[d.id].length}
                                    </span>
                                  )}
                                </div>
                                <Button size="sm"
                                  className="bg-blue-600 hover:bg-blue-500 h-7 text-xs gap-1.5"
                                  onClick={() => { setAddOfficerDept(addOfficerDept === d.id ? null : d.id); setOfficerFormError("") }}>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  Add Officer
                                </Button>
                              </div>

                              {/* Inline add officer form */}
                              {addOfficerDept === d.id && (
                                <div className="px-4 py-4 bg-slate-800/40 border-b border-white/10 space-y-3">
                                  {officerFormError && (
                                    <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{officerFormError}</p>
                                  )}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-slate-400 text-[10px] uppercase tracking-widest font-bold block mb-1">Full Name *</label>
                                      <Input className="bg-white/5 border-white/10 text-white h-8 text-sm"
                                        value={officerForm.name} onChange={e => setOf("name", e.target.value)} placeholder="e.g. Riyaz Ahmed" />
                                    </div>
                                    <div>
                                      <label className="text-slate-400 text-[10px] uppercase tracking-widest font-bold block mb-1">Username *</label>
                                      <Input className="bg-white/5 border-white/10 text-white h-8 text-sm font-mono"
                                        value={officerForm.username} onChange={e => setOf("username", e.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="e.g. riyaz.ahmed" />
                                    </div>
                                    <div>
                                      <label className="text-slate-400 text-[10px] uppercase tracking-widest font-bold block mb-1">Password *</label>
                                      <div className="relative">
                                        <Input type={officerShowPwd ? "text" : "password"}
                                          className="bg-white/5 border-white/10 text-white h-8 text-sm pr-8"
                                          value={officerForm.password} onChange={e => setOf("password", e.target.value)} placeholder="Min. 6 chars" />
                                        <button type="button" onClick={() => setOfficerShowPwd(p => !p)}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                          {officerShowPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-slate-400 text-[10px] uppercase tracking-widest font-bold block mb-1">Designation</label>
                                      <Input className="bg-white/5 border-white/10 text-white h-8 text-sm"
                                        value={officerForm.designation} onChange={e => setOf("designation", e.target.value)} placeholder="SDO, JE, Inspector…" />
                                    </div>
                                    <div>
                                      <label className="text-slate-400 text-[10px] uppercase tracking-widest font-bold block mb-1">Employee ID</label>
                                      <Input className="bg-white/5 border-white/10 text-white h-8 text-sm font-mono"
                                        value={officerForm.employee_id} onChange={e => setOf("employee_id", e.target.value)} placeholder="JK-2024-1234" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs gap-1.5" onClick={() => handleAddOfficer(d.id)} disabled={officerSaving}>
                                      {officerSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                                      {officerSaving ? "Adding…" : "Add Officer"}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-slate-400 text-xs" onClick={() => { setAddOfficerDept(null); setOfficerFormError("") }}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Officers list */}
                              {deptOfficerLoading[d.id] ? (
                                <div className="px-4 py-6 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />Loading officers…
                                </div>
                              ) : !deptOfficers[d.id] || deptOfficers[d.id].length === 0 ? (
                                <div className="px-4 py-6 text-center text-slate-600 text-sm">
                                  No officers assigned yet. Click "Add Officer" to assign one.
                                </div>
                              ) : (
                                <div className="divide-y divide-white/5">
                                  {deptOfficers[d.id].map(o => (
                                    <div key={o.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/3 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                                          {(o.name?.[0] || "O").toUpperCase()}
                                        </div>
                                        <div>
                                          <p className="text-white text-sm font-medium">{o.name}</p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-slate-500 text-[10px] font-mono">@{o.username}</span>
                                            {o.designation && <span className="text-slate-500 text-[10px]">{o.designation}</span>}
                                            {o.employee_id && <span className="text-slate-600 text-[10px] font-mono">#{o.employee_id}</span>}
                                          </div>
                                        </div>
                                      </div>
                                      {o.open_count > 0 && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.open_count > 5 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
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

        {/* Create/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-['Outfit']">{editDept ? "Edit Department" : "Create Department"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-400 text-xs mb-1.5 block">Department Name *</Label>
                  <Input className="bg-white/5 border-white/10 text-white" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1.5 block">Code *</Label>
                  <Input className="bg-white/5 border-white/10 text-white" placeholder="PWD" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Description</Label>
                <Textarea className="bg-white/5 border-white/10 text-white resize-none h-20" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <Label className="text-slate-400 text-xs mb-2 block">SLA Resolution Deadlines (hours)</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { label: "High Priority", key: "sla_high", placeholder: "24" },
                    { label: "Medium", key: "sla_medium", placeholder: "48" },
                    { label: "Low", key: "sla_low", placeholder: "72" },
                  ].map(s => (
                    <div key={s.key}>
                      <Label className="text-slate-500 text-[10px] mb-1 block">{s.label}</Label>
                      <Input
                        type="number"
                        placeholder={s.placeholder}
                        className="bg-white/5 border-white/10 text-white text-sm"
                        value={(form as any)[s.key]}
                        onChange={e => setForm(p => ({ ...p, [s.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editDept ? "Update" : "Create Department"}
                </Button>
                <Button variant="ghost" className="text-slate-400" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        {deleteDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Delete Department</h3>
                  <p className="text-slate-400 text-xs mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">&ldquo;{deleteDept.name}&rdquo;</span>?
                All associated officers will become unassigned.
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-1.5" />Delete</>}
                </Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setDeleteDept(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
