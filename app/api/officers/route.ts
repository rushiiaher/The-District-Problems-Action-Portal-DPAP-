import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/officers?department_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department_id = searchParams.get("department_id")

    let query = supabase
      .from("users")
      .select("id, name, username, designation, employee_id, department_id, created_at")
      .eq("role", "officer")
      .order("name", { ascending: true })

    if (department_id) query = query.eq("department_id", department_id)

    const { data: officers, error } = await query
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    // Open complaint counts
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

    // Department names
    const deptIds = [...new Set((officers || []).map((o: any) => o.department_id).filter(Boolean))]
    let deptMap: Record<string, string> = {}
    if (deptIds.length > 0) {
      const { data: depts } = await supabase.from("departments").select("id, name").in("id", deptIds)
      if (depts) depts.forEach((d: any) => { deptMap[d.id] = d.name })
    }

    const enriched = (officers || []).map((o: any) => ({
      ...o,
      open_count: openCounts[o.id] || 0,
      department_name: o.department_id ? (deptMap[o.department_id] || "Unknown") : null,
    }))

    return NextResponse.json({ success: true, officers: enriched })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/officers — create officer
export async function POST(request: NextRequest) {
  try {
    const callerRole = request.headers.get("x-user-role")
    if (callerRole !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, username, password, designation, employee_id, department_id } = body

    if (!name?.trim())     return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    if (!username?.trim()) return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }
    if (!department_id) return NextResponse.json({ success: false, error: "Department is required" }, { status: 400 })

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: "Username already taken. Choose a different one." }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        name:          name.trim(),
        username:      username.trim().toLowerCase(),
        password_hash: password,
        role:          "officer",
        designation:   designation?.trim() || "Field Officer",
        employee_id:   employee_id?.trim() || null,
        department_id,
        created_at:    new Date().toISOString(),
      })
      .select("id, name, username, designation, employee_id, department_id, created_at")
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, officer: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/officers — reset officer password
export async function PATCH(request: NextRequest) {
  try {
    const callerRole = request.headers.get("x-user-role")
    if (callerRole !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { id, password } = body

    if (!id) return NextResponse.json({ success: false, error: "Officer ID is required" }, { status: 400 })
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const { data: target } = await supabase
      .from("users").select("id").eq("id", id).eq("role", "officer").maybeSingle()

    if (!target) return NextResponse.json({ success: false, error: "Officer not found" }, { status: 404 })

    const { error } = await supabase.from("users").update({ password_hash: password }).eq("id", id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/officers?id=...
export async function DELETE(request: NextRequest) {
  try {
    const callerRole = request.headers.get("x-user-role")
    if (callerRole !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = new URL(request.url).searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })

    const { error } = await supabase.from("users").delete().eq("id", id).eq("role", "officer")
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
