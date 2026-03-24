"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Application = {
  id: string
  full_name: string
  purpose: string
  purpose_category?: string
  approved_amount: number
  mobile?: string
  district?: string; block?: string; village?: string
  status: string
  payment_ref?: string
  paid_at?: string
  reviewed_at?: string
  created_at: string
}

export default function BankDashboardPage() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()

  const [apps, setApps]         = useState<Application[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter]     = useState<"APPROVED" | "PAID" | "">("")
  const [payModal, setPayModal] = useState<Application | null>(null)
  const [payRef, setPayRef]     = useState("")
  const [paying, setPaying]     = useState(false)
  const [payErr, setPayErr]     = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "bank_manager")) router.push("/auth/login")
  }, [user, isLoading, router])

  const fetchApps = useCallback(async () => {
    if (!user) return
    setFetching(true)
    const res = await fetch(`/api/red-cross${filter ? `?status=${filter}` : ""}`, {
      headers: { "x-user-id": user.id, "x-user-role": user.role },
    })
    const d = await res.json()
    if (d.applications) setApps(d.applications)
    setFetching(false)
  }, [user, filter])

  useEffect(() => { fetchApps() }, [fetchApps])

  const handlePay = async () => {
    if (!payModal || !payRef.trim()) { setPayErr("Payment reference number is required"); return }
    setPaying(true); setPayErr("")
    const res = await fetch(`/api/red-cross/${payModal.id}/pay`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": user!.id, "x-user-role": user!.role },
      body: JSON.stringify({ payment_ref: payRef.trim() }),
    })
    const d = await res.json()
    if (!d.success) { setPayErr(d.error); setPaying(false); return }
    setApps(p => p.map(a => a.id === payModal.id ? { ...a, status: "PAID", payment_ref: payRef, paid_at: new Date().toISOString() } : a))
    setPayModal(null); setPayRef(""); setPaying(false)
  }

  if (isLoading || !user) return null

  const pending = apps.filter(a => a.status === "APPROVED")
  const paid    = apps.filter(a => a.status === "PAID")
  const totalPending = pending.reduce((s, a) => s + (a.approved_amount || 0), 0)
  const totalPaid    = paid.reduce((s, a) => s + (a.approved_amount || 0), 0)

  const shown = filter === "APPROVED" ? pending : filter === "PAID" ? paid : apps

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter">
      {/* Top bar */}
      <header className="bg-gov-navy text-white px-4 md:px-8 py-0 flex items-center justify-between h-16 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-sm flex-shrink-0">JK</div>
          <div>
            <p className="font-black text-sm tracking-wide">E-ARZI ANANTNAG</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">Bank Officer Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-white">{(user as any).name || user.id}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Bank Manager</p>
          </div>
          <button onClick={() => { router.push("/auth/login") }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/20 px-2 md:px-3 py-1.5 rounded hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[14px]">logout</span> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Tricolor */}
      <div className="h-1 flex flex-shrink-0">
        <div className="flex-1 bg-gov-saffron" /><div className="flex-1 bg-white border-y border-slate-200" /><div className="flex-1 bg-gov-green" />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1000px] mx-auto w-full space-y-5 md:space-y-6">
        {/* Title */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1 w-8 bg-gov-saffron inline-block" />
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Bank Officer</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Emergency Financial Aid Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Process approved emergency financial aid disbursements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Pending Payment", value: pending.length, sub: `₹${totalPending.toLocaleString("en-IN")} to disburse`, color: "border-l-gov-saffron", icon: "payments" },
            { label: "Paid This Session", value: paid.length,  sub: `₹${totalPaid.toLocaleString("en-IN")} disbursed`,    color: "border-l-gov-green", icon: "check_circle" },
            { label: "Total Applications", value: apps.length, sub: "Approved + Paid",                                      color: "border-l-gov-navy",  icon: "folder_open" },
          ].map(s => (
            <div key={s.label} className={`gov-card border-l-4 ${s.color} p-5 flex items-center gap-4`}>
              <span className="material-symbols-outlined text-3xl text-slate-300">{s.icon}</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{s.label}</p>
                <p className="text-2xl font-black text-slate-900">{String(s.value).padStart(2,"0")}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          {(["","APPROVED","PAID"] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`text-[11px] font-bold px-4 py-2 rounded-full border transition-all ${
                filter===f ? "bg-gov-navy text-white border-gov-navy" : "bg-white text-slate-600 border-slate-200 hover:border-gov-navy"
              }`}>
              {f===""?"All":f==="APPROVED"?"Pending Payment":"Paid"}
            </button>
          ))}
          <button onClick={fetchApps} className="ml-auto text-[11px] text-slate-500 font-bold flex items-center gap-1 hover:text-slate-800">
            <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {fetching ? "Loading…" : `${shown.length} record${shown.length!==1?"s":""}`}
            </p>
          </div>

          {fetching ? (
            <div className="p-12 text-center text-slate-400">
              <span className="material-symbols-outlined animate-spin text-4xl block mb-3">progress_activity</span>Loading…
            </div>
          ) : shown.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">payments</span>
              <p className="font-bold text-slate-400">No records</p>
              <p className="text-sm text-slate-300 mt-1">{filter==="APPROVED" ? "No approved applications awaiting payment" : "No paid applications yet"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50">
                    {["#","Applicant","Category","Approved Amount","Status","Approved Date","Action"].map(h=>(
                      <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {shown.map((app,idx) => {
                    const isPaid = app.status === "PAID"
                    return (
                      <tr key={app.id} className={`hover:bg-slate-50 transition-colors ${isPaid?"opacity-70":""}`}>
                        <td className="px-5 py-4 text-xs text-slate-400 font-mono">{idx+1}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{app.full_name}</p>
                          <p className="text-[10px] text-slate-400">{[app.village,app.block].filter(Boolean).join(", ")}</p>
                          {app.payment_ref && (
                            <p className="text-[9px] font-mono text-slate-400 mt-0.5">Ref: {app.payment_ref}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 max-w-[130px] leading-tight">
                          {app.purpose_category||"Red Cross Aid"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-lg font-black text-gov-green">
                            ₹{(app.approved_amount||0).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isPaid ? (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/> Awaiting
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {isPaid ? (
                            <span className="text-[10px] text-slate-400 font-bold">
                              {app.paid_at ? new Date(app.paid_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "Done"}
                            </span>
                          ) : (
                            <button onClick={()=>{setPayModal(app);setPayRef("");setPayErr("")}}
                              className="flex items-center gap-1.5 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black px-4 py-2 rounded text-[11px] transition-colors shadow-sm">
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                              Process Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 pb-4">
          District Administration Anantnag · Emergency Financial Aid
        </p>
      </main>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setPayModal(null)}>
          <div className="bg-white rounded shadow-xl max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <div className="bg-gov-navy px-6 py-5 rounded-t flex items-center justify-between">
              <div>
                <p className="text-white font-black">Process Payment</p>
                <p className="text-slate-400 text-[11px]">{payModal.full_name}</p>
              </div>
              <button onClick={()=>setPayModal(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount highlight */}
              <div className="bg-gov-green/10 border border-gov-green/30 rounded p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount to Disburse</p>
                <p className="text-3xl font-black text-gov-green mt-1">₹{(payModal.approved_amount||0).toLocaleString("en-IN")}</p>
                <p className="text-xs text-slate-500 mt-1">{payModal.purpose_category||"Red Cross Aid"}</p>
              </div>

              {[
                { l:"Applicant",     v: payModal.full_name },
                { l:"Mobile",        v: payModal.mobile ? `+91 ${payModal.mobile}` : null },
                { l:"Location",      v: [payModal.village,payModal.block].filter(Boolean).join(", ")||null },
              ].filter(f=>f.v).map(f=>(
                <div key={f.l} className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">{f.l}</span>
                  <span className="font-bold text-slate-800">{f.v}</span>
                </div>
              ))}

              {payErr && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>{payErr}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                  Transaction / Cheque Reference Number <span className="text-red-500">*</span>
                </label>
                <input type="text" value={payRef} onChange={e=>{setPayRef(e.target.value);setPayErr("")}}
                  placeholder="e.g. NEFT/20260320/123456"
                  className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy font-mono"/>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={handlePay} disabled={paying}
                  className="flex-1 bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-3 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-md">
                  {paying
                    ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Processing…</>
                    : <><span className="material-symbols-outlined text-[18px]">payments</span>Mark as Paid</>}
                </button>
                <button onClick={()=>setPayModal(null)}
                  className="px-5 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
