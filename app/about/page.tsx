"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"

const NAV_LINKS = [
  { label: "Home",        href: "/"            },
  { label: "Arzi",        href: "/#services"   },
  { label: "Departments", href: "/departments" },
  { label: "About",       href: "/about"       },
  { label: "Red Cross",   href: "/#red-cross"  },
  { label: "Helplines",   href: "/helpline"    },
]

const FEATURES = [
  "Submission of grievances and requests through online mode",
  "Forwarding of applications to concerned departments / officers",
  "Facility to track status of applications",
  "Monitoring at District Administration level",
  "Provision for Red Cross Assistance for eligible cases",
]

export default function AboutPage() {
  const [loginOpen,      setLoginOpen]      = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loginRef      = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && !(e.target as Element).closest("#about-mobile-toggle")) setMobileMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter text-slate-800">

      {/* ─── HEADER ─── */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[88px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-black text-black leading-tight uppercase tracking-tight">E-ARZI ANANTNAG</h1>
                <p className="text-[9px] md:text-[10px] font-bold text-black uppercase tracking-widest mt-0.5">District Public Service Portal</p>
                <p className="text-[9px] md:text-[10px] font-bold text-black tracking-wide">जिला सार्वजनिक सेवा पोर्टल</p>
                <p className="text-[9px] md:text-[10px] font-bold text-black tracking-wide" style={{ fontFamily: "serif" }}>ضلعی عوامی خدمات پورٹل</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-4">
              {NAV_LINKS.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-bold transition-colors border-b-2 py-1 uppercase tracking-wider ${
                    item.label === "About"
                      ? "text-gov-navy border-gov-navy"
                      : "text-slate-700 hover:text-gov-navy border-transparent hover:border-gov-navy"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/complaint/track" className="bg-slate-100 hover:bg-slate-200 text-gov-navy border border-slate-300 px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">search</span> Track Arzi
              </Link>
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setLoginOpen(o => !o)}
                  className="flex items-center gap-2 px-6 py-2 bg-gov-navy text-white font-bold text-sm hover:bg-[#001a40] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span> Login
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>arrow_drop_down</span>
                </button>
                {loginOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-300 shadow-xl z-50">
                    <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Login Type</p>
                    </div>
                    <Link href="/auth/login?tab=citizen" onClick={() => setLoginOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gov-navy/10 transition-colors border-b border-slate-100 cursor-pointer">
                        <span className="material-symbols-outlined text-gov-navy">badge</span>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Citizen Portal</p>
                          <p className="text-[11px] text-slate-500">Register or Track</p>
                        </div>
                      </div>
                    </Link>
                    <Link href="/auth/login?tab=staff" onClick={() => setLoginOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gov-navy/10 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-gov-navy">admin_panel_settings</span>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Official / Staff</p>
                          <p className="text-[11px] text-slate-500">Department Access</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              id="about-mobile-toggle"
              className="lg:hidden text-gov-navy p-2 border border-slate-300 hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(o => !o)}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-300 shadow-xl flex flex-col p-4 space-y-1 z-50">
            {NAV_LINKS.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-bold text-slate-700 p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link href="/auth/login?tab=citizen" className="bg-gov-navy text-white text-center font-bold py-3 text-sm" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
              <Link href="/auth/login?tab=staff" className="bg-gov-navy text-white text-center font-bold py-3 text-sm" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">

        {/* ─── HERO STRIP ─── */}
        <section className="bg-gov-navy py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-white font-bold">About the Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-white/30 text-[40px]">info</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">About the Portal</h1>
                <p className="text-slate-300 text-sm font-medium mt-1">e-Arzi Portal — District Administration, Anantnag</p>
              </div>
            </div>
            {/* Tricolour line */}
            <div className="flex mt-8 h-1 max-w-xs">
              <div className="flex-1 bg-gov-saffron" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-gov-green" />
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Text sections (2/3 width) ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* About e-Arzi Portal */}
              <section className="bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <span className="material-symbols-outlined text-gov-navy text-[20px]">domain</span>
                  <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">About e-Arzi Portal</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    e-Arzi Portal is an online system developed by the <strong>Office of the Deputy Commissioner, Anantnag</strong>, for submission and monitoring of public grievances, requests and applications. The portal provides a single platform for citizens to place their issues before the District Administration.
                  </p>
                </div>
              </section>

              {/* Objective */}
              <section className="bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <span className="material-symbols-outlined text-gov-navy text-[20px]">flag</span>
                  <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">Objective</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    The objective of this portal is to provide a simple and accessible facility for citizens to submit their grievances and requests and to ensure that they are addressed in a timely manner through the concerned departments.
                  </p>
                </div>
              </section>

              {/* Process */}
              <section className="bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <span className="material-symbols-outlined text-gov-navy text-[20px]">account_tree</span>
                  <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">Process</h2>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    All applications submitted through the portal are received at the District Office. After review, the applications are forwarded to the concerned department or officer for necessary action. The status of the application is updated on the portal from time to time.
                  </p>
                  {/* Process steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { icon: "upload_file",      step: "01", label: "Submit Application",      desc: "Citizen submits online through the portal" },
                      { icon: "forward_to_inbox",  step: "02", label: "Forwarded to Department", desc: "District Office routes to concerned department" },
                      { icon: "task_alt",          step: "03", label: "Action & Update",         desc: "Department acts and updates portal status" },
                    ].map(s => (
                      <div key={s.step} className="bg-slate-50 border border-slate-200 p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gov-saffron border border-gov-saffron/40 bg-gov-saffron/10 px-2 py-0.5">{s.step}</span>
                          <span className="material-symbols-outlined text-gov-navy text-[18px]">{s.icon}</span>
                        </div>
                        <p className="text-[11px] font-black text-gov-navy uppercase tracking-wide">{s.label}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Citizen Information */}
              <section className="bg-amber-50 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-amber-200 bg-amber-100/60">
                  <span className="material-symbols-outlined text-amber-700 text-[20px]">person_alert</span>
                  <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest">Citizen Information</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Citizens are advised to provide correct and complete information while submitting applications. Supporting documents may be uploaded wherever required. Incomplete or incorrect applications may not be processed.
                  </p>
                </div>
              </section>

              {/* General Note */}
              <section className="bg-slate-100 border border-slate-300 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-300 bg-slate-200/60">
                  <span className="material-symbols-outlined text-slate-600 text-[20px]">note</span>
                  <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">General Note</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    The District Administration makes efforts to ensure timely disposal of applications. However, the time taken may vary depending on the nature of the case and the concerned department.
                  </p>
                </div>
              </section>

            </div>

            {/* ── RIGHT: Sidebar (1/3 width) ── */}
            <div className="space-y-5">

              {/* Key Features */}
              <aside className="bg-gov-navy shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                  <span className="material-symbols-outlined text-gov-saffron text-[20px]">star</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Key Features</h2>
                </div>
                <ul className="px-5 py-5 space-y-3">
                  {FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-gov-green text-[16px] flex-shrink-0 mt-0.5">check_circle</span>
                      <p className="text-slate-300 text-sm leading-relaxed">{f}</p>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Quick Links */}
              <aside className="bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <span className="material-symbols-outlined text-gov-navy text-[20px]">link</span>
                  <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">Quick Actions</h2>
                </div>
                <div className="px-5 py-5 space-y-3">
                  <Link
                    href="/auth/login?tab=citizen"
                    className="flex items-center justify-between w-full px-4 py-3 bg-gov-navy text-white text-sm font-bold hover:bg-[#001a40] transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">app_registration</span>
                      Submit Arzi
                    </span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                  <Link
                    href="/complaint/track"
                    className="flex items-center justify-between w-full px-4 py-3 border border-gov-navy text-gov-navy text-sm font-bold hover:bg-gov-navy/5 transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">track_changes</span>
                      Track Your Arzi
                    </span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                  <Link
                    href="/departments"
                    className="flex items-center justify-between w-full px-4 py-3 border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">apartment</span>
                      View Departments
                    </span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </aside>

              {/* Contact card */}
              <aside className="bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <span className="material-symbols-outlined text-gov-navy text-[20px]">contact_phone</span>
                  <h2 className="text-sm font-black text-gov-navy uppercase tracking-widest">Contact</h2>
                </div>
                <address className="not-italic px-5 py-5 space-y-3 text-sm text-slate-600">
                  <p className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-gov-navy text-[16px] flex-shrink-0 mt-0.5">domain</span>
                    <span>Office of the Deputy Commissioner,<br />DC Office Complex, Khanabal,<br />Anantnag, J&K – 192101</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gov-navy text-[16px]">call</span>
                    1800-112-233 (Toll Free)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gov-navy text-[16px]">mail</span>
                    dc-anantnag@jk.gov.in
                  </p>
                </address>
              </aside>

            </div>
          </div>
        </div>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0e223d] text-slate-300 border-t-8 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="bg-white w-12 h-12 flex items-center justify-center border-2 border-slate-300 mb-4 p-1">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Official digital portal for public arzi redressal and emergency financial assistance, District Administration, Anantnag.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {NAV_LINKS.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">arrow_right</span>{l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Contact</h4>
              <address className="not-italic text-sm space-y-3">
                <p className="flex items-start gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">domain</span>
                  <span>Office of the Deputy Commissioner,<br />DC Office Complex, Khanabal,<br />Anantnag, J&amp;K – 192101</span>
                </p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">call</span>1800-112-233 (Toll Free)</p>
                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">mail</span>dc-anantnag@jk.gov.in</p>
              </address>
            </div>
          </div>
        </div>
        <div className="bg-[#091526] py-4 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Content Owned, Maintained and Updated by District Administration, Anantnag. · Designed, Developed and Hosted by NIC.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
