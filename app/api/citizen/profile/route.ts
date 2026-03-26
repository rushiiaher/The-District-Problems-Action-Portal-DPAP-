import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/citizen/profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const isUuid = /^[0-9a-f-]{36}$/i.test(userId)
    const query = supabase
      .from("users")
      .select("id, name, gender, mobile, alt_mobile, email, address, district, block, village, role, verified, created_at, aadhaar_no, profile_photo_url, passport_photo_url, aadhaar_card_url")
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

// PATCH /api/citizen/profile — supports both JSON (text fields) and FormData (with photo uploads)
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const contentType = request.headers.get("content-type") || ""
    let name = "", gender = "", alt_mobile = "", email = "", address = "",
        district = "", block = "", village = "", aadhaar_no = ""
    let profilePhotoFile: File | null = null
    let passportPhotoFile: File | null = null
    let aadhaarCardFile: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData()
      name       = (fd.get("name") as string) || ""
      gender     = (fd.get("gender") as string) || ""
      alt_mobile = (fd.get("alt_mobile") as string) || ""
      email      = (fd.get("email") as string) || ""
      address    = (fd.get("address") as string) || ""
      district   = (fd.get("district") as string) || ""
      block      = (fd.get("block") as string) || ""
      village    = (fd.get("village") as string) || ""
      aadhaar_no = (fd.get("aadhaar_no") as string) || ""
      profilePhotoFile  = fd.get("profile_photo") as File | null
      passportPhotoFile = fd.get("passport_photo") as File | null
      aadhaarCardFile   = fd.get("aadhaar_card") as File | null
    } else {
      const body = await request.json()
      ;({ name, gender, alt_mobile, email, address, district, block, village, aadhaar_no = "" } = body)
    }

    if (!name?.trim())    return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    if (!gender)          return NextResponse.json({ success: false, error: "Gender is required" }, { status: 400 })
    if (!address?.trim()) return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    if (alt_mobile && !/^[6-9]\d{9}$/.test(alt_mobile)) {
      return NextResponse.json({ success: false, error: "Alternate mobile must be a valid 10-digit number" }, { status: 400 })
    }
    if (aadhaar_no && !/^\d{12}$/.test(aadhaar_no)) {
      return NextResponse.json({ success: false, error: "Aadhaar number must be 12 digits" }, { status: 400 })
    }

    // Resolve UUID
    const isUuid = /^[0-9a-f-]{36}$/i.test(userId)
    let resolvedId = userId
    if (!isUuid) {
      const { data: row } = await supabase.from("users").select("id").eq("mobile", userId).eq("role", "citizen").single()
      if (!row) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
      resolvedId = row.id
    }

    // Upload documents helper
    const uploadFile = async (file: File, type: string): Promise<string | null> => {
      if (!file || !file.size) return null
      const allowed = ["image/jpeg", "image/png", "application/pdf"]
      if (!allowed.includes(file.type)) return null
      if (file.size > 5 * 1024 * 1024) return null
      const ext  = file.name.split(".").pop()
      const path = `${resolvedId}/${type}-${Date.now()}.${ext}`
      const ab   = await file.arrayBuffer()
      const { data: up, error: upErr } = await supabase.storage
        .from("profile-docs")
        .upload(path, ab, { contentType: file.type, upsert: true })
      if (upErr || !up) return null
      const { data: { publicUrl } } = supabase.storage.from("profile-docs").getPublicUrl(path)
      return publicUrl
    }

    const updates: Record<string, any> = {
      name:       name.trim(),
      gender,
      alt_mobile: alt_mobile || null,
      email:      email?.trim() || null,
      address:    address.trim(),
      district:   district || null,
      block:      block || null,
      village:    village || null,
      aadhaar_no: aadhaar_no || null,
    }

    if (profilePhotoFile?.size)  updates.profile_photo_url  = await uploadFile(profilePhotoFile, "profile")
    if (passportPhotoFile?.size) updates.passport_photo_url = await uploadFile(passportPhotoFile, "passport")
    if (aadhaarCardFile?.size)   updates.aadhaar_card_url   = await uploadFile(aadhaarCardFile, "aadhaar")

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", resolvedId)
      .eq("role", "citizen")
      .select("id, name, gender, mobile, alt_mobile, email, address, district, block, village, role, verified, aadhaar_no, profile_photo_url, passport_photo_url, aadhaar_card_url")
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ success: false, error: "Profile not found or update failed." }, { status: 404 })

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
