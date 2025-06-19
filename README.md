# District Problems & Action Portal (DPAP)

A comprehensive full-stack SaaS web application for citizen complaint management with role-based dashboards for government departments.

## 🚀 Features

### Citizen Features
- **OTP-based Authentication** - Secure login using mobile number
- **Complaint Submission** - Easy form with file uploads and location details
- **Real-time Tracking** - Track complaint status with unique ID
- **SMS/WhatsApp Notifications** - Automatic updates on status changes
- **Personal Dashboard** - View all submitted complaints and their status

### Officer Features
- **Role-based Dashboards** - Different interfaces for different roles
- **Complaint Management** - View, update, and resolve assigned complaints
- **File Upload** - Add proof of action taken with images/documents
- **Status Updates** - Update complaint status with detailed action notes
- **Department Filtering** - View complaints specific to department

### Admin Features
- **User Management** - Create and manage users with different roles
- **System Overview** - Complete dashboard with analytics and reports
- **Department Management** - Manage departments, categories, and SLAs
- **Performance Monitoring** - Track department performance and SLA compliance

### System Features
- **SLA Management** - Automatic escalation when deadlines are breached
- **Multi-role Access** - Support for Citizens, Officers, Collectors, and Admins
- **File Management** - Secure file upload and storage
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Updates** - Live status updates and notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose (ready for integration)
- **Authentication**: JWT tokens, OTP verification
- **UI Components**: shadcn/ui
- **File Upload**: Built-in file handling
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)

## 📋 User Roles

1. **Super Admin** - Full system management and configuration
2. **Collector/CEO ZP** - District-wide overview and escalation management
3. **Department Officer** - Manage complaints for specific department
4. **Clerk/Sub-Officer** - Update complaints and upload proof of action
5. **Citizen** - Submit and track complaints
6. **Helpdesk** - Submit complaints on behalf of citizens

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Environment variables configured

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd dpap-portal
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Environment Setup**
Create a `.env.local` file in the root directory:
\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/dpap
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dpap

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# File Upload (Optional)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# SMS/WhatsApp API (Optional)
SMS_API_KEY=your-sms-api-key
WHATSAPP_API_KEY=your-whatsapp-api-key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
\`\`\`

4. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📱 Usage

### For Citizens
1. Visit the homepage
2. Click "Submit Complaint" or login with mobile number
3. Fill out the complaint form with details and attachments
4. Receive complaint ID via SMS
5. Track status using the complaint ID

### For Officers
1. Login with email and password
2. Select appropriate role (Officer, Collector, etc.)
3. Access role-specific dashboard
4. Manage assigned complaints
5. Update status and add action notes

### For Administrators
1. Login with admin credentials
2. Access admin panel
3. Manage users, departments, and system settings
4. Monitor performance and generate reports

## 🏗️ Project Structure

\`\`\`
dpap-portal/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── complaints/           # Complaint management
│   │   └── dashboard/            # Dashboard data
│   ├── auth/                     # Authentication pages
│   ├── citizen/                  # Citizen dashboard
│   ├── officer/                  # Officer dashboard
│   ├── collector/                # Collector dashboard
│   ├── admin/                    # Admin panel
│   ├── complaint/                # Complaint pages
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   └── providers/                # Context providers
├── lib/                          # Utility functions
├── public/                       # Static assets
└── README.md                     # This file
\`\`\`

## 🔧 Configuration

### Database Setup
The application is configured to work with MongoDB. Update the `MONGODB_URI` in your `.env.local` file.

### Authentication
- Citizens use OTP-based authentication
- Officers use email/password authentication
- JWT tokens are used for session management

### File Uploads
- Maximum file size: 10MB per file
- Supported formats: Images, Videos, PDFs, Documents
- Files are stored locally (can be configured for cloud storage)

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Backend (Railway/Render)
1. Create account on Railway or Render
2. Connect GitHub repository
3. Configure environment variables
4. Deploy with automatic builds

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Update connection string in environment variables

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Different permissions for different roles
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - File type and size restrictions
- **CORS Protection** - Cross-origin request protection

## 📊 Monitoring & Analytics

- **Dashboard Analytics** - Real-time statistics and charts
- **Performance Metrics** - SLA tracking and department performance
- **User Activity** - Login tracking and action logs
- **System Health** - Monitor application performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@dpap.gov.in
- **Phone**: 1800-123-4567
- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added file upload and SMS notifications
- **v1.2.0** - Enhanced dashboard and analytics
- **v2.0.0** - Role-based access control and admin panel

---

**Built with ❤️ for Digital India Initiative**
