import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const actorId = request.headers.get("x-user-id")
    const { reason } = await request.json()

    if (!reason?.trim()) {
      return NextResponse.json({ success: false, error: "Rejection reason is required" }, { status: 400 })
    }

    // Get complaint to find sub-admin notif
    const { data: complaint } = await supabase.from("complaints").select("assigned_by, citizen_id").eq("id", id).single()

    await supabase.from("complaints").update({
      status: "REASSIGNED",
      rejection_reason: reason,
      assigned_officer_id: null,
    }).eq("id", id)

    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: actorId,
      actor_role: "officer",
      action: "REJECTED",
      remarks: reason,
      timestamp: new Date().toISOString(),
    })

    // Notify Sub-Admin
    if (complaint?.assigned_by) {
      await supabase.from("notifications").insert({
        user_id: complaint.assigned_by,
        complaint_id: id,
        type: "OFFICER_REJECTION",
        message: `Complaint ${id} was rejected by officer: ${reason}. Please reassign.`,
        read: false,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, status: "REASSIGNED" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
