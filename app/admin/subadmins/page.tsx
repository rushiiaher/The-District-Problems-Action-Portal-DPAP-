"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

type SubAdmin = {
  id: string
  name: string
  username: string
  designation?: string
  department_id?: string
  department_name?: string
  created_at: string
}

type Dept = { id: string; name: string }

export default function SubAdminsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [subadmins, setSubadmins] = useState<SubAdmin[]>([])
  const [depts, setDepts]         = useState<Dept[]>([])
  const [fetching, setFetching]   = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [confirmDel, setConfirmDel] = useState<SubAdmin | null>(null)
  const [deleting, setDeleting]   = useState<string | null>(null)

  const [form, setForm] = useState({ name: "", username: "", password: "", designation: "", department_id: "" })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")
  const [showPwd, setShowPwd]     = useState(false)

  const [resetTarget, setResetTarget]   = useState<SubAdmin | null>(null)
  const [resetPwd, setResetPwd]         = useState("")
  const [resetSaving, setResetSaving]   = useState(false)
  const [resetError, setResetError]     = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetShowPwd, setResetShowPwd] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/auth/login")
  }, [user, isLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setFetching(true)
    const headers = { "x-user-id": user.id, "x-user-role": user.role }
    const [sRes, dRes] = await Promise.all([
      fetch("/api/admin/subadmins?role=subadmin", { headers }),
      fetch("/api/admin/departments",              { headers }),
    ])
    const sData = await sRes.json()
    const dData = await dRes.json()
    if (sData.staff)       setSubadmins(sData.staff)
    if (dData.departments) setDepts(dData.departments)
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
        body: JSON.stringify({ ...form, role: "subadmin" }),
      })
      const data = await res.json()
      if (!data.success) { setFormError(data.error); return }
      const deptName = depts.find(d => d.id === form.department_id)?.name
      setSubadmins(p => [{ ...data.staff, department_name: deptName }, ...p])
      setForm({ name: "", username: "", password: "", designation: "", department_id: "" })
      setShowForm(false)
    } catch { setFormError("Network error. Please try again.") }
    finally { setSaving(false) }
  }

  const openReset = (member: SubAdmin) => {
    setResetTarget(member)
    setResetPwd("")
    setResetError("")
    setResetSuccess(false)
    setResetShowPwd(false)
  }

  const handleResetPassword = async () => {
    if (!resetTarget) return
    setResetSaving(true); setResetError("")
    try {
      const res = await fetch("/api/admin/subadmins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
        body: JSON.stringify({ id: resetTarget.id, password: resetPwd }),
      })
      const data = await res.json()
      if (!data.success) { setResetError(data.error); return }
      setResetSuccess(true)
    } catch { setResetError("Network error. Please try again.") }
    finally { setResetSaving(false) }
  }

  const handleDelete = async (member: SubAdmin) => {
    setDeleting(member.id)
    try {
      const res = await fetch(`/api/admin/subadmins?id=${member.id}`, {
        method: "DELETE",
        headers: { "x-user-id": user!.id, "x-user-role": user!.role },
      })
      const data = await res.json()
      if (data.success) setSubadmins(p => p.filter(x => x.id !== member.id))
    } finally { setDeleting(null); setConfirmDel(null) }
  }

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Administration · Sub Admins</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            {subadmins.length} Sub Admins
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
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sub Admins</h1>
              <p className="text-slate-500 text-sm mt-1">Manage complaint assignment staff for District Anantnag</p>
            </div>
            <button onClick={() => { setShowForm(true); setFormError("") }}
              className="flex items-center gap-2 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black text-sm px-5 py-2.5 rounded shadow transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Sub Admin
            </button>
          </div>

          {/* Login info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-500 text-[18px] flex-shrink-0 mt-0.5">info</span>
            <div>
              <p className="font-bold text-blue-800 text-sm mb-0.5">Sub Admin Login Portal</p>
              <p className="text-[12px] text-blue-600">
                Sub admins have a dedicated login at{" "}
                <span className="font-mono font-bold bg-blue-100 px-1.5 py-0.5 rounded">/subadmin/login</span>
                {" "}— separate from the citizen and officer portals.
              </p>
            </div>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[20px]">admin_panel_settings</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">New Sub Admin Account</h2>
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
                    <label className="label-gov">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder="e.g. Mohd. Ashraf Bhat" className={inputCls} />
                  </div>
                  <div>
                    <label className="label-gov">Username <span className="text-red-500">*</span></label>
                    <input type="text" value={form.username}
                      onChange={e => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                      placeholder="e.g. ashraf.bhat" className={`${inputCls} font-mono`} />
                    <p className="text-[10px] text-slate-400 mt-1">Used to log in at /subadmin/login</p>
                  </div>
                  <div>
                    <label className="label-gov">Password <span className="text-red-500">*</span></label>
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
                  <div>
                    <label className="label-gov">Designation <span className="text-slate-300 font-normal">(Optional)</span></label>
                    <input type="text" value={form.designation} onChange={e => set("designation", e.target.value)}
                      placeholder="Sub Administrator" className={inputCls} />
                  </div>
                  <div>
                    <label className="label-gov">Department <span className="text-slate-300 font-normal">(Optional)</span></label>
                    <select value={form.department_id} onChange={e => set("department_id", e.target.value)}
                      className={`${inputCls} bg-white`}>
                      <option value="">— General / All Departments —</option>
                      {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleCreate} disabled={saving}
                    className="flex-1 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-3 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving
                      ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Creating…</>
                      : <><span className="material-symbols-outlined text-[18px]">add_circle</span> Create Sub Admin</>}
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
                {fetching ? "Loading…" : `${subadmins.length} Sub Admin${subadmins.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {fetching ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>Loading…
              </div>
            ) : subadmins.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">admin_panel_settings</span>
                <p className="font-bold text-slate-400">No sub admins yet</p>
                <p className="text-sm text-slate-300 mt-1">Click "Add Sub Admin" to create one</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {subadmins.map(m => (
                  <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-l-4 border-l-gov-navy">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gov-navy/10 border border-gov-navy/20 flex items-center justify-center text-gov-navy font-black text-sm">
                        {(m.name?.[0] || 'S').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">@{m.username}</span>
                          {m.designation && <span className="text-[10px] text-slate-500">{m.designation}</span>}
                          {m.department_name && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-gov-navy/10 text-gov-navy rounded-full border border-gov-navy/20">{m.department_name}</span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Added {new Date(m.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openReset(m)} title="Reset Password"
                        className="text-slate-300 hover:text-gov-saffron transition-colors p-2 rounded hover:bg-amber-50">
                        <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                      </button>
                      <button onClick={() => setConfirmDel(m)} title="Remove"
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-50">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reset Password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !resetSaving && setResetTarget(null)}>
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-gov-saffron text-3xl">lock_reset</span>
              <div>
                <p className="font-black text-slate-900">Reset Password</p>
                <p className="text-sm text-slate-500">Set a new password for this sub admin</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-4">
              <p className="text-sm font-bold text-slate-800">{resetTarget.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">@{resetTarget.username}</p>
            </div>
            {resetSuccess ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2 text-sm text-green-700 mb-4">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Password reset successfully.
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700 mb-3">
                    <span className="material-symbols-outlined text-[18px]">error</span> {resetError}
                  </div>
                )}
                <div className="mb-4">
                  <label className="label-gov">New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={resetShowPwd ? "text" : "password"}
                      value={resetPwd}
                      onChange={e => { setResetPwd(e.target.value); setResetError("") }}
                      placeholder="Min. 6 characters"
                      className={`${inputCls} pr-10`}
                      autoFocus
                    />
                    <button type="button" onClick={() => setResetShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-[18px]">{resetShowPwd ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-3">
              {!resetSuccess && (
                <button onClick={handleResetPassword} disabled={resetSaving || resetPwd.length < 6}
                  className="flex-1 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-2.5 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {resetSaving
                    ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Saving…</>
                    : <><span className="material-symbols-outlined text-[16px]">lock_reset</span> Reset Password</>}
                </button>
              )}
              <button onClick={() => setResetTarget(null)} disabled={resetSaving}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50 disabled:opacity-60">
                {resetSuccess ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
              <div>
                <p className="font-black text-slate-900">Remove Sub Admin?</p>
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
