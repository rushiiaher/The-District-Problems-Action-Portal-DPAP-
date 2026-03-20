# E-ARZI
## Anantnag District Grievance Redressal System

---

> **System Architecture & Product Specification**
> Version 2.0 — Updated Architecture with Sub-Admin Role & Manual Assignment

### Tech Stack
> `Next.js 14 (App Router)` · `TypeScript` · `Tailwind CSS` · `shadcn/ui (Radix UI)`
> `Supabase (PostgreSQL)` · `MSG91 (SMS/OTP)` · `JWT Authentication`

**District Administration · Anantnag, J&K**
**March 2026**

---

## 1. Project Overview

E-Arzi is a web-based grievance redressal platform for the Anantnag District Administration. It enables citizens to register complaints, Sub-Admins to manually assign them to the correct department and officer, and officers to handle and resolve them — all under the oversight of the Super Admin (IAS/District Authority).

### 1.1 Key Design Decisions (Version 2.0 Changes)

- **No automatic assignment:** All complaint routing is manual, performed by Sub-Admins.
- **Sub-Admin role added:** A dedicated middle layer between Super Admin and Officers, responsible for complaint intake and assignment.
- **Super Admin manages departments:** Super Admin can create, edit, and deactivate departments directly from the admin console.
- **Manual assignment workflow:** Complaints sit in an Unassigned Queue until a Sub-Admin assigns them to a department and an officer within that department.

---

## 2. User Roles & Responsibilities

### 2.1 Citizen

- Register / Login via mobile OTP (MSG91)
- Submit complaint with: category, description, location (district/block/village), optional proof uploads (images/PDF)
- Track complaint status in real time
- Receive SMS and in-app notifications at each stage
- Provide 1–5 star rating and feedback after resolution
- Reopen complaint if unsatisfied (max 3 times)

### 2.2 Sub-Admin *(New Role)*

The Sub-Admin is a staff member appointed by the Super Admin to manage daily complaint intake and routing. There can be multiple Sub-Admins.

- Login with credentials created by Super Admin
- View the Unassigned Complaints Queue
- Review complaint details and supporting documents
- Assign complaint to a department (chosen from active departments)
- Assign complaint to a specific officer within that department
- Add an internal note when assigning (reason, priority instruction)
- Reassign complaint to a different department or officer if needed
- **Cannot** resolve, close, or reject complaints
- **Cannot** create officers or departments
- Has access only to assignment-related views — no analytics

### 2.3 Officer *(Department Level)*

- Login with credentials created by Super Admin
- View complaints assigned to them
- Accept or reject a complaint (with mandatory reason on rejection)
- Update status: In Progress, Resolved, Escalated
- Add remarks and upload proof of action taken
- Set expected resolution date (within SLA limits)
- Cannot see complaints assigned to other officers

### 2.4 Super Admin *(IAS / District Authority)*

- Create, edit, and deactivate departments
- Create and manage Sub-Admin accounts
- Create and manage Officer accounts and map them to departments
- Monitor all complaints via a live dashboard
- Manually assign or reassign any complaint (override Sub-Admin)
- Escalate delayed complaints
- View full analytics: department performance, resolution time, complaint trends
- Configure SLA rules and escalation thresholds per department
- View citizen accounts (read-only)
- Access complete audit logs

---

## 3. Role-Wise Capabilities Matrix

