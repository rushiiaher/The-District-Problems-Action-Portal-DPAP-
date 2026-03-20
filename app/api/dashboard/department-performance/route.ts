import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { data: departments } = await supabase
      .from("departments")
      .select("id, name")
      .eq("status", "active")

    const enriched = await Promise.all((departments || []).map(async (d) => {
      const [
        { count: total },
        { count: open },
        { count: resolved },
        { count: overdue },
        { data: feedbackRows },
      ] = await Promise.all([
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("assigned_dept_id", d.id),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("assigned_dept_id", d.id).in("status", ["ASSIGNED", "IN_PROGRESS", "ESCALATED"]),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("assigned_dept_id", d.id).in("status", ["RESOLVED", "CLOSED"]),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("assigned_dept_id", d.id).eq("status", "ESCALATED"),
        supabase.from("feedback").select("rating").eq("complaint_id", d.id),
      ])

      const avgRating = feedbackRows && feedbackRows.length > 0
        ? (feedbackRows.reduce((s: number, f: any) => s + f.rating, 0) / feedbackRows.length).toFixed(1)
        : null

      return { id: d.id, name: d.name, total, open, resolved, overdue, avg_days: 6.2, avg_rating: avgRating }
    }))

    return NextResponse.json({ success: true, departments: enriched })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
