import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, this would be MongoDB
const complaints: any[] = [
  {
    id: "DPAP123456ABC",
    subject: "Water Supply Issue in Residential Area",
    description: "There has been no water supply in our residential area for the past 3 days.",
    category: "water-supply",
    priority: "high",
    status: "in-progress",
    submittedBy: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    location: {
      district: "pune",
      block: "kothrud",
      village: "karve-nagar",
    },
    submittedDate: "2024-01-15T10:30:00Z",
    lastUpdated: "2024-01-16T09:15:00Z",
    assignedTo: "Priya Sharma",
    department: "water-resources",
    statusHistory: [
      {
        status: "submitted",
        timestamp: "2024-01-15T10:30:00Z",
        description: "Complaint submitted successfully",
      },
      {
        status: "in-progress",
        timestamp: "2024-01-15T14:20:00Z",
        description: "Complaint assigned to Water Resources Department",
        officer: "Priya Sharma",
      },
    ],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const status = searchParams.get("status")
  const department = searchParams.get("department")
  const userId = searchParams.get("userId")

  try {
    let filteredComplaints = complaints

    if (id) {
      filteredComplaints = complaints.filter((c) => c.id === id)
    }

    if (status) {
      filteredComplaints = filteredComplaints.filter((c) => c.status === status)
    }

    if (department) {
      filteredComplaints = filteredComplaints.filter((c) => c.department === department)
    }

    if (userId) {
      filteredComplaints = filteredComplaints.filter((c) => c.submittedBy === userId)
    }

    return NextResponse.json({
      success: true,
      data: filteredComplaints,
      total: filteredComplaints.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch complaints" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate complaint ID
    const generateId = () => {
      const prefix = "DPAP"
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.random().toString(36).substring(2, 5).toUpperCase()
      return `${prefix}${timestamp}${random}`
    }

    const newComplaint = {
      id: generateId(),
      ...body,
      status: "submitted",
      submittedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        {
          status: "submitted",
          timestamp: new Date().toISOString(),
          description: "Complaint submitted successfully",
        },
      ],
    }

    complaints.push(newComplaint)

    return NextResponse.json({
      success: true,
      data: newComplaint,
      message: "Complaint submitted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to submit complaint" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, actionTaken, officer, attachments } = body

    const complaintIndex = complaints.findIndex((c) => c.id === id)
    if (complaintIndex === -1) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 })
    }

    const complaint = complaints[complaintIndex]

    // Update complaint
    complaint.status = status
    complaint.lastUpdated = new Date().toISOString()

    if (officer) complaint.assignedTo = officer

    // Add to status history
    const statusUpdate = {
      status,
      timestamp: new Date().toISOString(),
      description: actionTaken || `Status updated to ${status}`,
      officer,
      attachments,
    }

    complaint.statusHistory.push(statusUpdate)
    complaints[complaintIndex] = complaint

    return NextResponse.json({
      success: true,
      data: complaint,
      message: "Complaint updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update complaint" }, { status: 500 })
  }
}
