import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const citizenId = request.headers.get("x-user-id")
    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be 1–5" }, { status: 400 })
    }

    // Insert feedback
    await supabase.from("feedback").insert({
      complaint_id: id,
      citizen_id: citizenId,
      rating,
      comment: comment || null,
      created_at: new Date().toISOString(),
    })

    // Close the complaint
    await supabase.from("complaints").update({ status: "CLOSED", has_feedback: true }).eq("id", id)

    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: citizenId,
      actor_role: "citizen",
      action: "CLOSED",
      remarks: `Citizen rated ${rating}/5${comment ? `: ${comment}` : ""}`,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
