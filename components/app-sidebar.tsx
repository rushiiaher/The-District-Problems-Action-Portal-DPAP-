"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useSidebar } from "@/components/sidebar-context"

export function SidebarToggle() {
  const { setOpen } = useSidebar()
  return (
    <button
      className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 hover:bg-white/10 rounded transition-colors text-white"
      onClick={() => setOpen(true)}
    >
      <span className="material-symbols-outlined">menu</span>
    </button>
  )
}

// Nav items per role
const NAV = {
  citizen: [
    { label: "Dashboard",           href: "/citizen/dashboard",        icon: "dashboard" },
    { label: "Submit Problem/Complaint", href: "/citizen/submit",       icon: "add_task" },
    { label: "Track Status",        href: "/complaint/track",          icon: "find_in_page" },
    { label: "My Profile",          href: "/citizen/profile",          icon: "manage_accounts" },
    { label: "Financial Help in Emergency", href: "/citizen/red-cross", icon: "volunteer_activism", accent: "text-red-600" },
    { label: "Aid Status",          href: "/citizen/red-cross/status", icon: "track_changes", accent: "text-red-600" },
    { label: "Helpdesk",            href: "/helpline",                         icon: "support_agent" },
  ],
  subadmin: [
    { group: "Internal Management", items: [
      { label: "Unassigned Queue", href: "/subadmin/queue", icon: "inbox" },
      { label: "Reassignment Queue", href: "/subadmin/queue?tab=reassigned", icon: "rebase_edit" },
      { label: "Processed Today", href: "/subadmin/queue?tab=processed", icon: "check_circle" },
    ]},
    { group: "Administrative Reports", items: [
      { label: "Performance Analytics", href: "#", icon: "bar_chart" },
    ]},
  ],
  officer: [
    { group: "My Work", items: [
      { label: "My Inbox", href: "/officer/inbox", icon: "inbox" },
      { label: "Resolved Cases", href: "/officer/inbox?tab=resolved", icon: "task_alt" },
    ]},
    { group: "Reports", items: [
      { label: "Performance", href: "#", icon: "analytics" },
    ]},
  ],
  superadmin: [
    { group: "Overview", items: [
      { label: "Executive Dashboard", href: "/admin/dashboard",  icon: "analytics" },
      { label: "All Complaints",      href: "/admin/complaints", icon: "fact_check" },
      { label: "Audit Reports",       href: "/admin/audit",      icon: "monitoring" },
    ]},
    { group: "Administration", items: [
      { label: "Departments",       href: "/admin/departments",    icon: "account_balance" },
      { label: "Field Officers",    href: "/admin/officers",       icon: "badge" },
      { label: "Sub-Admins",        href: "/admin/subadmins",      icon: "manage_accounts" },
      { label: "Citizens",          href: "/admin/citizens",       icon: "group" },
      { label: "System Settings",   href: "/admin/settings",       icon: "admin_panel_settings" },
    ]},
    { group: "Financial Help", items: [
      { label: "Emergency Aid Applications", href: "/admin/red-cross", icon: "volunteer_activism", accent: "text-red-600" },
    ]},
    { group: "Bank", items: [
      { label: "Bank Managers",     href: "/admin/bank-managers",  icon: "account_balance",    accent: "text-gov-saffron" },
    ]},
  ],
  bank_manager: [
    { label: "Dashboard", href: "/bank/dashboard", icon: "dashboard" },
  ],
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { open: mobileOpen, setOpen: setMobileOpen } = useSidebar()

  if (!user) return null
  const role = user.role as keyof typeof NAV
  const navConfig = NAV[role] || []

  const isActive = (href: string) => {
    if (href === "#") return false
    const [hrefPath, hrefQS] = href.split("?")
    if (hrefQS) {
      const expectedTab = new URLSearchParams(hrefQS).get("tab")
      return pathname === hrefPath && searchParams.get("tab") === expectedTab
    }
    if (pathname === hrefPath) return !searchParams.get("tab")
    return !!pathname?.startsWith(hrefPath + "/")
  }

  const renderItems = (items: any[]) =>
    items.map(item => (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`gov-sidebar-item ${isActive(item.href) ? "active" : ""}`}
      >
        <span className={`material-symbols-outlined text-[20px] ${item.accent || ""}`}>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] font-black bg-gov-saffron text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
        )}
      </Link>
    ))

  const sidebarContent = (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-300 flex flex-col shadow-sm h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="size-9 bg-gov-navy rounded flex items-center justify-center text-white flex-shrink-0">
          <span className="material-symbols-outlined text-xl">account_balance</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-extrabold tracking-tight text-gov-navy leading-none">E-ARZI</h2>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Govt. of India</span>
        </div>
        <button
          className="md:hidden text-slate-400 hover:text-slate-700 p-1"
          onClick={() => setMobileOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-0 space-y-0.5 mt-4">
        {Array.isArray(navConfig[0]) || (navConfig[0] && 'label' in navConfig[0]) ? (
          // Flat list (citizen)
          renderItems(navConfig as any[])
        ) : (
          // Grouped (subadmin, officer, superadmin)
          (navConfig as any[]).map((section: any) => (
            <div key={section.group}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-2 mt-4">{section.group}</div>
              {renderItems(section.items)}
            </div>
          ))
        )}
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="size-9 rounded bg-gov-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.name?.[0] || user.mobile?.[0] || "U"}
          </div>
          <div className="overflow-hidden flex-1">
            {user.role === "citizen" ? (
              <Link href="/citizen/profile" className="block text-sm font-bold truncate text-gov-navy hover:text-gov-saffron transition-colors">
                {user.name || user.mobile || "User"}
              </Link>
            ) : (
              <p className="text-sm font-bold truncate text-gov-navy">{user.name || user.mobile || "User"}</p>
            )}
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">{user.role}</p>
          </div>
          <button onClick={logout} title="Logout" className="text-slate-400 hover:text-red-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex h-full">{sidebarContent}</div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
