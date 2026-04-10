"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { AppSidebar, SidebarToggle } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-context"

type Banner = {
  id: string
  alt_text: string
  image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export default function HeroBannersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [banners,     setBanners]     = useState<Banner[]>([])
  const [fetching,    setFetching]    = useState(true)
  const [uploading,   setUploading]   = useState(false)
  const [altText,     setAltText]     = useState("")
  const [file,        setFile]        = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) router.push("/admin/login")
  }, [user, isLoading, router])

  const headers = { "x-user-id": user?.id || "", "x-user-role": user?.role || "" }

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  // Fetch all banners (active + inactive) for admin view
  const fetchBanners = async () => {
    setFetching(true)
    try {
      // Use service-level fetch that bypasses is_active filter
      const res  = await fetch("/api/hero-banners/all", { headers })
      const data = await res.json()
      if (data.success) setBanners(data.banners)
    } catch {
      showToast("Failed to load banners", false)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { if (user) fetchBanners() }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
    else   setPreview(null)
  }

  const handleUpload = async () => {
    if (!file) return showToast("Please select an image", false)
    if (!altText.trim()) return showToast("Please enter alt text", false)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("image",    file)
      fd.append("alt_text", altText)
      const res  = await fetch("/api/hero-banners", { method: "POST", headers, body: fd })
      const data = await res.json()
      if (data.success) {
        showToast("Banner uploaded successfully")
        setFile(null); setAltText(""); setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        fetchBanners()
      } else {
        showToast(data.error || "Upload failed", false)
      }
    } catch {
      showToast("Upload failed", false)
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = async (b: Banner) => {
    const res  = await fetch(`/api/hero-banners/${b.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !b.is_active }),
    })
    const data = await res.json()
    if (data.success) {
      setBanners(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !b.is_active } : x))
      showToast(`Banner ${b.is_active ? "hidden" : "activated"}`)
    } else {
      showToast(data.error || "Update failed", false)
    }
  }

  const moveOrder = async (b: Banner, direction: "up" | "down") => {
    const sorted  = [...banners].sort((a, x) => a.sort_order - x.sort_order)
    const idx     = sorted.findIndex(x => x.id === b.id)
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const other = sorted[swapIdx]
    // Swap sort_orders
    await Promise.all([
      fetch(`/api/hero-banners/${b.id}`,     { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: other.sort_order }) }),
      fetch(`/api/hero-banners/${other.id}`, { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: b.sort_order }) }),
    ])
    fetchBanners()
  }

  const handleDelete = async (id: string) => {
    const res  = await fetch(`/api/hero-banners/${id}`, { method: "DELETE", headers })
    const data = await res.json()
    if (data.success) {
      setBanners(prev => prev.filter(x => x.id !== id))
      showToast("Banner deleted")
    } else {
      showToast(data.error || "Delete failed", false)
    }
    setDeleteId(null)
  }

  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)

  if (isLoading || !user) return null

  return (
    <SidebarProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f7f9] font-inter">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top bar */}
        <div className="bg-gov-navy text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <SidebarToggle />
          <div>
            <h1 className="text-lg font-black uppercase tracking-wide leading-tight">Hero Banners</h1>
            <p className="text-slate-300 text-xs">Manage homepage carousel images</p>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">

          {/* ── Upload Panel ── */}
          <section className="bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <span className="material-symbols-outlined text-gov-navy text-[20px]">add_photo_alternate</span>
              <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">Upload New Banner</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* File picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                    Banner Image <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-slate-300 hover:border-gov-navy transition-colors rounded p-6 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full max-h-40 object-cover rounded mb-2" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-[48px] block mb-2">image</span>
                    )}
                    <p className="text-xs text-slate-500">{file ? file.name : "Click to select — JPEG, PNG or WebP"}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Recommended: 1600 × 500 px</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Alt text + submit */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                      Alt Text / Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={altText}
                      onChange={e => setAltText(e.target.value)}
                      placeholder="e.g. e-Arzi Portal — Online Grievance"
                      className="w-full border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gov-navy"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Used for accessibility and slide indicator</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-2">
                    <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5">info</span>
                      New banners are added as active and appear last in the carousel. Use the order controls below to rearrange.
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || !file}
                      className="flex items-center justify-center gap-2 bg-gov-navy text-white font-bold py-2.5 px-6 text-sm hover:bg-[#001a40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? (
                        <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Uploading…</>
                      ) : (
                        <><span className="material-symbols-outlined text-[18px]">upload</span> Upload Banner</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Current Banners ── */}
          <section className="bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gov-navy text-[20px]">view_carousel</span>
                <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">Current Banners</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gov-green">{banners.filter(b => b.is_active).length} active</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{banners.length} total</span>
              </div>
            </div>

            <div className="p-6">
              {fetching ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span className="text-sm">Loading banners…</span>
                </div>
              ) : sorted.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-[48px] block mb-3">image_not_supported</span>
                  <p className="text-sm font-medium">No banners uploaded yet</p>
                  <p className="text-xs mt-1">Upload your first banner above</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sorted.map((b, idx) => (
                    <div
                      key={b.id}
                      className={`border rounded overflow-hidden transition-all ${b.is_active ? "border-gov-navy shadow-sm" : "border-slate-200 opacity-60"}`}
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/5] bg-slate-100 overflow-hidden">
                        <img src={b.image_url} alt={b.alt_text} className="w-full h-full object-cover" />
                        {/* Order badge */}
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          #{idx + 1}
                        </div>
                        {/* Status badge */}
                        <div className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded ${b.is_active ? "bg-gov-green text-white" : "bg-slate-500 text-white"}`}>
                          {b.is_active ? "ACTIVE" : "HIDDEN"}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3 bg-white">
                        <p className="text-xs font-bold text-slate-700 truncate mb-1">{b.alt_text}</p>
                        <p className="text-[10px] text-slate-400 mb-3">
                          Added {new Date(b.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Move up */}
                          <button
                            onClick={() => moveOrder(b, "up")}
                            disabled={idx === 0}
                            title="Move up"
                            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                          </button>
                          {/* Move down */}
                          <button
                            onClick={() => moveOrder(b, "down")}
                            disabled={idx === sorted.length - 1}
                            title="Move down"
                            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                          </button>
                          {/* Toggle active */}
                          <button
                            onClick={() => toggleActive(b)}
                            className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold border transition-colors ${
                              b.is_active
                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                : "border-gov-green/40 text-gov-green hover:bg-green-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">{b.is_active ? "visibility_off" : "visibility"}</span>
                            {b.is_active ? "Hide" : "Show"}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteId(b.id)}
                            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-auto"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Live Preview Info ── */}
          <div className="bg-slate-100 border border-slate-200 px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-gov-navy text-[18px] flex-shrink-0 mt-0.5">open_in_new</span>
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-700 mb-0.5">Live Preview</p>
              Changes are reflected on the homepage immediately after upload or toggle.
              Active banners appear in the carousel in the order shown above.{" "}
              <a href="/" target="_blank" className="text-gov-navy font-bold underline hover:text-gov-saffron">
                View Homepage →
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>

    {/* ── Delete Confirm Modal ── */}
    {deleteId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white shadow-xl border border-slate-200 p-6 max-w-sm w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-red-600 text-[28px]">warning</span>
            <h3 className="text-base font-black text-slate-800">Delete Banner?</h3>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            This will permanently delete the banner image and remove it from the homepage carousel. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteId)}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Toast ── */}
    {toast && (
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-xl text-sm font-bold text-white ${toast.ok ? "bg-gov-green" : "bg-red-600"}`}>
        <span className="material-symbols-outlined text-[18px]">{toast.ok ? "check_circle" : "error"}</span>
        {toast.msg}
      </div>
    )}

    </SidebarProvider>
  )
}
