"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

const SETTINGS = [
  {
    group: "Portal Identity",
    icon: "account_balance",
    items: [
      { key: "portal_name",     label: "Portal Name",          type: "text",   value: "E-ARZI Anantnag" },
      { key: "district",        label: "District",             type: "text",   value: "Anantnag" },
      { key: "state",           label: "State / UT",           type: "text",   value: "Jammu & Kashmir" },
      { key: "helpline",        label: "Helpline Number",      type: "text",   value: "1800-112-233" },
      { key: "helpdesk_email",  label: "Helpdesk Email",       type: "email",  value: "helpdesk-ant@jk.gov.in" },
    ],
  },
  {
    group: "SLA Defaults (hours)",
    icon: "timer",
    items: [
      { key: "sla_emergency",   label: "Emergency Priority",   type: "number", value: "2" },
      { key: "sla_high",        label: "High Priority",        type: "number", value: "24" },
      { key: "sla_medium",      label: "Medium Priority",      type: "number", value: "48" },
      { key: "sla_low",         label: "Low Priority",         type: "number", value: "72" },
    ],
  },
  {
    group: "Arzi Rules",
    icon: "policy",
    items: [
      { key: "max_reopen",      label: "Max Reopen Attempts",  type: "number", value: "2" },
      { key: "auto_close_days", label: "Auto-Close After (days)", type: "number", value: "30" },
      { key: "allow_anonymous", label: "Allow Anonymous Filing", type: "toggle", value: "false" },
      { key: "otp_enabled",     label: "OTP Authentication",   type: "toggle", value: "true" },
    ],
  },
  {
    group: "Notifications",
    icon: "notifications",
    items: [
      { key: "sms_enabled",     label: "SMS Notifications",    type: "toggle", value: "true" },
      { key: "email_enabled",   label: "Email Notifications",  type: "toggle", value: "false" },
      { key: "notify_on_assign",label: "Notify on Assignment", type: "toggle", value: "true" },
      { key: "notify_on_resolve",label: "Notify on Resolution",type: "toggle", value: "true" },
    ],
  },
]

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  // Initialise state from defaults
  useEffect(() => {
    const initial: Record<string, string> = {}
    SETTINGS.forEach(section => section.items.forEach(item => { initial[item.key] = item.value }))
    setValues(initial)
  }, [])

  const handleSave = () => {
    // In production: POST /api/settings with values
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Super Admin · E-ARZI</p>
          {saved && (
            <div className="flex items-center gap-2 text-xs text-gov-green bg-green-900/30 px-3 py-1.5 rounded border border-green-500/30">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Settings saved successfully
            </div>
          )}
        </header>

        <div className="p-8 max-w-4xl">
          {/* Title */}
          <div className="mb-8 border-b border-slate-300 pb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">System Settings</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Portal Configuration</h1>
              <p className="text-slate-500 text-sm mt-1">Manage global settings for the E-ARZI portal</p>
            </div>
            <button onClick={handleSave}
              className="btn-navy px-6 py-2.5 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded mb-8 text-sm text-amber-800">
            <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5 flex-shrink-0">warning</span>
            <p>Changes to system settings take effect immediately and affect all users. Proceed with caution.</p>
          </div>

          {/* Settings sections */}
          <div className="space-y-8">
            {SETTINGS.map(section => (
              <div key={section.group} className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">

                {/* Section header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-navy text-[22px]">{section.icon}</span>
                  <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">{section.group}</h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {section.items.map(item => (
                    <div key={item.key} className="px-6 py-4 flex items-center gap-6">
                      <div className="flex-1">
                        <label className="text-sm font-bold text-slate-700">{item.label}</label>
                        <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono">{item.key}</p>
                      </div>
                      {item.type === "toggle" ? (
                        <button
                          onClick={() => setValues(v => ({ ...v, [item.key]: v[item.key] === "true" ? "false" : "true" }))}
                          className={`relative w-12 h-6 rounded-full transition-all ${values[item.key] === "true" ? "bg-gov-navy" : "bg-slate-300"}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${values[item.key] === "true" ? "left-7" : "left-1"}`} />
                        </button>
                      ) : (
                        <input
                          type={item.type}
                          value={values[item.key] || ""}
                          onChange={e => setValues(v => ({ ...v, [item.key]: e.target.value }))}
                          className="border border-slate-200 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-gov-navy font-mono"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save footer */}
          <div className="mt-8 flex justify-end gap-3">
            <button onClick={() => { const initial: Record<string,string> = {}; SETTINGS.forEach(s => s.items.forEach(i => { initial[i.key] = i.value })); setValues(initial) }}
              className="px-6 py-2.5 text-sm font-bold border border-slate-300 rounded hover:bg-slate-50 text-slate-700">
              Reset to Defaults
            </button>
            <button onClick={handleSave} className="btn-navy px-6 py-2.5 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save All Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
