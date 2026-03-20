import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id")
    const role   = request.headers.get("x-user-role")
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("red_cross_applications")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !data) return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })

    // Citizens can only see their own
    if (role === "citizen" && data.citizen_id !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    // Fetch citizen name
    let citizen = null
    if (role !== "citizen") {
      const { data: c } = await supabase
        .from("users")
        .select("name, mobile, address")
        .eq("id", data.citizen_id)
        .single()
      citizen = c
    }

    return NextResponse.json({ success: true, application: data, citizen })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
