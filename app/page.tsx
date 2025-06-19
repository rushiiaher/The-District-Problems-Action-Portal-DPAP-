import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">DPAP</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/complaint/track">
                <Button>Track Complaint</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">District Problems & Action Portal</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform for citizens to submit complaints and for government officials to manage and
            resolve issues efficiently with role-based access control.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/complaint/submit">
              <Button size="lg" className="px-8">
                Submit Complaint
              </Button>
            </Link>
            <Link href="/complaint/track">
              <Button size="lg" variant="outline" className="px-8">
                Track Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Easy Complaint Filing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Submit complaints with location details, category selection, and file attachments
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Different dashboards for citizens, officers, collectors, and administrators
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track complaint status with unique ID and receive SMS/WhatsApp updates
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>SLA Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Automatic escalation when SLA time limits are breached</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">User Access Levels</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { role: "Citizen", access: "Submit & Track Complaints", color: "blue" },
              { role: "Department Officer", access: "Manage Department Complaints", color: "green" },
              { role: "Collector/CEO ZP", access: "District-wide Overview", color: "purple" },
              { role: "Clerk/Sub-Officer", access: "Update & Upload Proof", color: "orange" },
              { role: "Helpdesk", access: "Submit on Behalf of Citizens", color: "pink" },
              { role: "Super Admin", access: "Full System Management", color: "red" },
            ].map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.role}</CardTitle>
                    <Badge variant="secondary" className={`bg-${item.color}-100 text-${item.color}-800`}>
                      {item.role.split(" ")[0]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.access}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-6 w-6" />
              <span className="text-xl font-bold">DPAP</span>
            </div>
            <p className="text-gray-400">District Problems & Action Portal - Connecting Citizens with Government</p>
            <p className="text-gray-500 text-sm mt-4">© 2024 Government of India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
