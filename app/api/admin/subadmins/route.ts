import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const ALLOWED_ROLES = ["subadmin", "officer", "bank_manager"]

// GET /api/admin/subadmins?role=subadmin|bank_manager|officer  (default: all staff)
export async function GET(request: NextRequest) {
  try {
    const callerRole = request.headers.get("x-user-role")
    if (callerRole !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const filterRole = new URL(request.url).searchParams.get("role") || ""

    let query = supabase
      .from("users")
      .select("id, name, username, role, department_id, designation, created_at")
      .in("role", ALLOWED_ROLES)
      .order("role", { ascending: true })
      .order("created_at", { ascending: false })

    if (filterRole && ALLOWED_ROLES.includes(filterRole)) {
      query = query.eq("role", filterRole)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    // Enrich with department names
    const deptIds = [...new Set((data || []).map((u: any) => u.department_id).filter(Boolean))]
    let deptMap: Record<string, string> = {}
    if (deptIds.length > 0) {
      const { data: depts } = await supabase.from("departments").select("id, name").in("id", deptIds)
      if (depts) depts.forEach((d: any) => { deptMap[d.id] = d.name })
    }

    const enriched = (data || []).map((u: any) => ({
      ...u,
      department_name: u.department_id ? (deptMap[u.department_id] || "Unknown") : null,
    }))

    return NextResponse.json({ success: true, staff: enriched })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/admin/subadmins — create any staff account
export async function POST(request: NextRequest) {
  try {
    const callerRole = request.headers.get("x-user-role")
    if (callerRole !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, username, password, designation, department_id, role } = body

    if (!name?.trim())     return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    if (!username?.trim()) return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role selected" }, { status: 400 })
    }

    // Default designations
    const defaultDesig: Record<string, string> = {
      subadmin:     "Sub Administrator",
      officer:      "Field Officer",
      bank_manager: "Bank Manager / Treasury Officer",
    }

    // Check username uniqueness
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
        role,
        designation:   designation?.trim() || defaultDesig[role],
        department_id: department_id || null,
        created_at:    new Date().toISOString(),
      })
      .select("id, name, username, role, designation, department_id, created_at")
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, staff: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/subadmins?id=...  — remove any staff (not superadmin, not citizen)
export async function DELETE(request: NextRequest) {
  try {
    const callerRole = request.headers.get("x-user-role")
    if (callerRole !== "superadmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const id = new URL(request.url).searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .in("role", ALLOWED_ROLES)   // safety: cannot delete superadmin or citizen

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
