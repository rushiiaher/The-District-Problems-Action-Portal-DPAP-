import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const actorId = request.headers.get("x-user-id")
    const body = await request.json()

    const { data, error } = await supabase
      .from("departments")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    await supabase.from("audit_log").insert({
      actor_id: actorId,
      actor_role: "superadmin",
      action: "UPDATE_DEPARTMENT",
      target_table: "departments",
      target_id: id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, department: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { error } = await supabase.from("departments").update({ status: "inactive" }).eq("id", id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