| Capability | Citizen | Sub-Admin | Officer | Super Admin |
|---|:---:|:---:|:---:|:---:|
| Register / Login (OTP) | ✅ | — | — | — |
| Login (credentials) | — | ✅ | ✅ | ✅ |
| Submit complaint | ✅ | — | — | — |
| Track own complaints | ✅ | — | — | — |
| Reopen complaint | ✅ | — | — | — |
| Rate / give feedback | ✅ | — | — | — |
| View Unassigned Queue | — | ✅ | — | ✅ |
| Assign complaint to dept + officer | — | ✅ | — | ✅ |
| Reassign complaint | — | ✅ (any) | — | ✅ (any) |
| Add assignment note | — | ✅ | — | ✅ |
| Accept / Reject complaint | — | — | ✅ | ✅ |
| Update complaint status | — | — | ✅ | ✅ |
| Add remarks & proof | — | — | ✅ | ✅ |
| Set resolution timeline | — | — | ✅ | ✅ |
| View assigned complaints | — | — | Own only | All |
| View all complaints | — | — | — | ✅ |
| Create / manage departments | — | — | — | ✅ |
| Create / manage officers | — | — | — | ✅ |
| Create / manage Sub-Admins | — | — | — | ✅ |
| Configure SLA rules | — | — | — | ✅ |
| View analytics | — | — | Own dept | Full system |
| Access audit logs | — | — | — | ✅ |
| Escalate complaint | — | — | — | ✅ |
| Download reports | — | — | Own dept | Full system |

---

## 4. Complaint Lifecycle — Step-by-Step

### Step 1 — Citizen Submits Complaint

- Citizen fills the submission form: selects category from a predefined list, enters description, selects district/block/village, optionally uploads proof files.
- System runs basic validation: required fields, file type/size check.
- **Duplicate detection check:** if a complaint with the same category + village + citizen was filed within 7 days, citizen is warned and asked to confirm.
- On successful submission, a unique Complaint ID is generated (format: `ARZ-YYYY-NNNNNN`).
- Status set to: `SUBMITTED`.
- Citizen receives SMS confirmation with Complaint ID and tracking link.

### Step 2 — Sub-Admin Reviews & Assigns

- Complaint appears in the Sub-Admin's Unassigned Queue.
- Sub-Admin opens the complaint, reviews details and uploaded documents.
- Sub-Admin selects: **(a)** the Department and **(b)** the Officer within that department.
- Sub-Admin optionally adds an internal assignment note *(not visible to citizen)*.
- Sub-Admin clicks **Assign**. Status changes to: `ASSIGNED`.
- Officer receives an in-app notification and SMS: *"New complaint [ID] assigned to you."*
- Citizen receives SMS: *"Your complaint [ID] has been assigned to [Department Name]. Expected resolution by [date]."*

### Step 3 — Officer Handles Complaint

- Officer logs in and sees the complaint in their inbox.
- Officer can **Accept** (start working) or **Reject** (with mandatory reason).
- On **Accept**: status changes to `IN PROGRESS`. Officer sets an expected resolution date.
- On **Reject**: complaint returns to Sub-Admin's queue with the rejection reason flagged. Sub-Admin must reassign.
- Officer adds remarks and progress updates at any time.
- Officer can upload proof of action (photos, documents).

### Step 4 — Resolution

- Officer marks complaint as `RESOLVED` with a resolution note and optional proof document.
- Citizen receives SMS + in-app notification: *"Your complaint [ID] has been resolved. Please rate your experience."*
- A **7-day window** opens for the citizen to accept the resolution or reopen.

### Step 5 — Citizen Verification & Closure

- **If citizen is satisfied:** they rate the experience (1–5 stars) and optionally add a comment. Status: `CLOSED`.
- **If citizen reopens:** status reverts to `ASSIGNED`, complaint goes back to the officer's queue with a reopen flag. Sub-Admin is notified.
- **If citizen does not respond within 7 days:** complaint is automatically closed by the system. Status: `AUTO-CLOSED`.
- Reopen is allowed a **maximum of 3 times**. On the 3rd reopen, Super Admin is automatically notified.

### Step 6 — Escalation *(Parallel Track)*

- The escalation scheduler runs **every 30 minutes** and checks all `IN PROGRESS` complaints.
- **Level 1** *(50% of SLA elapsed, no officer update)*: System sends a reminder to the officer.
- **Level 2** *(SLA deadline breached)*: Status changes to `ESCALATED`. Super Admin is notified via in-app + email.
- **Level 3** *(24 hours after Level 2, still unresolved)*: Super Admin receives a daily escalation digest. Manual intervention required.

---

## 5. Complaint Status State Machine

> No status can be skipped. Only the specified roles can trigger each transition.

