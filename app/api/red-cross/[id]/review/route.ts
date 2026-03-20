import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// PATCH /api/red-cross/[id]/review — admin approve or reject
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actorId = request.headers.get("x-user-id")
    const role    = request.headers.get("x-user-role")

    if (!["superadmin", "subadmin"].includes(role || "")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { action, approved_amount, admin_remarks } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "action must be 'approve' or 'reject'" }, { status: 400 })
    }

    if (action === "approve" && (!approved_amount || parseFloat(approved_amount) <= 0)) {
      return NextResponse.json({ success: false, error: "Approved amount is required and must be greater than 0" }, { status: 400 })
    }

    const update: Record<string, any> = {
      status:      action === "approve" ? "APPROVED" : "REJECTED",
      admin_remarks: admin_remarks?.trim() || null,
      reviewed_by: actorId,
      reviewed_at: new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    }

    if (action === "approve") {
      update.approved_amount = parseFloat(approved_amount)
    }

    const { data, error } = await supabase
      .from("red_cross_applications")
      .update(update)
      .eq("id", params.id)
      .select("id, status, approved_amount")
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, application: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
