import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const citizenId = request.headers.get("x-user-id")
    const { reason } = await request.json()

    const { data: complaint } = await supabase
      .from("complaints")
      .select("reopen_count, status, assigned_officer_id, assigned_by")
      .eq("id", id)
      .single()

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 })
    }

    if (!["RESOLVED", "CLOSED"].includes(complaint.status)) {
      return NextResponse.json({ success: false, error: "Only resolved complaints can be reopened" }, { status: 400 })
    }

    if (complaint.reopen_count >= 3) {
      return NextResponse.json({ success: false, error: "Maximum reopen limit (3) reached" }, { status: 400 })
    }

    const newCount = (complaint.reopen_count || 0) + 1

    await supabase.from("complaints").update({
      status: "REOPENED",
      reopen_count: newCount,
    }).eq("id", id)

    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: citizenId,
      actor_role: "citizen",
      action: "REOPENED",
      remarks: reason || "Citizen was not satisfied with the resolution",
      timestamp: new Date().toISOString(),
    })

    // Notify officer and sub-admin
    const notifs = []
    if (complaint.assigned_officer_id) {
      notifs.push({ user_id: complaint.assigned_officer_id, complaint_id: id, type: "REOPENED", message: `Complaint ${id} has been reopened by the citizen. Reopen #${newCount}.`, read: false, created_at: new Date().toISOString() })
    }
    if (complaint.assigned_by) {
      notifs.push({ user_id: complaint.assigned_by, complaint_id: id, type: "REOPENED", message: `Complaint ${id} has been reopened (reopen #${newCount}).`, read: false, created_at: new Date().toISOString() })
    }
    if (notifs.length > 0) await supabase.from("notifications").insert(notifs)

    // 3rd reopen — notify superadmin
    if (newCount === 3) {
      const { data: admins } = await supabase.from("users").select("id").eq("role", "superadmin").limit(1)
      if (admins && admins.length > 0) {
        await supabase.from("notifications").insert({
          user_id: admins[0].id,
          complaint_id: id,
          type: "REOPEN_LIMIT",
          message: `Complaint ${id} has been reopened 3 times. Manual review required.`,
          read: false,
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true, status: "REOPENED", reopen_count: newCount })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
