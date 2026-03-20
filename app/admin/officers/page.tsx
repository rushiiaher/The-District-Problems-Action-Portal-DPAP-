"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Users, PlusCircle, Loader2, Search, RefreshCw, Building2 } from "lucide-react"

export default function OfficersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [officers, setOfficers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", username: "", password: "", designation: "", employee_id: "", department_id: "" })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  const fetchData = async () => {
    setFetching(true)
    try {
      const [oRes, dRes] = await Promise.all([fetch("/api/officers"), fetch("/api/departments?status=active")])
      const [oData, dData] = await Promise.all([oRes.json(), dRes.json()])
      if (oData.officers) setOfficers(oData.officers)
      if (dData.departments) setDepartments(dData.departments)
    } catch { /* ignore */ }
    finally { setFetching(false) }
  }

  useEffect(() => { if (user) fetchData() }, [user])

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.password || !form.department_id) {
      toast({ title: "Fill all required fields", variant: "destructive" }); return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "officer" }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Officer created successfully" })
        setOpen(false)
        fetchData()
        setForm({ name: "", username: "", password: "", designation: "", employee_id: "", department_id: "" })
      } else {
        toast({ title: data.error, variant: "destructive" })
      }
    } catch { toast({ title: "Network error", variant: "destructive" }) }
    finally { setSaving(false) }
  }

  const filtered = officers.filter(o => !search || o.name?.toLowerCase().includes(search.toLowerCase()) || o.username?.toLowerCase().includes(search.toLowerCase()))
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || "—"

  if (isLoading || !user) return null

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 p-6 text-white overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-white">Officers</h1>
            <p className="text-slate-400 text-sm mt-1">{officers.length} officers across all departments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={fetchData} className="border border-white/10 text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => setOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />Add Officer
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search officers..." className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5">Name</th>
                  <th className="text-left px-6 py-3.5">Username</th>
                  <th className="text-left px-6 py-3.5">Designation</th>
                  <th className="text-left px-6 py-3.5">Department</th>
                  <th className="text-left px-6 py-3.5">Open Complaints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fetching ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500"><Users className="w-10 h-10 mx-auto mb-3 text-slate-700" />No officers found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4"><div className="text-white font-medium">{o.name}</div></td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{o.username}</td>
                    <td className="px-6 py-4 text-slate-400">{o.designation || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-400"><Building2 className="w-3.5 h-3.5" />{getDeptName(o.department_id)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={o.open_count > 5 ? "status-escalated" : "status-assigned"}>{o.open_count} open</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
            <DialogHeader><DialogTitle className="font-['Outfit']">Add New Officer</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-slate-400 text-xs mb-1.5 block">Full Name *</Label><Input className="bg-white/5 border-white/10 text-white" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label className="text-slate-400 text-xs mb-1.5 block">Username *</Label><Input className="bg-white/5 border-white/10 text-white" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
              </div>
              <div><Label className="text-slate-400 text-xs mb-1.5 block">Password *</Label><Input type="password" className="bg-white/5 border-white/10 text-white" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-slate-400 text-xs mb-1.5 block">Designation</Label><Input className="bg-white/5 border-white/10 text-white" placeholder="SDO, JE, etc." value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} /></div>
                <div><Label className="text-slate-400 text-xs mb-1.5 block">Employee ID</Label><Input className="bg-white/5 border-white/10 text-white" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))} /></div>
              </div>
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Department *</Label>
                <Select onValueChange={v => setForm(p => ({ ...p, department_id: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {departments.map(d => <SelectItem key={d.id} value={d.id} className="text-slate-200 focus:bg-blue-500/20">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Officer"}
                </Button>
                <Button variant="ghost" className="text-slate-400" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
