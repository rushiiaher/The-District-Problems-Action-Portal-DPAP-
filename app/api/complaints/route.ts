import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// ── GET /api/complaints ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citizen  = searchParams.get("citizen")  === "true"
    const officer  = searchParams.get("officer")  === "true"
    const all      = searchParams.get("all")      === "true"  // superadmin — no filter
    const status   = searchParams.get("status")
    const limit    = parseInt(searchParams.get("limit") || (all ? "1000" : "50"))

    const userId = request.headers.get("x-user-id")

    let query = supabase
      .from("complaints")
      .select(`
        id, category, status, priority, created_at, block, village, description,
        reopen_count, has_attachments, sla_deadline,
        assigned_dept_id, assigned_officer_id,
        departments:assigned_dept_id (name),
        citizen:citizen_id (name, mobile),
        rejection_reason, assignment_note
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      const statuses = status.split(",")
      query = statuses.length === 1
        ? query.eq("status", statuses[0])
        : query.in("status", statuses)
    }

    // Role-based filtering (superadmin with all=true skips both)
    if (citizen && userId) query = query.eq("citizen_id", userId)
    if (officer && userId) query = query.eq("assigned_officer_id", userId)

    const { data, error } = await query

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    const complaints = (data || []).map((c: any) => ({
      ...c,
      department_name: c.departments?.name,
      assigned_dept_name: c.departments?.name,
      citizen_name: c.citizen?.name || null,
      citizen_mobile: c.citizen?.mobile || null,
      departments: undefined,
      citizen: undefined,
    }))

    return NextResponse.json({ success: true, complaints })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// ── POST /api/complaints ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const citizenId = request.headers.get("x-user-id")

    if (!citizenId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const block = formData.get("block") as string
    const village = formData.get("village") as string
    const priority = (formData.get("priority") as string) || "MEDIUM"
    const confirmDuplicate = formData.get("confirm_duplicate") === "true"

    if (!category || !description || !block || !village) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Duplicate check
    if (!confirmDuplicate) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: dup } = await supabase
        .from("complaints")
        .select("id")
        .eq("citizen_id", citizenId)
        .eq("category", category)
        .eq("village", village)
        .gte("created_at", sevenDaysAgo)
        .limit(1)

      if (dup && dup.length > 0) {
        return NextResponse.json({ duplicate: true, existing_id: dup[0].id })
      }
    }

    // Generate complaint ID
    const year = new Date().getFullYear()
    const { count } = await supabase.from("complaints").select("*", { count: "exact", head: true })
    const seq = String((count || 0) + 1).padStart(6, "0")
    const complaintId = `ARZ-${year}-${seq}`

    // File uploads
    const files = formData.getAll("files") as File[]
    const hasAttachments = files.length > 0
    const attachmentUrls: string[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) continue
      const allowed = ["image/jpeg", "image/png", "application/pdf"]
      if (!allowed.includes(file.type)) continue

      const ext = file.name.split(".").pop()
      const path = `complaints/${complaintId}/${crypto.randomUUID()}.${ext}`
      const arrayBuffer = await file.arrayBuffer()
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("complaint-attachments")
        .upload(path, arrayBuffer, { contentType: file.type })

      if (!uploadErr && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("complaint-attachments").getPublicUrl(path)
        attachmentUrls.push(publicUrl)
      }
    }

    // Insert complaint
    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert({
        id: complaintId,
        citizen_id: citizenId,
        category, description, block, village, priority,
        status: "SUBMITTED",
        reopen_count: 0,
        has_attachments: hasAttachments,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    // Insert attachments
    if (attachmentUrls.length > 0) {
      await supabase.from("complaint_attachments").insert(
        attachmentUrls.map(url => ({ complaint_id: complaintId, file_url: url, uploaded_by: citizenId, created_at: new Date().toISOString() }))
      )
    }

    // Timeline event
    await supabase.from("complaint_timeline").insert({
      complaint_id: complaintId,
      actor_id: citizenId,
      actor_role: "citizen",
      action: "SUBMITTED",
      remarks: "Complaint submitted by citizen",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, complaint_id: complaintId })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
