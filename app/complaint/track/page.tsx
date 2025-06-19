"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Clock, CheckCircle, AlertCircle, FileText, User, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ComplaintStatus {
  id: string
  status: "submitted" | "in-progress" | "resolved" | "escalated"
  timestamp: string
  description: string
  officer?: string
  department?: string
  actionTaken?: string
  attachments?: string[]
}

interface ComplaintDetails {
  id: string
  subject: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  submittedBy: string
  phone: string
  location: string
  submittedDate: string
  currentStatus: "submitted" | "in-progress" | "resolved" | "escalated"
  assignedTo?: string
  department?: string
  slaDeadline: string
  statusHistory: ComplaintStatus[]
}

export default function TrackComplaintPage() {
  const [complaintId, setComplaintId] = useState("")
  const [complaintDetails, setComplaintDetails] = useState<ComplaintDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setComplaintId(id)
      handleSearch(id)
    }
  }, [searchParams])

  const mockComplaintData: ComplaintDetails = {
    id: "DPAP123456ABC",
    subject: "Water Supply Issue in Residential Area",
    description:
      "There has been no water supply in our residential area for the past 3 days. Multiple families are affected and we need immediate attention to resolve this issue.",
    category: "Water Supply",
    priority: "high",
    submittedBy: "Rajesh Kumar",
    phone: "9876543210",
    location: "Pune, Kothrud, Karve Nagar",
    submittedDate: "2024-01-15T10:30:00Z",
    currentStatus: "in-progress",
    assignedTo: "Priya Sharma",
    department: "Water Resources Department",
    slaDeadline: "2024-01-18T10:30:00Z",
    statusHistory: [
      {
        id: "1",
        status: "submitted",
        timestamp: "2024-01-15T10:30:00Z",
        description: "Complaint submitted successfully",
      },
      {
        id: "2",
        status: "in-progress",
        timestamp: "2024-01-15T14:20:00Z",
        description: "Complaint assigned to Water Resources Department",
        officer: "Priya Sharma",
        department: "Water Resources Department",
      },
      {
        id: "3",
        status: "in-progress",
        timestamp: "2024-01-16T09:15:00Z",
        description: "Site inspection completed. Issue identified with main pipeline.",
        officer: "Priya Sharma",
        actionTaken: "Technical team dispatched for pipeline repair",
        attachments: ["inspection_report.pdf", "site_photos.jpg"],
      },
    ],
  }

  const handleSearch = async (searchId?: string) => {
    const idToSearch = searchId || complaintId

    if (!idToSearch) {
      toast({
        title: "Missing Complaint ID",
        description: "Please enter a complaint ID to track",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setNotFound(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data - in real app, this would be an API call
      if (idToSearch.startsWith("DPAP")) {
        setComplaintDetails(mockComplaintData)
      } else {
        setNotFound(true)
        setComplaintDetails(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch complaint details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-orange-600" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "escalated":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateSLAStatus = (deadline: string) => {
    const now = new Date()
    const slaDate = new Date(deadline)
    const hoursRemaining = (slaDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursRemaining < 0) {
      return { status: "breached", text: "SLA Breached", color: "text-red-600" }
    } else if (hoursRemaining < 24) {
      return { status: "warning", text: `${Math.round(hoursRemaining)}h remaining`, color: "text-orange-600" }
    } else {
      return { status: "normal", text: `${Math.round(hoursRemaining / 24)}d remaining`, color: "text-green-600" }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Complaint</h1>
          <p className="text-gray-600">Enter your complaint ID to check the current status</p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Complaint</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="complaint-id" className="sr-only">
                  Complaint ID
                </Label>
                <Input
                  id="complaint-id"
                  placeholder="Enter complaint ID (e.g., DPAP123456ABC)"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={loading}>
                {loading ? "Searching..." : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Card className="mb-8">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complaint Not Found</h3>
              <p className="text-gray-600 mb-4">
                No complaint found with ID: <code className="bg-gray-100 px-2 py-1 rounded">{complaintId}</code>
              </p>
              <p className="text-sm text-gray-500">
                Please check the complaint ID and try again, or contact support if you need assistance.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Complaint Details */}
        {complaintDetails && (
          <div className="space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{complaintDetails.subject}</CardTitle>
                    <CardDescription className="mt-2">
                      Complaint ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{complaintDetails.id}</code>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(complaintDetails.currentStatus)}>
                      {complaintDetails.currentStatus.replace("-", " ").toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(complaintDetails.priority)}>
                      {complaintDetails.priority.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Submitted by</p>
                        <p className="text-gray-600">{complaintDetails.submittedBy}</p>
                        <p className="text-sm text-gray-500">{complaintDetails.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{complaintDetails.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Submitted on</p>
                        <p className="text-gray-600">{formatDate(complaintDetails.submittedDate)}</p>
                      </div>
                    </div>

                    {complaintDetails.assignedTo && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Assigned to</p>
                          <p className="text-gray-600">{complaintDetails.assignedTo}</p>
                          <p className="text-sm text-gray-500">{complaintDetails.department}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="font-medium mb-2">Description</p>
                  <p className="text-gray-600">{complaintDetails.description}</p>
                </div>

                {complaintDetails.slaDeadline && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium">SLA Status</span>
                      <span className={`font-medium ${calculateSLAStatus(complaintDetails.slaDeadline).color}`}>
                        {calculateSLAStatus(complaintDetails.slaDeadline).text}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
                <CardDescription>Track the progress of your complaint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complaintDetails.statusHistory.map((status, index) => (
                    <div key={status.id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200">
                          {getStatusIcon(status.status)}
                        </div>
                        {index < complaintDetails.statusHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={`${getStatusColor(status.status)} text-xs`}>
                            {status.status.replace("-", " ").toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(status.timestamp)}</span>
                        </div>

                        <p className="text-gray-900 mb-2">{status.description}</p>

                        {status.officer && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Officer:</span> {status.officer}
                            {status.department && ` (${status.department})`}
                          </p>
                        )}

                        {status.actionTaken && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Action Taken:</span> {status.actionTaken}
                          </p>
                        )}

                        {status.attachments && status.attachments.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {status.attachments.map((attachment, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/complaint/submit">
            <Button variant="outline">Submit New Complaint</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
