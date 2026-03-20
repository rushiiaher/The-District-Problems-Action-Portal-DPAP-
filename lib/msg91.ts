import { supabase } from "@/lib/supabase"

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!
const MSG91_SENDER = process.env.MSG91_SENDER!
const MSG91_DLT_TE_ID = process.env.MSG91_DLT_TE_ID!
const MSG91_ROUTE = "4"
const MSG91_COUNTRY = "91"

export async function sendOtp(mobile: string): Promise<{ success: boolean; error?: string }> {
  const otp = String(Math.floor(1000 + Math.random() * 9000))

  const message = encodeURIComponent(
    `Your OTP for e-Arzi portal is ${otp}. Kindly don't share this OTP with anyone. Regards District Administration Srinagar`
  )

  const url =
    `http://api.msg91.com/api/sendhttp.php` +
    `?sender=${MSG91_SENDER}` +
    `&route=${MSG91_ROUTE}` +
    `&mobiles=${mobile}` +
    `&authkey=${MSG91_AUTH_KEY}` +
    `&country=${MSG91_COUNTRY}` +
    `&DLT_TE_ID=${MSG91_DLT_TE_ID}` +
    `&message=${message}`

  const response = await fetch(url)
  if (!response.ok) {
    return { success: false, error: "Failed to send OTP via MSG91" }
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  // Upsert OTP into Supabase otps table
  const { error } = await supabase
    .from("otps")
    .upsert({ mobile, otp, expires_at: expiresAt, created_at: new Date().toISOString() })

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function verifyOtp(mobile: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("otps")
    .select("*")
    .eq("mobile", mobile)
    .single()

  if (error || !data) {
    return { success: false, error: "OTP not found. Please request a new one." }
  }

  if (new Date() > new Date(data.expires_at)) {
    await supabase.from("otps").delete().eq("mobile", mobile)
    return { success: false, error: "OTP has expired. Please request a new one." }
  }

  if (data.otp !== otp) {
    return { success: false, error: "Invalid OTP" }
  }

  await supabase.from("otps").delete().eq("mobile", mobile)

  return { success: true }
}
