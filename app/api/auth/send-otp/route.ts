import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendOtp } from "@/lib/msg91"

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json()

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: "Valid 10-digit Indian mobile number is required" }, { status: 400 })
    }

    const result = await sendOtp(mobile)

    if (!result.success) {
      // Dev fallback — store OTP 123456 directly
      const otp = "123456"
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
      await supabase.from("otps").upsert({ mobile, otp, expires_at: expiresAt, created_at: new Date().toISOString() })
      return NextResponse.json({ success: true, dev: true, message: "Dev OTP: 123456" })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
