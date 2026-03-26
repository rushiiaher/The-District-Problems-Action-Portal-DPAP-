import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/complaints/[id]/messages
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const role   = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!userId || !role) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    // Verify access: citizen must own the complaint; officer must be assigned; admin/subadmin always OK
    if (role === "citizen") {
      const { data: c } = await supabase.from("complaints").select("citizen_id").eq("id", id).maybeSingle()
      if (!c || c.citizen_id !== userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    } else if (role === "officer") {
      const { data: c } = await supabase.from("complaints").select("assigned_officer_id").eq("id", id).maybeSingle()
      if (!c || c.assigned_officer_id !== userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("complaint_messages")
      .select("id, sender_id, sender_role, sender_name, message, document_urls, is_request, created_at")
      .eq("complaint_id", id)
      .order("created_at", { ascending: true })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, messages: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/complaints/[id]/messages
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const role   = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!userId || !role) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    // Only officer, citizen, superadmin, subadmin can message
    const allowed = ["officer", "citizen", "superadmin", "subadmin"]
    if (!allowed.includes(role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Verify access
    if (role === "citizen") {
      const { data: c } = await supabase.from("complaints").select("citizen_id").eq("id", id).maybeSingle()
      if (!c || c.citizen_id !== userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    } else if (role === "officer") {
      const { data: c } = await supabase.from("complaints").select("assigned_officer_id").eq("id", id).maybeSingle()
      if (!c || c.assigned_officer_id !== userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const message    = (formData.get("message") as string)?.trim()
    const is_request = formData.get("is_request") === "true"  // officer flagging as doc request

    if (!message) return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })

    // Get sender name
    const { data: sender } = await supabase.from("users").select("name").eq("id", userId).maybeSingle()
    const sender_name = sender?.name || role

    // Upload any attached documents
    const files = formData.getAll("documents") as File[]
    const docUrls: string[] = []
    for (const file of files.slice(0, 5)) {
      if (file.size > 5 * 1024 * 1024) continue
      const allowed = ["image/jpeg", "image/png", "application/pdf"]
      if (!allowed.includes(file.type)) continue
      const ext  = file.name.split(".").pop()
      const path = `${id}/${userId}/${Date.now()}.${ext}`
      const ab   = await file.arrayBuffer()
      const { data: up, error: upErr } = await supabase.storage
        .from("complaint-messages")
        .upload(path, ab, { contentType: file.type, upsert: false })
      if (!upErr && up) {
        const { data: { publicUrl } } = supabase.storage.from("complaint-messages").getPublicUrl(path)
        docUrls.push(publicUrl)
      }
    }

    const { data, error } = await supabase
      .from("complaint_messages")
      .insert({
        complaint_id:  id,
        sender_id:     userId,
        sender_role:   role,
        sender_name,
        message,
        document_urls: docUrls.length > 0 ? docUrls : null,
        is_request:    role === "officer" ? is_request : false,
        created_at:    new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
