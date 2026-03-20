import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/citizen/profile — fetch own profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    // Support both UUID and mobile-number (legacy session fallback)
    const isUuid = /^[0-9a-f-]{36}$/i.test(userId)
    const query = supabase
      .from("users")
      .select("id, name, gender, mobile, alt_mobile, email, address, district, block, village, role, verified, created_at")
      .eq("role", "citizen")

    const { data, error } = await (isUuid
      ? query.eq("id", userId)
      : query.eq("mobile", userId)
    ).single()

    if (error || !data) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/citizen/profile — update own profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, gender, alt_mobile, email, address, district, block, village } = body

    // Validation
    if (!name?.trim())    return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    if (!gender)          return NextResponse.json({ success: false, error: "Gender is required" }, { status: 400 })
    if (!address?.trim()) return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    if (alt_mobile && !/^[6-9]\d{9}$/.test(alt_mobile)) {
      return NextResponse.json({ success: false, error: "Alternate mobile must be a valid 10-digit number" }, { status: 400 })
    }

    const isUuid = /^[0-9a-f-]{36}$/i.test(userId)

    // If userId is a mobile number (old session), first resolve the real UUID
    let resolvedId = userId
    if (!isUuid) {
      const { data: row } = await supabase
        .from("users")
        .select("id")
        .eq("mobile", userId)
        .eq("role", "citizen")
        .single()
      if (!row) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
      resolvedId = row.id
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        name:       name.trim(),
        gender,
        alt_mobile: alt_mobile || null,
        email:      email?.trim() || null,
        address:    address.trim(),
        district:   district || null,
        block:      block || null,
        village:    village || null,
      })
      .eq("id", resolvedId)
      .eq("role", "citizen")
      .select("id, name, gender, mobile, alt_mobile, email, address, district, block, village, role, verified")
      .single()

    if (error) {
      console.error("[PATCH /api/citizen/profile] Supabase error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Profile not found or update failed. Please log out and log in again." }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    console.error("[PATCH /api/citizen/profile] Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
