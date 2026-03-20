import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role")
    if (!["superadmin", "subadmin"].includes(role || "")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const q        = searchParams.get("q")?.trim() || ""
    const district = searchParams.get("district") || ""
    const block    = searchParams.get("block") || ""
    const page     = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit    = 25
    const offset   = (page - 1) * limit

    let query = supabase
      .from("users")
      .select("id, name, mobile, alt_mobile, email, gender, address, district, block, village, created_at", { count: "exact" })
      .eq("role", "citizen")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,mobile.ilike.%${q}%,email.ilike.%${q}%,address.ilike.%${q}%,village.ilike.%${q}%`
      )
    }
    if (district) query = query.eq("district", district)
    if (block)    query = query.eq("block", block)

    const { data: citizens, error, count } = await query
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    // Fetch complaint counts for all citizen IDs on this page in one query
    const citizenIds = (citizens || []).map((c: any) => c.id)
    let complaintCounts: Record<string, number> = {}

    if (citizenIds.length > 0) {
      const { data: complaints } = await supabase
        .from("complaints")
        .select("citizen_id")
        .in("citizen_id", citizenIds)

      if (complaints) {
        for (const row of complaints) {
          complaintCounts[row.citizen_id] = (complaintCounts[row.citizen_id] || 0) + 1
        }
      }
    }

    // Attach complaint count to each citizen
    const enriched = (citizens || []).map((c: any) => ({
      ...c,
      complaints_filed: complaintCounts[c.id] || 0,
    }))

    return NextResponse.json({
      success: true,
      citizens: enriched,
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
