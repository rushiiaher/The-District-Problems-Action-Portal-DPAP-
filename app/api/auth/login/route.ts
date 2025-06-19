import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock users database
const users = [
  {
    id: "1",
    email: "admin@dpap.gov.in",
    password: "admin123",
    role: "super-admin",
    name: "System Administrator",
    department: "IT Department",
  },
  {
    id: "2",
    email: "collector@pune.gov.in",
    password: "collector123",
    role: "collector",
    name: "District Collector",
    department: "Collector Office",
  },
  {
    id: "3",
    email: "water.officer@pune.gov.in",
    password: "water123",
    role: "department-officer",
    name: "Priya Sharma",
    department: "Water Resources Department",
  },
  {
    id: "4",
    email: "clerk@pune.gov.in",
    password: "clerk123",
    role: "clerk",
    name: "Amit Patel",
    department: "Municipal Corporation",
  },
  {
    id: "5",
    email: "helpdesk@dpap.gov.in",
    password: "help123",
    role: "helpdesk",
    name: "Support Team",
    department: "Helpdesk",
  },
]

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, phone, otp, loginType } = body

    if (loginType === "citizen") {
      // Handle citizen OTP login
      if (!phone) {
        return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
      }

      if (otp) {
        // Verify OTP (mock verification)
        if (otp === "123456") {
          const citizenUser = {
            id: phone,
            phone,
            role: "citizen",
            loginTime: new Date().toISOString(),
          }

          const token = jwt.sign(citizenUser, JWT_SECRET, { expiresIn: "24h" })

          return NextResponse.json({
            success: true,
            data: { user: citizenUser, token },
            message: "Login successful",
          })
        } else {
          return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 })
        }
      } else {
        // Send OTP (mock)
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully",
          otpSent: true,
        })
      }
    } else {
      // Handle officer login
      if (!email || !password) {
        return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
      }

      const user = users.find((u) => u.email === email && u.password === password)
      if (!user) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      const { password: _, ...userWithoutPassword } = user
      const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: "24h" })

      return NextResponse.json({
        success: true,
        data: { user: userWithoutPassword, token },
        message: "Login successful",
      })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