| Status | Set By | Meaning | Next Valid States |
|---|---|---|---|
| `SUBMITTED` | System | Citizen filed; awaiting Sub-Admin review | `ASSIGNED`, `REJECTED` |
| `ASSIGNED` | Sub-Admin / Super Admin | Routed to a department and officer | `IN_PROGRESS`, `REASSIGNED` |
| `REASSIGNED` | Sub-Admin / Super Admin / Officer (reject) | Sent back for new assignment | `ASSIGNED` |
| `IN_PROGRESS` | Officer | Officer accepted and is working on it | `RESOLVED`, `ESCALATED` |
| `ESCALATED` | System (SLA breach) / Super Admin | SLA breached; requires senior attention | `IN_PROGRESS`, `RESOLVED` |
| `RESOLVED` | Officer | Officer has resolved the issue | `CLOSED`, `AUTO_CLOSED`, `REOPENED` |
| `REOPENED` | Citizen | Citizen not satisfied with resolution | `IN_PROGRESS` |
| `CLOSED` | Citizen (rated) | Citizen accepted resolution | — *(terminal)* |
| `AUTO_CLOSED` | System (7-day timeout) | No citizen response after 7 days | — *(terminal)* |
| `REJECTED` | System (spam/invalid) | Failed validation or marked spam | — *(terminal)* |

---

## 6. Department Management *(Super Admin)*

The Super Admin has full control over the department registry. This is a core administrative function that directly affects the Sub-Admin's assignment options.

### 6.1 Department Record Fields

| Field | Type | Notes |
|---|---|---|
| Department ID | Auto-generated UUID | Primary key |
| Department Name | Text (required) | e.g., Public Works, Jal Shakti, Education |
| Department Code | Short text | e.g., `PWD`, `JSK` — used in Complaint ID prefix |
| Description | Text (optional) | Scope of complaints handled |
| Head Officer | FK to Officer | Senior officer, receives escalation alerts |
| SLA — High Priority | Integer (hours) | Resolution deadline for high-priority complaints |
| SLA — Medium Priority | Integer (hours) | Resolution deadline for medium-priority complaints |
| SLA — Low Priority | Integer (hours) | Resolution deadline for low-priority complaints |
| Status | Active / Inactive | Inactive departments hidden from assignment dropdown |
| Created At | Timestamp | Auto-set |
| Created By | FK to Super Admin | Audit trail |

### 6.2 Department Operations *(Super Admin Only)*

- **Create Department:** fill the form above; department immediately available in Sub-Admin's assignment dropdown.
- **Edit Department:** update name, description, SLA values, head officer. All existing complaints retain their original department tag.
- **Deactivate Department:** hides the department from new assignments. Existing open complaints in that department continue to be handled by assigned officers.
- **View Department Officers:** a list of all officers mapped to that department, with their open complaint count.
- **Transfer All Complaints:** emergency function to move all open complaints from one department to another (e.g., during restructuring). Requires confirmation and logs every transfer in the audit log.

---

## 7. SLA Rules & Escalation Configuration

### 7.1 Default SLA Thresholds

> These are system defaults configured by the Super Admin. Each department can override them individually.

| Priority Level | Complaint Examples | Response Deadline | Resolution Deadline |
|---|---|---|---|
| **Emergency** | Flood, fire, health crisis | 2 hours | 24 hours |
| **High** | Water supply failure, power outage | 24 hours | 5 days |
| **Medium** | Road repair, sanitation, drainage | 48 hours | 10 days |
| **Low** | Documentation, permits, information requests | 72 hours | 15 days |

### 7.2 Escalation Trigger Rules

- ⚡ At **50%** of resolution deadline with no officer status update — reminder sent to officer.
- 🔴 At **100%** of resolution deadline (SLA breached) — status auto-changes to `ESCALATED`, Super Admin notified.
- 🚨 **24 hours after Level 2** with no resolution — appears in Super Admin's critical intervention list, daily digest email sent.
- ⚠️ If assigned officer has **not logged in for 3 consecutive business days**, Super Admin is alerted for manual reassignment.

