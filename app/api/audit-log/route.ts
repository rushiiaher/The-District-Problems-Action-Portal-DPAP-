import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit  = parseInt(searchParams.get("limit") || "200")
    const action = searchParams.get("action")
    const role   = searchParams.get("role")

    let query = supabase
      .from("audit_log")
      .select("id, actor_id, actor_role, action, target_table, target_id, old_value, new_value, ip, timestamp")
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (action) query = query.eq("action", action)
    if (role)   query = query.eq("actor_role", role)

    const { data, error } = await query

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, logs: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
