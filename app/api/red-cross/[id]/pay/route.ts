import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// PATCH /api/red-cross/[id]/pay — bank manager marks payment as done
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actorId = request.headers.get("x-user-id")
    const role    = request.headers.get("x-user-role")

    if (role !== "bank_manager") {
      return NextResponse.json({ success: false, error: "Only bank managers can process payments" }, { status: 403 })
    }

    const { payment_ref } = await request.json()
    if (!payment_ref?.trim()) {
      return NextResponse.json({ success: false, error: "Payment reference number is required" }, { status: 400 })
    }

    // Verify application is APPROVED before paying
    const { data: existing } = await supabase
      .from("red_cross_applications")
      .select("status")
      .eq("id", params.id)
      .single()

    if (!existing) return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    if (existing.status !== "APPROVED") {
      return NextResponse.json({ success: false, error: "Only APPROVED applications can be marked as paid" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("red_cross_applications")
      .update({
        status:      "PAID",
        payment_ref: payment_ref.trim(),
        paid_by:     actorId,
        paid_at:     new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      })
      .eq("id", params.id)
      .select("id, status, payment_ref, paid_at")
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, application: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