> **Note:** Priority is set at the category level by the Super Admin when configuring departments. Sub-Admins can *flag* a complaint for priority upgrade, but only the Super Admin can approve it.

---

## 8. Notification System

| Trigger Event | Recipient | Channels | Message Summary |
|---|---|---|---|
| Complaint submitted | Citizen | SMS | Your complaint [ID] received. Track at [link]. |
| Complaint assigned to dept | Citizen | SMS | Complaint [ID] assigned to [Dept]. Expected by [date]. |
| New complaint assigned | Officer | In-app + SMS | New complaint [ID] assigned to you. Please review. |
| Officer rejects complaint | Sub-Admin | In-app + Email | Complaint [ID] rejected by officer. Reassignment needed. |
| Status: In Progress | Citizen | SMS + In-app | Your complaint [ID] is now being worked on. |
| 50% SLA elapsed, no update | Officer | In-app + Email | Reminder: Complaint [ID] due by [date]. Please update. |
| SLA breached | Officer + Super Admin | In-app + Email | ESCALATED: Complaint [ID] has breached SLA. |
| Complaint resolved | Citizen | SMS + Email | Complaint [ID] resolved. Rate your experience at [link]. |
| No response in 6 days | Citizen | SMS | Complaint [ID] auto-closes in 24 hrs. Reopen at [link]. |
| Complaint closed | Citizen | Email | Complaint [ID] is now closed. Thank you. |
| Complaint reopened | Officer + Sub-Admin | In-app + SMS | Complaint [ID] has been reopened by citizen. |
| 3rd reopen triggered | Super Admin | In-app + Email | Complaint [ID] reopened 3 times. Manual review needed. |

---

## 9. System Architecture *(Next.js 14 + Supabase)*

### 9.1 Application Structure

The application is a **Next.js 14 App Router** project with server-side rendering and server actions. Supabase provides the PostgreSQL database, file storage (for complaint attachments), and Row-Level Security (RLS) policies.

### 9.2 Route Layout *(App Router)*

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with complaint tracking by ID |
| `/login` | Public | OTP login (citizen) / credential login (staff) |
| `/citizen/dashboard` | Citizen | Complaint history, status, notifications |
| `/citizen/submit` | Citizen | New complaint submission form |
| `/citizen/complaint/[id]` | Citizen | Complaint detail and timeline |
| `/subadmin/queue` | Sub-Admin | Unassigned complaints queue |
| `/subadmin/assign/[id]` | Sub-Admin | Assign complaint to dept + officer |
| `/officer/inbox` | Officer | Assigned complaints inbox |
| `/officer/complaint/[id]` | Officer | Complaint detail with action panel |
| `/admin/dashboard` | Super Admin | Live system overview and analytics |
| `/admin/departments` | Super Admin | Create / manage departments |
| `/admin/officers` | Super Admin | Create / manage officer accounts |
| `/admin/subadmins` | Super Admin | Create / manage Sub-Admin accounts |
| `/admin/complaints` | Super Admin | All complaints with full filter/search |
| `/admin/analytics` | Super Admin | Reports, charts, performance metrics |
| `/admin/audit-log` | Super Admin | Immutable audit trail viewer |
| `/admin/sla-config` | Super Admin | Configure SLA and escalation rules |

### 9.3 Supabase Database Tables

