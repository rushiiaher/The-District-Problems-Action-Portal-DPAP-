"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"

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
  })

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) router.push("/auth/login?tab=citizen")
  }, [user, isLoading, router])

  // Fetch profile
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
          })
          // ── Session self-repair ──────────────────────────────────
          // Old sessions stored id = mobile number instead of UUID.
          // If the API returned a real UUID, update auth context now
          // so that the Save button sends a valid x-user-id header.
          const isUuid = /^[0-9a-f-]{36}$/i.test(user.id)
          if (!isUuid && d.profile.id) {
            login({ ...user, id: d.profile.id, ...d.profile })
          }
        } else {
          setError(d.error || "Failed to load profile.")
        }
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setFetching(false))
  }, [user])

  const set = (field: string, val: string) => { setForm(p => ({ ...p, [field]: val })); setError(""); setSaved(false) }

  const handleSave = async () => {
    if (!form.name.trim())    { setError("Full name is required"); return }
    if (!form.gender)         { setError("Please select your gender"); return }
    if (!form.address.trim()) { setError("Address is required"); return }
    if (form.alt_mobile && !/^[6-9]\d{9}$/.test(form.alt_mobile)) {
      setError("Alternate mobile must be a valid 10-digit number"); return
    }

    setSaving(true); setError("")
    try {
      const res = await fetch("/api/citizen/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }

      // Update auth context so sidebar name updates live
      login({ ...user!, name: data.profile.name, ...(data.profile as any) })
      setProfile(data.profile)
      setSaved(true)
    } catch { setError("Network error. Please try again.") }
    finally { setSaving(false) }
  }

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 bg-gov-navy text-white sticky top-0 z-10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Citizen Portal · E-ARZI</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
            Secure Session
          </div>
        </header>

        <div className="p-8 max-w-2xl mx-auto">

          {/* Title */}
          <div className="mb-8 border-b border-slate-300 pb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-gov-saffron inline-block" />
                <span className="text-xs font-bold text-gov-saffron uppercase tracking-[0.2em]">My Account</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Profile</h1>
              <p className="text-slate-500 text-sm mt-1">Update your personal details and contact information</p>
            </div>
            <Link href="/citizen/dashboard"
              className="text-sm font-bold text-slate-500 hover:text-gov-navy flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Dashboard
            </Link>
          </div>

          {/* Saved banner */}
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

              {/* ── Mobile (read-only) ── */}
              <div className="bg-gov-navy/5 border border-gov-navy/15 rounded p-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-gov-navy text-[24px]">verified</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Verified Mobile Number</p>
                  <p className="font-black text-gov-navy text-lg tracking-wider">+91 {profile?.mobile}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mobile number cannot be changed. Contact administration to update.</p>
                </div>
              </div>

              {/* ── Personal Details ── */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron text-[20px]">person</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Personal Information</h2>
                </div>
                <div className="p-6 space-y-5">

                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder="As per Aadhaar / official records"
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map(g => (
                        <button key={g} type="button" onClick={() => set("gender", g)}
                          className={`flex-1 py-2 text-xs font-bold rounded border-2 transition-all ${
                            form.gender === g
                              ? "bg-gov-navy border-gov-navy text-white"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Email Address <span className="text-slate-300 font-normal">(Optional)</span>
                    </label>
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Alternate Mobile */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Alternate Mobile <span className="text-slate-300 font-normal">(Optional)</span>
                    </label>
                    <div className="flex">
                      <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-l">+91</span>
                      <input type="tel" maxLength={10} value={form.alt_mobile}
                        onChange={e => set("alt_mobile", e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit number"
                        className="flex-1 border border-slate-200 px-3 py-2.5 text-sm rounded-r focus:outline-none focus:border-gov-navy text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Address ── */}
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
                      className="w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 placeholder-slate-400 resize-none"
                    />
                  </div>

                  <LocationSelector
                    district={form.district}
                    block={form.block}
                    village={form.village}
                    onChange={(field, val) => set(field, val)}
                  />
                </div>
              </div>

              {/* ── Account Info (read-only) ── */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">info</span>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Account Information</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Account Role",     value: "Citizen" },
                    { label: "Member Since",      value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                    { label: "Mobile Verified",   value: profile?.verified ? "Yes ✓" : "Pending" },
                  ].map(row => (
                    <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                      <span className="text-sm font-bold text-slate-700">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
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
  )
}
