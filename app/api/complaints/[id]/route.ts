import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// ── GET /api/complaints/[id] ───────────────────────────────────────────────
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const isPublic = new URL(request.url).searchParams.get("public") === "true"

    const { data: complaint, error } = await supabase
      .from("complaints")
      .select(`
        id, category, status, priority, created_at, block, village, district, description,
        reopen_count, has_attachments, sla_deadline, assignment_note, rejection_reason,
        citizen_id, assigned_dept_id, assigned_officer_id,
        departments:assigned_dept_id (name)
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 })
    }

    // Fetch officer details separately to avoid PostgREST join ambiguity
    let assignedOfficerName: string | null = null
    let assignedOfficerDesignation: string | null = null
    if ((complaint as any).assigned_officer_id) {
      const { data: officer } = await supabase
        .from("users")
        .select("name, designation")
        .eq("id", (complaint as any).assigned_officer_id)
        .maybeSingle()
      assignedOfficerName        = officer?.name || null
      assignedOfficerDesignation = officer?.designation || null
    }

    const sanitized = {
      ...complaint,
      assigned_dept_name:           (complaint as any).departments?.name,
      assigned_officer_name:        assignedOfficerName,
      assigned_officer_designation: assignedOfficerDesignation,
      departments: undefined,
      ...(isPublic ? { citizen_id: undefined } : {}),
    }

    // Fetch timeline
    const { data: timeline } = await supabase
      .from("complaint_timeline")
      .select("id, actor_id, actor_role, action, remarks, timestamp")
      .eq("complaint_id", id)
      .order("timestamp", { ascending: true })

    // Fetch attachments
    const { data: attachments } = await supabase
      .from("complaint_attachments")
      .select("id, file_url, file_type, created_at")
      .eq("complaint_id", id)
      .order("created_at", { ascending: true })

    // Fetch citizen info (non-public only)
    let citizen = null
    if (!isPublic && sanitized.citizen_id) {
      const { data: c } = await supabase
        .from("users")
        .select("name, mobile, address, block, village, district")
        .eq("id", sanitized.citizen_id)
        .single()
      citizen = c
    }

    return NextResponse.json({
      success: true,
      complaint: sanitized,
      timeline: timeline || [],
      attachments: attachments || [],
      citizen,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
