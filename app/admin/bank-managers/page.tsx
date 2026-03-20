"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

type BankManager = {
  id: string
  name: string
  username: string
  designation?: string
  created_at: string
}

export default function BankManagersAdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [managers, setManagers]   = useState<BankManager[]>([])
  const [fetching, setFetching]   = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [confirmDel, setConfirmDel] = useState<BankManager | null>(null)
  const [deleting, setDeleting]   = useState<string | null>(null)

  const [form, setForm] = useState({ name: "", username: "", password: "", designation: "" })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")
  const [showPwd, setShowPwd]     = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/auth/login")
  }, [user, isLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setFetching(true)
    const res = await fetch("/api/admin/subadmins?role=bank_manager", {
      headers: { "x-user-id": user.id, "x-user-role": user.role },
    })
    const data = await res.json()
    if (data.staff) setManagers(data.staff)
    setFetching(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const set = (f: string, v: string) => { setForm(p => ({ ...p, [f]: v })); setFormError("") }

  const handleCreate = async () => {
    setSaving(true); setFormError("")
    try {
      const res = await fetch("/api/admin/subadmins", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
        body: JSON.stringify({ ...form, role: "bank_manager" }),
      })
      const data = await res.json()
      if (!data.success) { setFormError(data.error); return }
      setManagers(p => [data.staff, ...p])
      setForm({ name: "", username: "", password: "", designation: "" })
      setShowForm(false)
    } catch { setFormError("Network error. Please try again.") }
    finally { setSaving(false) }
  }

  const handleDelete = async (member: BankManager) => {
    setDeleting(member.id)
    try {
      const res = await fetch(`/api/admin/subadmins?id=${member.id}`, {
        method: "DELETE",
        headers: { "x-user-id": user!.id, "x-user-role": user!.role },
      })
      const data = await res.json()
      if (data.success) setManagers(p => p.filter(x => x.id !== member.id))
    } finally { setDeleting(null); setConfirmDel(null) }
  }

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Administration · Bank Managers</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-saffron animate-pulse" />
            {managers.length} Bank Manager{managers.length !== 1 ? "s" : ""}
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="border-b border-slate-200 pb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Administration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bank Managers</h1>
              <p className="text-slate-500 text-sm mt-1">Manage bank officers responsible for processing Red Cross aid payments</p>
            </div>
            <button onClick={() => { setShowForm(true); setFormError("") }}
              className="flex items-center gap-2 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black text-sm px-5 py-2.5 rounded shadow transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Bank Manager
            </button>
          </div>

          {/* Login info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[18px] flex-shrink-0 mt-0.5">account_balance</span>
            <div>
              <p className="font-bold text-amber-800 text-sm mb-0.5">Bank Manager Login</p>
              <p className="text-[12px] text-amber-700">
                Bank managers log in via the{" "}
                <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded">Staff Login</span>
                {" "}tab at{" "}
                <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded">/auth/login</span>
                {" "}and are automatically redirected to{" "}
                <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded">/bank/dashboard</span>
                {" "}where they can process Red Cross aid payments.
              </p>
            </div>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[20px]">account_balance</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">New Bank Manager Account</h2>
                </div>
                <button onClick={() => { setShowForm(false); setFormError("") }}
                  className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                    <span className="material-symbols-outlined text-[18px]">error</span> {formError}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder="e.g. Gh. Mohiuddin Rather" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.username}
                      onChange={e => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                      placeholder="e.g. gm.rather" className={`${inputCls} font-mono`} />
                    <p className="text-[10px] text-slate-400 mt-1">Used to log in at /auth/login (Staff tab)</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input type={showPwd ? "text" : "password"} value={form.password}
                        onChange={e => set("password", e.target.value)}
                        placeholder="Min. 6 characters" className={`${inputCls} pr-10`} />
                      <button type="button" onClick={() => setShowPwd(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-[18px]">{showPwd ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Designation <span className="text-slate-300 font-normal">(Optional)</span>
                    </label>
                    <input type="text" value={form.designation} onChange={e => set("designation", e.target.value)}
                      placeholder="Bank Manager / Treasury Officer" className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleCreate} disabled={saving}
                    className="flex-1 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-3 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow">
                    {saving
                      ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Creating…</>
                      : <><span className="material-symbols-outlined text-[18px]">add_circle</span> Create Bank Manager</>}
                  </button>
                  <button onClick={() => { setShowForm(false); setFormError("") }}
                    className="px-6 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {fetching ? "Loading…" : `${managers.length} Bank Manager${managers.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {fetching ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>Loading…
              </div>
            ) : managers.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">account_balance</span>
                <p className="font-bold text-slate-400">No bank managers yet</p>
                <p className="text-sm text-slate-300 mt-1">Click "Add Bank Manager" to create one</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {managers.map(m => (
                  <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-l-4 border-l-gov-saffron">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-gov-saffron font-black text-sm">
                        {(m.name?.[0] || 'B').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">@{m.username}</span>
                          {m.designation && <span className="text-[10px] text-slate-500">{m.designation}</span>}
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                            Bank Manager
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Added {new Date(m.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setConfirmDel(m)} title="Remove"
                      className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-50">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
              <div>
                <p className="font-black text-slate-900">Remove Bank Manager?</p>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-5">
              <p className="text-sm font-bold text-slate-800">{confirmDel.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">@{confirmDel.username}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDel)} disabled={deleting === confirmDel.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting === confirmDel.id
                  ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Removing…</>
                  : "Yes, Remove"}
              </button>
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = "w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800"
