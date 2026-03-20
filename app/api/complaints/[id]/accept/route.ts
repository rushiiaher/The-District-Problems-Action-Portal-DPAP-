import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Accept complaint
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const actorId = request.headers.get("x-user-id")
    const { expected_date } = await request.json()

    await supabase.from("complaints").update({ status: "IN_PROGRESS" }).eq("id", id)

    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: actorId,
      actor_role: "officer",
      action: "ACCEPTED",
      remarks: expected_date ? `Expected resolution by ${new Date(expected_date).toLocaleDateString("en-IN")}` : "Complaint accepted and in progress",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, status: "IN_PROGRESS" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