| Table | Key Fields | Notes |
|---|---|---|
| `users` | `id`, `mobile`, `name`, `role` (citizen/subadmin/officer/superadmin), `created_at` | All user types in one table; role drives access |
| `departments` | `id`, `name`, `code`, `description`, `head_officer_id`, `sla_high/med/low` (hours), `status`, `created_by` | Managed by Super Admin |
| `officers` | `id` (FK users), `department_id`, `employee_id`, `designation` | Officer profile linked to user |
| `complaints` | `id`, `citizen_id`, `category`, `description`, `block`, `village`, `status`, `assigned_dept_id`, `assigned_officer_id`, `assigned_by` (subadmin), `priority`, `sla_deadline`, `reopen_count`, `created_at` | Core table |
| `complaint_attachments` | `id`, `complaint_id`, `file_url`, `file_type`, `uploaded_by`, `created_at` | Supabase Storage URLs |
| `complaint_timeline` | `id`, `complaint_id`, `actor_id`, `actor_role`, `action`, `remarks`, `proof_url`, `timestamp` | Immutable event log per complaint |
| `notifications` | `id`, `user_id`, `complaint_id`, `type`, `message`, `read`, `created_at` | In-app notification store |
| `audit_log` | `id`, `actor_id`, `actor_role`, `action`, `target_table`, `target_id`, `old_value` (JSON), `new_value` (JSON), `ip`, `timestamp` | System-wide audit trail |
| `feedback` | `id`, `complaint_id`, `citizen_id`, `rating` (1–5), `comment`, `created_at` | Post-resolution feedback |
| `sla_config` | `id`, `department_id`, `priority`, `response_hours`, `resolution_hours`, `updated_by` | Per-department SLA overrides |

### 9.4 Authentication Flow

- **Citizens:** Mobile number input → MSG91 OTP sent → OTP verified → JWT issued with `role=citizen`.
- **Staff (Sub-Admin, Officer, Super Admin):** Username + password → bcrypt verify → JWT issued with role claim.
- JWT stored in **HttpOnly cookie** (not localStorage). Access token: 1 hour. Refresh token: 7 days.
- Supabase RLS policies enforce role-based data access at the database level — even if API is called directly, data is protected.
- Failed login: rate-limited to **5 attempts per 15 minutes per IP**.

### 9.5 File Upload Safety

- **Accepted formats:** JPG, PNG, PDF, DOCX only.
- **Maximum size:** 5 MB per file, 20 MB per complaint total.
- Files stored in Supabase Storage with a UUID-based path *(original filename discarded)*.
- **Access control:** complaint attachments readable only by the citizen who filed + assigned officer + Sub-Admin + Super Admin.

---

## 10. Dashboard Specifications

### 10.1 Citizen Dashboard

- Summary bar: total complaints filed / resolved / pending.
- Complaint list with status badges (colour-coded), sortable by date.
- Per-complaint timeline showing every status change with actor and timestamp.
- Notification bell with unread count.
- **Reopen** and **Rate** buttons on resolved complaints.

### 10.2 Sub-Admin Dashboard

- **Unassigned Queue** *(primary view)*: list of all `SUBMITTED` complaints sorted by submission time, with category, location, and attachment indicator.
- **Quick assign panel:** department dropdown → officer dropdown (filtered by selected department) → optional note field → **Assign** button.
- **My Assignments today:** count of complaints assigned in the current session.
- **Reassignment queue:** complaints returned by officers (rejected), flagged for re-routing.

### 10.3 Officer Dashboard

- **Inbox:** complaints assigned to this officer, sorted by SLA urgency. SLA status badges: 🟢 *On Track*, 🟡 *At Risk* (>50% elapsed), 🔴 *Overdue*.
- Quick action buttons per complaint: **Accept / Update Status / Resolve** without opening full record.
- **Personal metrics:** resolved this month, average resolution time, pending count.
- Calendar view of expected resolution deadlines.

### 10.4 Super Admin Dashboard

- **Live summary cards:** total open, escalated, resolved this week, average resolution time system-wide.
- **Department performance table:** each row = one department with open / resolved / overdue / avg time / satisfaction score columns.
- **Complaint volume trend chart** (30/60/90-day toggle).
- **Escalation intervention panel:** all `ESCALATED` complaints with one-click reassignment.
- **Department management shortcut:** add/edit/deactivate departments from the dashboard.
- **Sub-Admin activity:** complaints processed per Sub-Admin today/this week.

---

## 11. Edge Case Handling

