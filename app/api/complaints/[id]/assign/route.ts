import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const actorId = request.headers.get("x-user-id")
    const actorRole = request.headers.get("x-user-role") || "subadmin"
    const { department_id, officer_id, note } = await request.json()

    if (!department_id || !officer_id) {
      return NextResponse.json({ success: false, error: "Department and officer are required" }, { status: 400 })
    }

    // Get department SLA
    const { data: dept } = await supabase.from("departments").select("sla_medium").eq("id", department_id).single()
    const slaHours = dept?.sla_medium || 240
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString()

    // Update complaint
    const { error: updateErr } = await supabase
      .from("complaints")
      .update({
        status: "ASSIGNED",
        assigned_dept_id: department_id,
        assigned_officer_id: officer_id,
        assigned_by: actorId,
        assignment_note: note || null,
        sla_deadline: slaDeadline,
        rejection_reason: null,
      })
      .eq("id", id)

    if (updateErr) return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })

    // Timeline
    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: actorId,
      actor_role: actorRole,
      action: "ASSIGNED",
      remarks: note ? `Assigned with note: ${note}` : "Complaint assigned to department and officer",
      timestamp: new Date().toISOString(),
    })

    // Notify officer
    await supabase.from("notifications").insert({
      user_id: officer_id,
      complaint_id: id,
      type: "ASSIGNMENT",
      message: `New complaint ${id} has been assigned to you. Please review.`,
      read: false,
      created_at: new Date().toISOString(),
    })

    // Audit log
    await supabase.from("audit_log").insert({
      actor_id: actorId,
      actor_role: actorRole,
      action: "ASSIGN_COMPLAINT",
      target_table: "complaints",
      target_id: id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, status: "ASSIGNED" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
