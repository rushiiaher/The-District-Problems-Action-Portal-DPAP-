import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendOtp } from "@/lib/msg91"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, gender, mobile, alt_mobile, email, address, district, block, village } = body

    // ── Validation ────────────────────────────────────────────────────────
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    }
    if (!gender) {
      return NextResponse.json({ success: false, error: "Gender is required" }, { status: 400 })
    }
    if (!address?.trim()) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 })
    }
    if (alt_mobile && !/^[6-9]\d{9}$/.test(alt_mobile)) {
      return NextResponse.json({ success: false, error: "Alternate number must be a valid 10-digit mobile number" }, { status: 400 })
    }
    if (alt_mobile && alt_mobile === mobile) {
      return NextResponse.json({ success: false, error: "Alternate number cannot match primary mobile" }, { status: 400 })
    }

    // ── Check for duplicate mobile in users table ─────────────────────────
    const { data: existing } = await supabase
      .from("users")
      .select("id, mobile")
      .eq("mobile", mobile)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This mobile number is already registered. Please login with OTP." },
        { status: 409 }
      )
    }

    // ── Insert citizen into users table ───────────────────────────────────
    const { error: insertError } = await supabase.from("users").insert({
      name:        name.trim(),
      gender,
      mobile,
      alt_mobile:  alt_mobile || null,
      email:       email?.trim() || null,
      address:     address.trim(),
      district:    district || "Anantnag",
      block:       block || null,
      village:     village || null,
      role:        "citizen",
      verified:    false,   // becomes true after OTP verified on first login
      created_at:  new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    // ── Send OTP ──────────────────────────────────────────────────────────
    const otpResult = await sendOtp(mobile)
    if (!otpResult.success) {
      // Roll back the insert if OTP fails
      await supabase.from("users").delete().eq("mobile", mobile)
      return NextResponse.json({ success: false, error: otpResult.error || "Failed to send OTP" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Account created. OTP sent to your mobile for verification.",
    })
  } catch (error) {
    console.error("[register] error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
