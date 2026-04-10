import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const BUCKET = "hero-banners"

// Ensure the storage bucket exists (creates it if missing)
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

// ── GET /api/hero-banners — public, returns active banners ordered by sort_order
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("id, alt_text, image_url, sort_order, is_active, created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    // Return empty array on any error (table not yet created, etc.)
    // so the homepage falls back to static slides gracefully
    if (error) return NextResponse.json({ success: true, banners: [] })
    return NextResponse.json({ success: true, banners: data || [] })
  } catch {
    return NextResponse.json({ success: true, banners: [] })
  }
}

// ── POST /api/hero-banners — superadmin: upload image + create record
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role")
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const file     = formData.get("image") as File | null
    const altText  = (formData.get("alt_text") as string)?.trim() || "Hero Banner"

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "Image file is required" }, { status: 400 })
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only JPEG, PNG or WebP images allowed" }, { status: 400 })
    }

    // Auto-create bucket if it doesn't exist
    await ensureBucket()

    // Get next sort_order
    const { data: existing } = await supabase
      .from("hero_banners")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

    // Upload to Supabase storage
    const ext         = file.name.split(".").pop() || "jpg"
    const storagePath = `banners/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ success: false, error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    const imageUrl = urlData.publicUrl

    // Insert DB record
    const { data, error } = await supabase
      .from("hero_banners")
      .insert({ alt_text: altText, image_url: imageUrl, storage_path: storagePath, sort_order: nextOrder })
      .select()
      .single()

    if (error) {
      await supabase.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banner: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
