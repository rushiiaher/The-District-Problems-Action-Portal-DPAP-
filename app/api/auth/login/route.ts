import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyOtp } from "@/lib/msg91"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, otp, username, password } = body

    // ── Citizen OTP login ──────────────────────────────────────
    if (mobile && otp) {
      const verification = await verifyOtp(mobile, otp)
      if (!verification.success) {
        return NextResponse.json({ success: false, error: verification.error }, { status: 400 })
      }

      // Find or create the citizen row
      let { data: citizenUser } = await supabase
        .from("users")
        .select("id, name, mobile, role, gender, address, district, block, village, email, alt_mobile, verified")
        .eq("mobile", mobile)
        .eq("role", "citizen")
        .maybeSingle()

      if (!citizenUser) {
        // First-time OTP login for a citizen who registered via the form
        // (should not happen normally — register creates the row first)
        const { data: newUser } = await supabase
          .from("users")
          .insert({ mobile, role: "citizen", verified: true, created_at: new Date().toISOString() })
          .select("id, name, mobile, role, gender, address, district, block, village, email, alt_mobile, verified")
          .single()
        citizenUser = newUser
      } else if (!citizenUser.verified) {
        // Mark verified on first successful OTP
        await supabase.from("users").update({ verified: true }).eq("id", citizenUser.id)
        citizenUser = { ...citizenUser, verified: true }
      }

      if (!citizenUser) {
        return NextResponse.json({ success: false, error: "Could not create or find citizen record" }, { status: 500 })
      }

      // Return the full profile so auth context has address etc.
      const user = {
        id:         citizenUser.id,          // always the real UUID
        mobile:     citizenUser.mobile,
        name:       citizenUser.name || null,
        role:       "citizen" as const,
        gender:     citizenUser.gender || null,
        address:    citizenUser.address || null,
        district:   citizenUser.district || null,
        block:      citizenUser.block || null,
        village:    citizenUser.village || null,
        email:      citizenUser.email || null,
        alt_mobile: citizenUser.alt_mobile || null,
        verified:   citizenUser.verified || false,
      }
      return NextResponse.json({ success: true, user })
    }

    // ── Staff login ────────────────────────────────────────────
    if (username && password) {
      const { data: staffUser, error } = await supabase
        .from("users")
        .select("id, name, role, mobile, department_id, employee_id, designation")
        .eq("username", username)
        .in("role", ["superadmin", "subadmin", "officer", "bank_manager"])
        .maybeSingle()

      if (error || !staffUser) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      // Check password against password_hash field
      const { data: pwdRow } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", staffUser.id)
        .single()

      // Simple comparison (production should use bcrypt)
      if (!pwdRow || pwdRow.password_hash !== password) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      // Fetch department name if officer
      let department_name: string | undefined
      if (staffUser.department_id) {
        const { data: dept } = await supabase.from("departments").select("name").eq("id", staffUser.department_id).single()
        department_name = dept?.name
      }

      const user = { ...staffUser, department_name }
      return NextResponse.json({ success: true, user })
    }

    return NextResponse.json({ success: false, error: "Invalid login payload" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
