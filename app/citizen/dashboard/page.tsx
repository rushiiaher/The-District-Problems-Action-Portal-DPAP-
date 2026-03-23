"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED:   "bg-slate-100 text-slate-700 border-slate-300",
  ASSIGNED:    "bg-blue-50 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  ESCALATED:   "bg-red-50 text-red-800 border-red-200",
  RESOLVED:    "bg-emerald-50 text-emerald-800 border-emerald-200",
  REOPENED:    "bg-orange-50 text-orange-800 border-orange-200",
  CLOSED:      "bg-green-50 text-green-800 border-green-200",
  REASSIGNED:  "bg-indigo-50 text-indigo-800 border-indigo-200",
}

const CATEGORY_ICON: Record<string, string> = {
  "Water Supply": "water_drop",
  "Roads": "add_road",
  "Electricity": "bolt",
  "Health": "local_hospital",
  "Education": "school",
  "Sanitation": "delete_outline",
  "Agriculture": "grass",
}

export default function CitizenDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) router.push("/auth/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/complaints?citizen=true", { headers: { "x-user-id": user.id, "x-user-role": "citizen" } })
      .then(r => r.json()).then(d => { if (d.complaints) setComplaints(d.complaints) })
      .catch(() => {}).finally(() => setFetching(false))
  }, [user])

  const stats = {
    total:      complaints.length,
    resolved:   complaints.filter(c => ["RESOLVED","CLOSED"].includes(c.status)).length,
    inProgress: complaints.filter(c => ["ASSIGNED","IN_PROGRESS","ESCALATED"].includes(c.status)).length,
    onHold:     complaints.filter(c => c.status === "REASSIGNED").length,
  }

  if (isLoading || !user) return null

  return (
    <div className="flex min-h-screen bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Standard slim header — consistent with all other pages */}
        <header className="h-14 flex items-center justify-between pl-14 md:pl-8 pr-4 md:pr-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Citizen Portal · E-ARZI</p>
          <div className="flex items-center gap-3">
            <button className="text-slate-300 hover:text-white transition-colors" title="Notifications">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            {/* Avatar → profile edit */}
            <Link href="/citizen/profile" className="flex items-center gap-2 border-l border-white/20 pl-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white group-hover:text-gov-saffron transition-colors">{user.name || user.mobile}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Edit Profile</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gov-saffron flex items-center justify-center font-bold text-sm text-white group-hover:ring-2 group-hover:ring-white transition-all">
                {(user.name || user.mobile || "U")[0]}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-6 py-6 md:py-10">
          {/* Page heading */}
          <section className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">Citizen Portal</span>
              </div>
              <h1 className="text-3xl font-black text-gov-navy leading-tight">
                Welcome, {user.name || "Citizen"}
              </h1>
              <p className="text-slate-500 mt-1 max-w-md">Your centralized portal for grievance reporting and service requests. Ensuring transparency and accountability.</p>
            </div>
            <Link href="/citizen/submit">
              <button className="btn-navy px-5 py-2.5 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                POST NEW GRIEVANCE
              </button>
            </Link>
          </section>

          {/* Stats cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Filed", value: stats.total, color: "border-l-gov-navy", textColor: "text-gov-navy", icon: "description" },
              { label: "Resolved", value: stats.resolved, color: "border-l-gov-green", textColor: "text-gov-green", icon: "task_alt" },
              { label: "Under Process", value: stats.inProgress, color: "border-l-gov-saffron", textColor: "text-gov-saffron", icon: "pending" },
              { label: "On Hold", value: stats.onHold, color: "border-l-slate-400", textColor: "text-slate-400", icon: "hourglass_empty" },
            ].map(s => (
              <div key={s.label} className={`gov-card ${s.color} border-l-4 p-6`}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-black ${s.textColor} leading-none`}>
                    {String(s.value).padStart(2, "0")}
                  </span>
                  <span className={`material-symbols-outlined text-4xl opacity-10 text-slate-800`}>{s.icon}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Active grievances */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-extrabold text-gov-navy flex items-center gap-2">
                <span className="material-symbols-outlined">analytics</span>
                ACTIVE GRIEVANCES
              </h2>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Sort by:</span>
                <select className="bg-transparent border-none p-0 text-gov-navy font-bold focus:ring-0 cursor-pointer text-xs">
                  <option>Latest First</option>
                  <option>Priority</option>
                  <option>Status</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
              {fetching ? (
                <div className="p-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl animate-spin block mx-auto mb-3">progress_activity</span>
                  Loading your grievances...
                </div>
              ) : complaints.length === 0 ? (
                <div className="p-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">inbox</span>
                  <p className="font-bold text-slate-500">No grievances filed yet</p>
                  <p className="text-sm text-slate-400 mt-1">Submit your first grievance using the button above.</p>
                  <Link href="/citizen/submit">
                    <button className="btn-saffron px-6 py-2.5 text-sm mt-6">
                      Submit New Grievance
                    </button>
                  </Link>
                </div>
              ) : (
                complaints.map((c, idx) => (
                  <div key={c.id} className={`p-6 ${idx < complaints.length - 1 ? "border-b border-slate-100" : ""} hover:bg-slate-50 transition-colors`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-5">
                        <div className="bg-gov-saffron/5 text-gov-saffron p-3 rounded border border-gov-saffron/20 flex-shrink-0">
                          <span className="material-symbols-outlined text-2xl">
                            {CATEGORY_ICON[c.category] || "description"}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-slate-800">{c.category}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_BADGE[c.status] || STATUS_BADGE.SUBMITTED}`}>
                              {c.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-4 flex-wrap">
                            <span><span className="font-bold text-slate-700">ID:</span> {c.id}</span>
                            <span><span className="font-bold text-slate-700">Filed:</span> {new Date(c.created_at).toLocaleDateString("en-IN")}</span>
                            {c.assigned_dept_name && <span><span className="font-bold text-slate-700">Dept:</span> {c.assigned_dept_name}</span>}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-1 max-w-lg">{c.description}</p>
                        </div>
                      </div>
                      <Link href={`/citizen/complaint/${c.id}`}>
                        <button className="text-gov-navy text-xs font-bold flex items-center gap-1 hover:underline underline-offset-4 whitespace-nowrap">
                          VIEW FULL TRACKING <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Security banner */}
            <div className="bg-gov-navy/5 border border-gov-navy/10 p-5 rounded flex items-center gap-4">
              <span className="material-symbols-outlined text-gov-navy">verified_user</span>
              <div>
                <p className="text-sm font-bold text-gov-navy">Secure Transaction Environment</p>
                <p className="text-xs text-slate-600">Your grievance is protected by end-to-end encryption. Each submission is tracked by a unique Grievance ID for legal compliance.</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-8">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-bold text-gov-navy">1800-11-2024 <span className="font-normal">(Toll Free)</span></p>
              <p>Available 24×7 for all citizens</p>
            </div>
            <p className="text-center">Website designed, developed and hosted by National Informatics Centre (NIC).</p>
            <div className="flex gap-2 items-center">
              <span className="material-symbols-outlined text-gov-green text-base">verified</span>
              <span>Digital India Initiative</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
