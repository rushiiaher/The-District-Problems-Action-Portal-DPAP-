import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// ── PATCH /api/hero-banners/[id] — update alt_text, is_active, sort_order
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get("x-user-role")
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const updates: Record<string, any> = {}

    if (typeof body.alt_text   === "string")  updates.alt_text   = body.alt_text.trim()
    if (typeof body.is_active  === "boolean") updates.is_active  = body.is_active
    if (typeof body.sort_order === "number")  updates.sort_order = body.sort_order

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("hero_banners")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, banner: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// ── DELETE /api/hero-banners/[id] — delete from storage + DB
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get("x-user-role")
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Fetch storage_path first
    const { data: banner, error: fetchError } = await supabase
      .from("hero_banners")
      .select("storage_path")
      .eq("id", params.id)
      .single()

    if (fetchError || !banner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 })
    }

    // Delete from storage if path exists
    if (banner.storage_path) {
      await supabase.storage.from("hero-banners").remove([banner.storage_path])
    }

    // Delete DB record
    const { error } = await supabase.from("hero_banners").delete().eq("id", params.id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
