import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/hero-banners/all — superadmin: returns ALL banners (active + inactive)
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role")
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("hero_banners")
      .select("id, alt_text, image_url, sort_order, is_active, created_at")
      .order("sort_order", { ascending: true })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, banners: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
