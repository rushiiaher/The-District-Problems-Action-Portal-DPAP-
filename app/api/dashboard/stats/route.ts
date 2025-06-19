import { type NextRequest, NextResponse } from "next/server"

// Mock data for dashboard statistics
const mockStats = {
  citizen: {
    totalComplaints: 4,
    submitted: 1,
    inProgress: 1,
    resolved: 1,
    escalated: 1,
    recentActivity: [
      {
        id: "DPAP123456ABC",
        action: "Status updated to In Progress",
        timestamp: "2024-01-16T09:15:00Z",
      },
      {
        id: "DPAP789012DEF",
        action: "Complaint resolved",
        timestamp: "2024-01-12T16:45:00Z",
      },
    ],
  },
  officer: {
    assignedComplaints: 12,
    pendingAction: 5,
    completedToday: 3,
    slaBreached: 2,
    departmentStats: {
      "water-resources": 8,
      electricity: 4,
      roads: 6,
      sanitation: 3,
    },
  },
  collector: {
    totalComplaints: 156,
    byStatus: {
      submitted: 23,
      inProgress: 45,
      resolved: 78,
      escalated: 10,
    },
    byDepartment: {
      "water-resources": 45,
      electricity: 32,
      roads: 28,
      sanitation: 25,
      healthcare: 15,
      education: 11,
    },
    slaPerformance: {
      onTime: 85,
      breached: 15,
    },
    monthlyTrend: [
      { month: "Jan", complaints: 156 },
      { month: "Dec", complaints: 142 },
      { month: "Nov", complaints: 138 },
      { month: "Oct", complaints: 125 },
    ],
  },
  admin: {
    totalUsers: 1250,
    totalComplaints: 2340,
    systemHealth: 98.5,
    activeOfficers: 45,
    departmentPerformance: {
      "water-resources": 92,
      electricity: 88,
      roads: 85,
      sanitation: 90,
      healthcare: 87,
      education: 89,
    },
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")
  const department = searchParams.get("department")

  try {
    let stats = mockStats

    if (role && stats[role as keyof typeof stats]) {
      stats = { [role]: stats[role as keyof typeof stats] } as any
    }

    // Filter by department if specified
    if (department && role === "officer") {
      // Filter officer stats by department
      const officerStats = stats.officer as any
      officerStats.assignedComplaints = officerStats.departmentStats[department] || 0
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
