"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Phone, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setOtpSent(true)
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store user session
      localStorage.setItem(
        "user",
        JSON.stringify({
          phone: phoneNumber,
          role: "citizen",
          loginTime: new Date().toISOString(),
        }),
      )

      toast({
        title: "Login Successful",
        description: "Welcome to DPAP!",
      })

      router.push("/citizen/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOfficerLogin = async () => {
    if (!email || !password || !userRole) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate officer login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store user session
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          role: userRole,
          loginTime: new Date().toISOString(),
        }),
      )

      toast({
        title: "Login Successful",
        description: `Welcome, ${userRole}!`,
      })

      // Redirect based on role
      const dashboardRoutes = {
        "super-admin": "/admin/dashboard",
        collector: "/collector/dashboard",
        "department-officer": "/officer/dashboard",
        clerk: "/clerk/dashboard",
        helpdesk: "/helpdesk/dashboard",
      }

      router.push(dashboardRoutes[userRole as keyof typeof dashboardRoutes] || "/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">DPAP</h1>
          </div>
          <p className="text-gray-600">District Problems & Action Portal</p>
        </div>

        <Tabs defaultValue="citizen" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="citizen" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Citizen</span>
            </TabsTrigger>
            <TabsTrigger value="officer" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Officer</span>
            </TabsTrigger>
          </TabsList>

          {/* Citizen Login */}
          <TabsContent value="citizen">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Login</CardTitle>
                <CardDescription>Login with your mobile number to submit and track complaints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={10}
                    disabled={otpSent}
                  />
                </div>

                {!otpSent ? (
                  <Button onClick={handleSendOTP} className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleVerifyOTP} className="flex-1" disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <Button variant="outline" onClick={() => setOtpSent(false)} disabled={loading}>
                        Change Number
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Officer Login */}
          <TabsContent value="officer">
            <Card>
              <CardHeader>
                <CardTitle>Officer Login</CardTitle>
                <CardDescription>Login with your credentials to access the management dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="collector">Collector/CEO ZP</SelectItem>
                      <SelectItem value="department-officer">Department Officer</SelectItem>
                      <SelectItem value="clerk">Clerk/Sub-Officer</SelectItem>
                      <SelectItem value="helpdesk">Helpdesk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleOfficerLogin} className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <Link href="/complaint/track" className="text-blue-600 hover:underline block">
            Track Complaint Status
          </Link>
          <Link href="/" className="text-gray-500 hover:underline block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