| Scenario | Handling |
|---|---|
| **Wrong department assigned by Sub-Admin** | Officer rejects with reason. Complaint returns to Sub-Admin's reassignment queue. Sub-Admin re-routes to correct dept + officer. SLA clock continues (no reset) unless Super Admin explicitly resets it. |
| **Duplicate complaint** | On submission, system checks: same citizen + same category + same village within 7 days. If match found, citizen is shown a warning with link to existing complaint. They must confirm to proceed. |
| **Spam / fake complaint** | 3 rejections from the same mobile number trigger a spam flag. Further submissions from that number require Sub-Admin manual approval before entering the queue. Full block requires Super Admin action. |
| **Citizen reopening repeatedly** | Maximum 3 reopens per complaint. On 3rd reopen, Super Admin is auto-notified for personal review. 4th reopen requires Super Admin approval. |
| **Officer inactive / unresponsive** | If officer has not logged in for 3 consecutive business days, their open complaints are surfaced in the Sub-Admin's reassignment queue and Super Admin is alerted. |
| **Sub-Admin not processing queue** | If complaints remain `SUBMITTED` for more than 24 hours without assignment, Super Admin receives an alert listing the backlog. Super Admin can assign directly. |
| **System downtime** | Complaint submission form queues the request in browser `localStorage` and retries on reconnect. Background jobs (SLA scheduler) resume from last-run timestamp stored in DB. |
| **Department deactivated with open complaints** | Existing open complaints continue with their assigned officers. Sub-Admin cannot assign new complaints to the deactivated department. Super Admin must manually reassign existing open complaints. |

---

## 12. Security & Compliance

### 12.1 Authentication

- **Citizen login:** MSG91 OTP (6-digit, 5-minute expiry). No password required.
- **Staff login:** username + bcrypt-hashed password (min 12 chars). Optional TOTP second factor for Super Admin.
- **JWT:** HttpOnly cookie, 1-hour access token, 7-day refresh token.
- Session invalidation on logout — refresh token blacklisted in Supabase.

### 12.2 Role-Based Access *(Supabase RLS)*

- Every Supabase table has Row-Level Security policies that enforce role claims from the JWT.
- Citizens can only `SELECT` their own complaints; they cannot `SELECT` other citizens' data even with a direct API call.
- Officers can only `SELECT`/`UPDATE` complaints where `assigned_officer_id = their user ID`.
- Sub-Admins can `SELECT` all `SUBMITTED` complaints; can `UPDATE` assignment fields only.
- Super Admin bypasses RLS via a service-role key used only in server-side Next.js API routes — **never exposed to the client**.

### 12.3 Data Privacy

- Citizen mobile numbers and personal details are **masked** in all officer and Sub-Admin views. Only the district/block/village is shown.
- Super Admin can view citizen contact information; this access is **logged** in the audit table with timestamp and IP.
- Complaints are **never publicly searchable** by citizen name.

### 12.4 Audit Integrity

- The `audit_log` table is **append-only**. No `UPDATE` or `DELETE` permissions are granted on this table to any role.
- Every status change, assignment, reassignment, login, file upload, and admin config change writes a record.
- Each record includes: actor ID, role, action type, target record, before/after values (JSON), IP address, and UTC timestamp.

---

## 13. Future Scope

- 📱 **Mobile App (PWA)** — offline form fill, photo capture before submission. High priority given connectivity constraints in parts of Anantnag.
- 🌐 **Multi-language Support** — Urdu and Hindi interface and SMS notifications.
- 📞 **WhatsApp / IVR Integration** — file complaints without internet via a bot or phone call.
- 📊 **Public Transparency Dashboard** — anonymised complaint statistics visible to the public, building accountability.
- 🔗 **State Portal Integration** — push unresolved escalated complaints to J&K state grievance portal automatically.
- 🤖 **AI SLA Prediction** — use historical data to predict which open complaints will likely breach SLA.
- 📥 **Bulk Import Tool** — CSV import for Super Admin to set up departments and categories quickly.

---

## Appendix A: Document Changelog

| Version |    Date    | Changed By | Summary of Changes |
|---------|------------|---|---|
|   1.0   | March 2026 | System Architect | Initial architecture document |
| 2.0 | March 2026 | System Architect | Added Sub-Admin role; removed auto-assignment; Super Admin can manage departments; updated all tables, workflows, routes, and DB schema accordingly |
