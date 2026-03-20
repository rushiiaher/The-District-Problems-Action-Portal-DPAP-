import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role")
    if (!["superadmin", "subadmin", "officer"].includes(role || "")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("departments")
      .select("id, name, code, head_name, officer_count, created_at")
      .order("name", { ascending: true })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, departments: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
