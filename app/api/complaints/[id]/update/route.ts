import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Update progress remarks
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const actorId = request.headers.get("x-user-id")
    const { remarks } = await request.json()

    await supabase.from("complaint_timeline").insert({
      complaint_id: id,
      actor_id: actorId,
      actor_role: "officer",
      action: "PROGRESS_UPDATE",
      remarks: remarks || "Progress update added",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
