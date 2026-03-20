import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/red-cross — list applications (role-filtered)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const role   = request.headers.get("x-user-role")
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status") || ""

    let query = supabase
      .from("red_cross_applications")
      .select(`
        id, full_name, purpose, purpose_category, amount_requested, approved_amount,
        status, admin_remarks, payment_ref, created_at, reviewed_at, paid_at,
        district, block, village, mobile, documents,
        citizen_id
      `)
      .order("created_at", { ascending: false })

    // Role-based data scope
    if (role === "citizen") {
      query = query.eq("citizen_id", userId)
    } else if (role === "bank_manager") {
      query = query.in("status", ["APPROVED", "PAID"])
    }
    // superadmin / subadmin see all

    if (statusFilter) query = query.eq("status", statusFilter)

    const { data, error } = await query
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, applications: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/red-cross — citizen submits an application
export async function POST(request: NextRequest) {
  try {
    const citizenId = request.headers.get("x-user-id")
    const role      = request.headers.get("x-user-role")
    if (!citizenId || role !== "citizen") {
      return NextResponse.json({ success: false, error: "Only citizens can submit applications" }, { status: 403 })
    }

    const formData = await request.formData()
    const full_name        = formData.get("full_name") as string
    const father_name      = formData.get("father_name") as string
    const dob              = formData.get("dob") as string
    const gender           = formData.get("gender") as string
    const aadhaar          = formData.get("aadhaar") as string
    const mobile           = formData.get("mobile") as string
    const address          = formData.get("address") as string
    const district         = formData.get("district") as string
    const block            = formData.get("block") as string
    const village          = formData.get("village") as string
    const purpose          = formData.get("purpose") as string
    const purpose_category = formData.get("purpose_category") as string
    const amount_requested = formData.get("amount_requested") as string

    if (!full_name?.trim()) return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    if (!mobile?.trim())    return NextResponse.json({ success: false, error: "Mobile is required" }, { status: 400 })
    if (!address?.trim())   return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    if (!purpose?.trim())   return NextResponse.json({ success: false, error: "Purpose of aid is required" }, { status: 400 })

    // Upload documents to Supabase Storage
    const files = formData.getAll("documents") as File[]
    const docUrls: string[] = []

    for (const file of files.slice(0, 5)) {
      if (file.size > 5 * 1024 * 1024) continue
      const allowed = ["image/jpeg", "image/png", "application/pdf"]
      if (!allowed.includes(file.type)) continue

      const ext  = file.name.split(".").pop()
      const path = `${citizenId}/${Date.now()}-${crypto.randomUUID().slice(0,8)}.${ext}`
      const ab   = await file.arrayBuffer()

      const { data: up, error: upErr } = await supabase.storage
        .from("red-cross-docs")
        .upload(path, ab, { contentType: file.type, upsert: false })

      if (!upErr && up) {
        const { data: { publicUrl } } = supabase.storage.from("red-cross-docs").getPublicUrl(path)
        docUrls.push(publicUrl)
      }
    }

    const { data, error } = await supabase
      .from("red_cross_applications")
      .insert({
        citizen_id:       citizenId,
        full_name:        full_name.trim(),
        father_name:      father_name?.trim() || null,
        dob:              dob || null,
        gender:           gender || null,
        aadhaar:          aadhaar?.trim() || null,
        mobile:           mobile.trim(),
        address:          address.trim(),
        district:         district || null,
        block:            block || null,
        village:          village || null,
        purpose:          purpose.trim(),
        purpose_category: purpose_category || null,
        amount_requested: amount_requested ? parseFloat(amount_requested) : null,
        documents:        docUrls.length > 0 ? docUrls : null,
        status:           "PENDING",
        created_at:       new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, application_id: data.id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
