import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("departments")
      .select("id, name, code, description, sla_high, sla_medium, sla_low, status, created_at")
      .order("name")

    if (status === "active") query = query.eq("status", "active")

    const { data, error } = await query
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    // Enrich with officer and open complaint counts
    const enriched = await Promise.all((data || []).map(async (d) => {
      const [{ count: officerCount }, { count: openCount }] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("department_id", d.id).eq("role", "officer"),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("assigned_dept_id", d.id).in("status", ["ASSIGNED", "IN_PROGRESS", "ESCALATED"]),
      ])
      return { ...d, officer_count: officerCount || 0, open_count: openCount || 0 }
    }))

    return NextResponse.json({ success: true, departments: enriched })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const actorId = request.headers.get("x-user-id")
    const body = await request.json()
    const { name, code, description, sla_high, sla_medium, sla_low } = body

    if (!name || !code) {
      return NextResponse.json({ success: false, error: "Name and code are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("departments")
      .insert({
        name, code: code.toUpperCase(), description: description || null,
        sla_high: sla_high || 24,
        sla_medium: sla_medium || 48,
        sla_low: sla_low || 72,
        status: "active",
        created_by: actorId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    await supabase.from("audit_log").insert({
      actor_id: actorId,
      actor_role: "superadmin",
      action: "CREATE_DEPARTMENT",
      target_table: "departments",
      target_id: data.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, department: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
