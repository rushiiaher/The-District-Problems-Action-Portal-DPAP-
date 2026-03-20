"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const DISTRICTS = ["Anantnag", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"]

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp" | "success">("form")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    block: "",
    village: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" })
      return
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast({ title: "Enter a valid 10-digit mobile number", variant: "destructive" })
      return
    }
    if (!form.district) {
      toast({ title: "Please select your district", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!data.success) {
        toast({ title: "Registration Failed", description: data.error, variant: "destructive" })
        return
      }

      toast({ title: "OTP Sent", description: "Please check your mobile for the verification code" })
      setStep("otp")
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      toast({ title: "Enter the 4-digit OTP sent to your mobile", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp, loginType: "citizen" }),
      })
      const data = await res.json()

      if (!data.success) {
        toast({ title: "Invalid OTP", description: data.error, variant: "destructive" })
        return
      }

      // Mark citizen as verified in Firestore via login token
      localStorage.setItem("user", JSON.stringify(data.data.user))
      localStorage.setItem("token", data.data.token)

      setStep("success")
      setTimeout(() => router.push("/citizen/dashboard"), 2000)
    } catch {
      toast({ title: "Error", description: "Verification failed. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "OTP Resent", description: "A new OTP has been sent to your mobile" })
      } else {
        toast({ title: "Failed to resend OTP", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Could not resend OTP.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">DPAP</h1>
          </div>
          <p className="text-gray-600">District Problems & Action Portal</p>
        </div>

        {/* Step: Registration Form */}
        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Create Citizen Account</CardTitle>
              <CardDescription>Register to submit and track your complaints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Name */}
              <div className="space-y-1">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email Address <span className="text-gray-400 text-xs">(optional)</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <Label>District <span className="text-red-500">*</span></Label>
                <Select value={form.district} onValueChange={(v) => handleChange("district", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Block */}
              <div className="space-y-1">
                <Label htmlFor="block">Block / Tehsil <span className="text-gray-400 text-xs">(optional)</span></Label>
                <Input
                  id="block"
                  placeholder="Enter your block or tehsil"
                  value={form.block}
                  onChange={(e) => handleChange("block", e.target.value)}
                />
              </div>

              {/* Village */}
              <div className="space-y-1">
                <Label htmlFor="village">Village / Ward <span className="text-gray-400 text-xs">(optional)</span></Label>
                <Input
                  id="village"
                  placeholder="Enter your village or ward"
                  value={form.village}
                  onChange={(e) => handleChange("village", e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="address">Full Address <span className="text-gray-400 text-xs">(optional)</span></Label>
                <Input
                  id="address"
                  placeholder="House no., street, locality"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <Button onClick={handleRegister} className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account & Send OTP"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step: OTP Verification */}
        {step === "otp" && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Mobile Number</CardTitle>
              <CardDescription>
                Enter the 4-digit OTP sent to <span className="font-semibold text-gray-800">+91 {form.phone}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={4}
                  className="text-center text-2xl tracking-widest font-bold"
                />
              </div>

              <Button onClick={handleVerifyOtp} className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Activate Account"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => setStep("form")}
                  className="text-gray-500 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Change number
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-blue-600 hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Account Activated!</h2>
              <p className="text-gray-600">
                Welcome, <span className="font-semibold">{form.name}</span>! Your account has been created successfully.
              </p>
              <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </CardContent>
          </Card>
        )}

        {/* Back to home */}
        {step === "form" && (
          <div className="text-center mt-4">
            <Link href="/" className="text-gray-500 hover:underline text-sm">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
