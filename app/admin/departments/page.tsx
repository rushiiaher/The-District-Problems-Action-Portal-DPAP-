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
  Building2, PlusCircle, Edit, Power, Users, Loader2, RefreshCw, Search, Trash2
} from "lucide-react"

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
                    <tr key={d.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{d.name}</div>
                        {d.description && <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]">{d.description}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs">{d.code}</code>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{d.sla_high}h / {d.sla_medium}h / {d.sla_low}h</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-400"><Users className="w-3.5 h-3.5" />{d.officer_count ?? 0}</span>
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
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">
                              Edit Department
                            </span>
                          </div>

                          {/* Toggle Active / Inactive */}
                          <div className="relative group">
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-7 px-2 ${d.status === "active" ? "text-amber-400 hover:text-amber-300" : "text-emerald-400 hover:text-emerald-300"}`}
                              onClick={() => toggleStatus(d)}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </Button>
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">
                              {d.status === "active" ? "Deactivate" : "Activate"}
                            </span>
                          </div>

                          {/* Delete */}
                          <div className="relative group">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => setDeleteDept(d)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow">
                              Delete Department
                            </span>
                          </div>

                        </div>
                      </td>
                    </tr>
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
              <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-3 gap-2">
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
