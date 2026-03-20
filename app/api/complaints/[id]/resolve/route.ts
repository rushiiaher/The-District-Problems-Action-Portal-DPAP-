import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const actorId = request.headers.get("x-user-id")
    const { resolution_note } = await request.json()

    if (!resolution_note?.trim()) {
      return NextResponse.json({ success: false, error: "Resolution note is required" }, { status: 400 })
    }

    const { data: complaint } = await supabase.from("complaints").select("citizen_id").eq("id", id).single()

    await supabase.from("complaints").update({ status: "RESOLVED" }).eq("id", id)

    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: actorId,
      actor_role: "officer",
      action: "RESOLVED",
      remarks: resolution_note,
      timestamp: new Date().toISOString(),
    })

    // Notify citizen
    if (complaint?.citizen_id) {
      await supabase.from("notifications").insert({
        user_id: complaint.citizen_id,
        complaint_id: id,
        type: "RESOLVED",
        message: `Your complaint ${id} has been resolved. Please rate your experience within 7 days.`,
        read: false,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, status: "RESOLVED" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
