import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/officers?department_id=xxx — list officers in a department with their open complaint count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department_id = searchParams.get("department_id")

    let query = supabase
      .from("users")
      .select("id, name, designation, employee_id, department_id")
      .eq("role", "officer")
      .order("name", { ascending: true })

    if (department_id) query = query.eq("department_id", department_id)

    const { data: officers, error } = await query
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    // Attach open complaint count per officer
    const ids = (officers || []).map((o: any) => o.id)
    let openCounts: Record<string, number> = {}

    if (ids.length > 0) {
      const { data: openComplaints } = await supabase
        .from("complaints")
        .select("assigned_officer_id")
        .in("assigned_officer_id", ids)
        .in("status", ["ASSIGNED", "IN_PROGRESS", "ESCALATED"])

      if (openComplaints) {
        for (const row of openComplaints) {
          openCounts[row.assigned_officer_id] = (openCounts[row.assigned_officer_id] || 0) + 1
        }
      }
    }

    const enriched = (officers || []).map((o: any) => ({
      ...o,
      open_count: openCounts[o.id] || 0,
    }))

    return NextResponse.json({ success: true, officers: enriched })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
