"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"

const iCls = "w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white placeholder-slate-400"

type DocField = { key: "profile_photo" | "passport_photo" | "aadhaar_card"; label: string; hint: string; icon: string }
const DOC_FIELDS: DocField[] = [
  { key: "profile_photo",  label: "Profile Photo",   hint: "Clear face photo, white background preferred",   icon: "person"         },
  { key: "passport_photo", label: "Passport Photo",  hint: "Recent passport-size photograph",                icon: "badge"          },
  { key: "aadhaar_card",   label: "Aadhaar Card",    hint: "Front side of your Aadhaar card (PDF or image)", icon: "contact_page"   },
]

export default function CitizenProfilePage() {
  const { user, login, isLoading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState("")

  const [form, setForm] = useState({
    name: "", gender: "", alt_mobile: "", email: "",
    address: "", district: "Anantnag", block: "", village: "",
    aadhaar_no: "",
  })

  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({
    profile_photo: null, passport_photo: null, aadhaar_card: null,
  })
  const fileRefs = {
    profile_photo:  useRef<HTMLInputElement>(null),
    passport_photo: useRef<HTMLInputElement>(null),
    aadhaar_card:   useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) router.push("/auth/login?tab=citizen")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/citizen/profile", { headers: { "x-user-id": user.id } })
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setProfile(d.profile)
          setForm({
            name:       d.profile.name || "",
            gender:     d.profile.gender || "",
            alt_mobile: d.profile.alt_mobile || "",
            email:      d.profile.email || "",
            address:    d.profile.address || "",
            district:   d.profile.district || "Anantnag",
            block:      d.profile.block || "",
            village:    d.profile.village || "",
            aadhaar_no: d.profile.aadhaar_no || "",
          })
          const isUuid = /^[0-9a-f-]{36}$/i.test(user.id)
          if (!isUuid && d.profile.id) login({ ...user, id: d.profile.id, ...d.profile })
        } else {
          setError(d.error || "Failed to load profile.")
        }
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setFetching(false))
  }, [user])

  const set = (field: string, val: string) => { setForm(p => ({ ...p, [field]: val })); setError(""); setSaved(false) }

  const hasNewDocs = Object.values(docFiles).some(Boolean)

  const handleSave = async () => {
    if (!form.name.trim())    { setError("Full name is required"); return }
    if (!form.gender)         { setError("Please select your gender"); return }
    if (!form.address.trim()) { setError("Address is required"); return }
    if (form.alt_mobile && !/^[6-9]\d{9}$/.test(form.alt_mobile)) {
      setError("Alternate mobile must be a valid 10-digit number"); return
    }
    if (form.aadhaar_no && !/^\d{12}$/.test(form.aadhaar_no)) {
      setError("Aadhaar number must be exactly 12 digits"); return
    }

    setSaving(true); setError("")
    try {
      let body: BodyInit
      let headers: Record<string, string> = { "x-user-id": user!.id }

      if (hasNewDocs) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
        if (docFiles.profile_photo)  fd.append("profile_photo",  docFiles.profile_photo)
        if (docFiles.passport_photo) fd.append("passport_photo", docFiles.passport_photo)
        if (docFiles.aadhaar_card)   fd.append("aadhaar_card",   docFiles.aadhaar_card)
        body = fd
      } else {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(form)
      }

      const res = await fetch("/api/citizen/profile", { method: "PATCH", headers, body })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }

      login({ ...user!, name: data.profile.name, ...(data.profile as any) })
      setProfile(data.profile)
      setDocFiles({ profile_photo: null, passport_photo: null, aadhaar_card: null })
      setSaved(true)
    } catch { setError("Network error. Please try again.") }
    finally { setSaving(false) }
  }

  if (isLoading || !user) return null

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">

        <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SidebarToggle />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hidden sm:block">Citizen Portal · E-ARZI</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            Secure Session
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-2xl mx-auto">

          <div className="mb-6 md:mb-8 border-b border-slate-200 pb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">My Account</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Profile</h1>
              <p className="text-slate-500 text-sm mt-1">Update your personal details, KYC documents and contact information</p>
            </div>
            <Link href="/citizen/dashboard" className="text-sm font-bold text-slate-500 hover:text-gov-navy flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Dashboard
            </Link>
          </div>

          {saved && (
            <div className="mb-5 p-3 bg-gov-green/10 border border-gov-green/30 rounded flex items-center gap-3">
              <span className="material-symbols-outlined text-gov-green text-[18px]">check_circle</span>
              <p className="text-gov-green font-bold text-sm">Profile updated successfully!</p>
            </div>
          )}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0">error</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {fetching ? (
            <div className="bg-white border border-slate-200 rounded shadow-sm p-16 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-3 animate-spin">progress_activity</span>
              Loading your profile...
            </div>
          ) : (
            <div className="space-y-5">

              {/* Mobile (read-only) */}
              <div className="bg-gov-navy/5 border border-gov-navy/15 rounded p-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-gov-navy text-[24px]">verified</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Verified Mobile Number</p>
                  <p className="font-black text-gov-navy text-lg tracking-wider">+91 {profile?.mobile}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mobile number cannot be changed. Contact administration to update.</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[20px]">person</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Personal Information</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder="As per Aadhaar / official records" className={iCls} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map(g => (
                        <button key={g} type="button" onClick={() => set("gender", g)}
                          className={`flex-1 py-2 text-xs font-bold rounded border-2 transition-all ${form.gender === g ? "bg-gov-navy border-gov-navy text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Email Address <span className="text-slate-300 font-normal">(Optional)</span>
                    </label>
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                      placeholder="you@example.com" className={iCls} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Alternate Mobile <span className="text-slate-300 font-normal">(Optional)</span>
                    </label>
                    <div className="flex">
                      <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-l">+91</span>
                      <input type="tel" maxLength={10} value={form.alt_mobile}
                        onChange={e => set("alt_mobile", e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit number"
                        className="flex-1 border border-slate-200 px-3 py-2.5 text-sm rounded-r focus:outline-none focus:border-gov-navy text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-green text-[20px]">location_on</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Address</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea rows={2} value={form.address} onChange={e => set("address", e.target.value)}
                      placeholder="House no., street, locality..."
                      className={`${iCls} resize-none`} />
                  </div>
                  <LocationSelector
                    district={form.district} block={form.block} village={form.village}
                    onChange={(field, val) => set(field, val)}
                  />
                </div>
              </div>

              {/* KYC Documents */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[20px]">verified_user</span>
                  <div>
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">KYC Documents</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">Required for complaint submission and aid applications</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">

                  {/* Aadhaar Number */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Aadhaar Number
                    </label>
                    <input
                      type="text" maxLength={12}
                      value={form.aadhaar_no}
                      onChange={e => set("aadhaar_no", e.target.value.replace(/\D/g, ""))}
                      placeholder="12-digit Aadhaar number"
                      className={iCls}
                    />
                  </div>

                  {/* Document uploads */}
                  <div className="space-y-4">
                    {DOC_FIELDS.map(({ key, label, hint, icon }) => {
                      const existing = profile?.[`${key}_url`]
                      const newFile  = docFiles[key]
                      return (
                        <div key={key} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-gov-navy text-[20px]">{icon}</span>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{label}</p>
                                <p className="text-[11px] text-slate-400">{hint}</p>
                              </div>
                            </div>
                            {existing && !newFile && (
                              <a href={existing} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] font-bold text-gov-navy hover:underline flex-shrink-0">
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>View
                              </a>
                            )}
                          </div>

                          {/* Current file preview */}
                          {newFile ? (
                            <div className="flex items-center gap-3 bg-gov-navy/5 border border-gov-navy/15 rounded px-3 py-2 mb-2">
                              <span className="material-symbols-outlined text-gov-navy text-[18px]">
                                {newFile.type === "application/pdf" ? "picture_as_pdf" : "image"}
                              </span>
                              <span className="text-xs text-slate-700 flex-1 truncate font-medium">{newFile.name}</span>
                              <span className="text-[10px] text-slate-400">{(newFile.size / 1024).toFixed(0)} KB</span>
                              <button onClick={() => setDocFiles(p => ({ ...p, [key]: null }))}
                                className="text-slate-400 hover:text-red-500">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ) : existing ? (
                            <div className="flex items-center gap-2 text-[11px] text-gov-green mb-2">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Document uploaded — click Upload New to replace
                            </div>
                          ) : null}

                          <input
                            ref={fileRefs[key]}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={e => setDocFiles(p => ({ ...p, [key]: e.target.files?.[0] || null }))}
                          />
                          <button
                            type="button"
                            onClick={() => fileRefs[key].current?.click()}
                            className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-500 hover:border-gov-navy hover:text-gov-navy transition-colors w-full justify-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload</span>
                            {existing && !newFile ? "Upload New" : "Choose File"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">info</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Account Information</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Account Role",   value: "Citizen" },
                    { label: "Member Since",    value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                    { label: "Mobile Verified", value: profile?.verified ? "Yes ✓" : "Pending" },
                    { label: "KYC Status",      value: (profile?.profile_photo_url && profile?.aadhaar_card_url) ? "Documents Uploaded ✓" : "Incomplete — please upload documents" },
                  ].map(row => (
                    <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                      <span className={`text-sm font-bold ${row.label === "KYC Status" && !(profile?.profile_photo_url && profile?.aadhaar_card_url) ? "text-amber-600" : "text-slate-700"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-gov-saffron hover:bg-[#e68a2e] text-white font-black py-4 rounded text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md">
                {saving
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...</>
                  : <><span className="material-symbols-outlined text-[18px]">save</span> Save Profile Changes</>}
              </button>

            </div>
          )}
        </div>
      </main>
    </div>
    </SidebarProvider>
  )
}
