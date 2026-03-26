"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import { LocationSelector } from "@/components/location-selector"
import Link from "next/link"

const PURPOSE_CATEGORIES = [
  "Natural Disaster Relief",
  "Medical Emergency",
  "Death of Breadwinner",
  "Flood / House Damage",
  "Accident / Disability",
  "Loss of Livelihood",
  "Destitute / Extreme Poverty",
  "Other Emergency",
]

const inputCls = "w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-red-400 text-slate-800 bg-white placeholder-slate-400"

export default function RedCrossApplicationPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: "", father_name: "", dob: "", gender: "", aadhaar: "",
    mobile: "", address: "", district: "Anantnag", block: "", village: "",
    purpose_category: "", purpose: "", amount_requested: "",
    bank_account_no: "", bank_name: "", ifsc_code: "", bank_branch: "",
  })

  const [supportDocs,  setSupportDocs]  = useState<FileList | null>(null)
  const [healthDocs,   setHealthDocs]   = useState<FileList | null>(null)
  const healthDocRef = useRef<HTMLInputElement>(null)
  const supportDocRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState("")
  const [success,    setSuccess]    = useState(false)
  const [appId,      setAppId]      = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) router.push("/auth/login?tab=citizen")
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        full_name: (user as any).name || "",
        mobile:    (user as any).mobile || "",
        address:   (user as any).address || "",
        district:  (user as any).district || "Anantnag",
        block:     (user as any).block || "",
        village:   (user as any).village || "",
        aadhaar:   (user as any).aadhaar_no || "",
      }))
    }
  }, [user])

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError("") }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim())    { setError("Full name is required"); return }
    if (!form.mobile.trim())       { setError("Mobile number is required"); return }
    if (!form.address.trim())      { setError("Address is required"); return }
    if (!form.purpose_category)    { setError("Please select a category of need"); return }
    if (!form.purpose.trim())      { setError("Purpose of aid is required"); return }
    if (!form.bank_account_no.trim()) { setError("Bank account number is required"); return }
    if (!form.bank_name.trim())    { setError("Bank name is required"); return }
    if (!form.ifsc_code.trim())    { setError("IFSC code is required"); return }
    if (form.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.toUpperCase())) {
      setError("Please enter a valid IFSC code (e.g. JAKA0ANANTN)"); return
    }

    setSubmitting(true); setError("")
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      if (supportDocs) Array.from(supportDocs).forEach(f => fd.append("documents", f))
      if (healthDocs)  Array.from(healthDocs).forEach(f => fd.append("health_documents", f))

      const res = await fetch("/api/red-cross", {
        method: "POST",
        headers: { "x-user-id": user!.id, "x-user-role": "citizen" },
        body: fd,
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setAppId(data.application_id)
      setSuccess(true)
    } catch { setError("Network error. Please try again.") }
    finally { setSubmitting(false) }
  }

  if (isLoading || !user) return null

  if (success) return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-5 relative">
            <div className="absolute inset-0 bg-red-600 rounded-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-12 bg-white rounded-sm" />
              <div className="absolute w-12 h-4 bg-white rounded-sm" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Arzi Submitted!</h2>
          <p className="text-slate-500 mb-4 text-sm">Your emergency financial aid application has been received and will be reviewed shortly.</p>
          <div className="bg-slate-100 border border-slate-200 rounded p-3 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arzi ID</p>
            <p className="font-mono font-black text-gov-navy text-sm mt-0.5">{appId}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/citizen/red-cross/status" className="flex-1 bg-gov-navy text-white py-2.5 text-center text-sm font-bold rounded">Track Status</Link>
            <Link href="/citizen/dashboard" className="flex-1 border border-slate-200 text-slate-600 py-2.5 text-center text-sm font-bold rounded hover:bg-slate-50">Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
    </SidebarProvider>
  )

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">

        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-red-700 text-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <div className="w-5 h-5 relative flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-4 bg-white" /><div className="absolute w-4 h-1 bg-white" />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200 hidden sm:block">Citizen Portal · Financial Help in Emergency</p>
          </div>
          <Link href="/citizen/red-cross/status" className="text-xs font-bold text-red-200 hover:text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">track_changes</span> Track My Arzis
          </Link>
        </header>

        <div className="p-4 md:p-8 max-w-3xl mx-auto">

          <div className="border-b border-slate-200 pb-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 relative flex-shrink-0">
                <div className="absolute inset-0 bg-red-600 rounded" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-7 bg-white" /><div className="absolute w-7 h-2 bg-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">Financial Help in Emergency</h1>
                <p className="text-slate-500 text-sm">District Administration Anantnag — Emergency Aid</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px] flex-shrink-0 mt-0.5">info</span>
              <p className="text-xs text-red-800 leading-relaxed">
                Fill all sections carefully. Bank details are required for disbursement. All documents uploaded are reviewed by the District Administration only.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span> {error}
              </div>
            )}

            {/* Personal Details */}
            <Section title="Personal Details" icon="person">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name (as per Aadhaar)" required>
                  <input type="text" value={form.full_name} onChange={e => set("full_name", e.target.value)}
                    placeholder="Your full legal name" className={inputCls} />
                </Field>
                <Field label="Father's / Husband's Name">
                  <input type="text" value={form.father_name} onChange={e => set("father_name", e.target.value)}
                    placeholder="Parent or spouse name" className={inputCls} />
                </Field>
                <Field label="Date of Birth">
                  <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Gender" required>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} className={inputCls}>
                    <option value="">— Select —</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Aadhaar Number">
                  <input type="text" maxLength={12} value={form.aadhaar}
                    onChange={e => set("aadhaar", e.target.value.replace(/\D/g, ""))}
                    placeholder="12-digit Aadhaar number" className={inputCls} />
                </Field>
                <Field label="Mobile Number" required>
                  <input type="tel" maxLength={10} value={form.mobile}
                    onChange={e => set("mobile", e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile" className={inputCls} />
                </Field>
              </div>
            </Section>

            {/* Address */}
            <Section title="Current Address" icon="home">
              <Field label="Full Address" required>
                <textarea rows={2} value={form.address} onChange={e => set("address", e.target.value)}
                  placeholder="House number, street, landmark…" className={`${inputCls} resize-none`} />
              </Field>
              <div className="mt-3">
                <LocationSelector
                  district={form.district} block={form.block} village={form.village}
                  onChange={({ district, block, village }: any) => setForm(f => ({ ...f, district, block, village }))}
                  required />
              </div>
            </Section>

            {/* Purpose of Aid */}
            <Section title="Purpose of Aid" icon="volunteer_activism">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category of Need" required>
                  <select value={form.purpose_category} onChange={e => set("purpose_category", e.target.value)} className={inputCls}>
                    <option value="">— Select category —</option>
                    {PURPOSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Amount Requested (₹)">
                  <input type="number" min="0" value={form.amount_requested}
                    onChange={e => set("amount_requested", e.target.value)}
                    placeholder="e.g. 10000" className={inputCls} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Detailed Description of Need" required>
                    <textarea rows={4} value={form.purpose} onChange={e => set("purpose", e.target.value)}
                      placeholder="Explain your situation and why you need emergency financial assistance…"
                      className={`${inputCls} resize-none`} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Bank Details */}
            <Section title="Bank Account Details" icon="account_balance">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[16px] flex-shrink-0 mt-0.5">lock</span>
                <p className="text-xs text-amber-800">Bank details are confidential and only visible to District Administration for fund disbursement.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Bank Account Number" required>
                  <input type="text" value={form.bank_account_no}
                    onChange={e => set("bank_account_no", e.target.value.replace(/\D/g, ""))}
                    placeholder="Account number" className={inputCls} />
                </Field>
                <Field label="IFSC Code" required>
                  <input type="text" maxLength={11}
                    value={form.ifsc_code}
                    onChange={e => set("ifsc_code", e.target.value.toUpperCase())}
                    placeholder="e.g. JAKA0ANANTN" className={inputCls} />
                </Field>
                <Field label="Bank Name" required>
                  <input type="text" value={form.bank_name}
                    onChange={e => set("bank_name", e.target.value)}
                    placeholder="e.g. J&K Bank" className={inputCls} />
                </Field>
                <Field label="Branch Name">
                  <input type="text" value={form.bank_branch}
                    onChange={e => set("bank_branch", e.target.value)}
                    placeholder="e.g. Anantnag Main Branch" className={inputCls} />
                </Field>
              </div>
            </Section>

            {/* Health / Medical Documents */}
            <Section title="Medical / Health Documents" icon="medical_information">
              <p className="text-xs text-slate-500 mb-3">Upload health reports, prescriptions, hospital bills or any medical documents relevant to your application.</p>
              <DocUploadBox
                id="health-doc-upload"
                ref={healthDocRef}
                files={healthDocs}
                onChange={setHealthDocs}
                label="Upload Medical Documents"
                hint="Hospital reports, prescriptions, disability certificate — PDF / JPG / PNG (max 5MB each, up to 5 files)"
              />
            </Section>

            {/* Supporting Documents */}
            <Section title="Other Supporting Documents" icon="attach_file">
              <p className="text-xs text-slate-500 mb-3">Aadhaar card, income certificate, photographs of damage/incident, or any other relevant documents.</p>
              <DocUploadBox
                id="doc-upload"
                ref={supportDocRef}
                files={supportDocs}
                onChange={setSupportDocs}
                label="Upload Supporting Documents"
                hint="Aadhaar, Income Certificate, Photos — PDF / JPG / PNG (max 5MB each, up to 5 files)"
              />
            </Section>

            {/* Submit */}
            <div className="pt-2 flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg">
                {submitting
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Submitting…</>
                  : <><span className="material-symbols-outlined text-[18px]">send</span> Submit Arzi</>}
              </button>
              <Link href="/citizen/dashboard"
                className="px-6 border border-slate-200 text-slate-600 font-bold text-sm rounded hover:bg-slate-50 flex items-center">
                Cancel
              </Link>
            </div>

            <p className="text-center text-[11px] text-slate-400 pb-4">
              By submitting this form you declare that the information provided is true and accurate to the best of your knowledge.
            </p>
          </form>
        </div>
      </main>
    </div>
    </SidebarProvider>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
        <span className="material-symbols-outlined text-red-600 text-[18px]">{icon}</span>
        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

import { forwardRef } from "react"
const DocUploadBox = forwardRef<HTMLInputElement, {
  id: string; files: FileList | null; onChange: (f: FileList | null) => void; label: string; hint: string
}>(function DocUploadBox({ id, files, onChange, label, hint }, ref) {
  return (
    <>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors cursor-pointer"
        onClick={() => (ref as React.RefObject<HTMLInputElement>).current?.click()}>
        <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">upload_file</span>
        <p className="text-sm font-bold text-slate-600">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
        <input id={id} ref={ref} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={e => onChange(e.target.files)} />
      </div>
      {files && files.length > 0 && (
        <div className="mt-3 space-y-1">
          {Array.from(files).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-3 py-1.5">
              <span className="material-symbols-outlined text-[14px] text-red-500">
                {f.type === "application/pdf" ? "picture_as_pdf" : "image"}
              </span>
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-slate-400 flex-shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
})
