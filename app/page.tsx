"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"

const SLIDES = [
  {
    desk: "/Hero/banner-earzi-desk.jpeg",
    mob:  "/Hero/banner-earzi-mob.jpeg",
    alt:  "e-Arzi Portal — Online Grievance & Assistance",
  },
  {
    desk: "/Hero/banner-grievance-desk.jpeg",
    mob:  "/Hero/banner-grievance-mob.jpeg",
    alt:  "Lodge Grievance Online",
  },
  {
    desk: "/Hero/banner-redcross-desk.jpeg",
    mob:  "/Hero/banner-redcross-mob.jpeg",
    alt:  "Red Cross Financial Assistance",
  },
]

const DEPARTMENTS = [
  "Revenue Department",
  "Police Department",
  "Health Department",
  "Education Department",
  "Public Works Department",
  "Jal Shakti Department",
  "Social Welfare Department",
  "Other Departments",
]

export default function LandingPage() {
  const [loginOpen,      setLoginOpen]      = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [slideIdx,       setSlideIdx]       = useState(0)
  const loginRef     = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Auto-advance slides
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && !(e.target as Element).closest("#mobile-toggle")) setMobileMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-inter text-slate-800">

      {/* ─── HEADER ─── */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[88px]">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-black leading-tight uppercase tracking-tight">E-ARZI ANANTNAG</h1>
                <p className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-widest mt-0.5">District Public Service Portal</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { label: "Home",       href: "#home" },
                { label: "Arzi",       href: "#services" },
                { label: "Red Cross",  href: "#red-cross" },
                { label: "Helplines",  href: "/helpline" },
              ].map(item => (
                <a key={item.label} href={item.href} className="text-sm font-bold text-slate-700 hover:text-gov-navy transition-colors border-b-2 border-transparent hover:border-gov-navy py-1 uppercase tracking-wider">
                  {item.label}
                </a>
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
              id="mobile-toggle"
              className="lg:hidden text-gov-navy p-2 border border-slate-300 hover:bg-slate-50 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-300 shadow-xl flex flex-col p-4 space-y-1 z-50">
            {[
              { label: "Home",      href: "#home" },
              { label: "Arzi",      href: "#services" },
              { label: "Red Cross", href: "#red-cross" },
              { label: "Helplines", href: "/helpline" },
            ].map(item => (
              <a key={item.label} href={item.href} className="text-sm font-bold text-slate-700 p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link href="/auth/login?tab=citizen" className="bg-gov-navy text-white text-center font-bold py-3 text-sm" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
              <Link href="/auth/login?tab=staff" className="bg-gov-navy text-white text-center font-bold py-3 text-sm" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
            </div>
            <Link href="/complaint/track" className="bg-slate-100 text-slate-800 border border-slate-300 text-center font-bold py-3 text-sm w-full mt-3 block" onClick={() => setMobileMenuOpen(false)}>
              Track Arzi Status
            </Link>
          </div>
        )}
      </header>

      <main id="home" className="flex-grow">

        {/* ─── HERO BANNER SLIDER ─── */}
        <section className="relative w-full overflow-hidden bg-slate-200">

          {/* Mobile banners (portrait) — hidden on md+ */}
          <div className="md:hidden relative w-full" style={{ aspectRatio: "2/3" }}>
            {SLIDES.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === slideIdx ? 1 : 0 }}
              >
                <img src={s.mob} alt={s.alt} className="w-full h-full object-cover object-top" />
              </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? "bg-white w-6" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop banners (landscape 1600×500) — hidden below md */}
          <div className="hidden md:block relative w-full h-[500px]">
            {SLIDES.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === slideIdx ? 1 : 0 }}
              >
                <img src={s.desk} alt={s.alt} className="w-full h-full object-cover object-center" />
              </div>
            ))}

            {/* Prev / Next arrows */}
            <button
              onClick={() => setSlideIdx(i => (i - 1 + SLIDES.length) % SLIDES.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors rounded"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => setSlideIdx(i => (i + 1) % SLIDES.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors rounded"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === slideIdx ? "bg-white w-8" : "bg-white/50 w-2"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── MAIN SERVICES ─── */}
        <section id="services" className="bg-gov-navy py-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {[
                {
                  icon:   "app_registration",
                  title:  "Lodge Grievance / Submit Arzi",
                  desc:   "Submit your grievance or application online to the concerned department",
                  href:   "/auth/login?tab=citizen",
                  label:  "Submit Arzi",
                  accent: "border-gov-saffron",
                },
                {
                  icon:   "track_changes",
                  title:  "Track Grievance Status",
                  desc:   "Check the current status and updates on your submitted application",
                  href:   "/complaint/track",
                  label:  "Track Now",
                  accent: "border-gov-green",
                },
                {
                  icon:   "volunteer_activism",
                  title:  "Apply for Red Cross Assistance",
                  desc:   "Apply for financial aid in medical emergencies or eligible cases",
                  href:   "/auth/login?tab=citizen",
                  label:  "Apply Now",
                  accent: "border-red-400",
                },
              ].map(s => (
                <div key={s.title} className={`flex items-start gap-4 px-6 py-6 hover:bg-white/5 transition-colors border-l-4 ${s.accent} group`}>
                  <span className="material-symbols-outlined text-white/60 text-[28px] group-hover:text-white transition-colors mt-0.5 flex-shrink-0">{s.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight mb-1">{s.title}</h3>
                    <p className="text-slate-400 text-[12px] leading-relaxed mb-3">{s.desc}</p>
                    <Link href={s.href} className="inline-flex items-center gap-1 text-[11px] font-bold text-white border border-white/30 px-3 py-1.5 hover:bg-white hover:text-gov-navy transition-all">
                      {s.label} <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WELCOME + ABOUT ─── */}
        <section className="py-14 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

              {/* Left: Welcome + About */}
              <div>
                {/* Welcome */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-1 w-10 bg-gov-saffron inline-block" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Official Portal</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-gov-navy uppercase tracking-tight leading-tight mb-4">
                    Welcome to e-Arzi Portal
                  </h2>
                  <p className="text-slate-700 text-base leading-relaxed">
                    e-Arzi Portal is an online platform developed by the <strong>Office of the Deputy Commissioner, Anantnag</strong>, for submission of grievances, requests and applications by citizens. All applications received through this portal are forwarded to the concerned departments for necessary action.
                  </p>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed italic border-l-4 border-gov-saffron pl-4">
                    Citizens are advised to submit their grievances through this portal.
                  </p>
                </div>

                {/* About */}
                <div className="bg-slate-50 border border-slate-200 p-6">
                  <h3 className="text-sm font-black text-gov-navy uppercase tracking-widest mb-4 border-b border-slate-200 pb-3">About the Portal</h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    e-Arzi Portal provides a single system for submission and monitoring of public grievances. All applications submitted through the portal are received at the District Office and forwarded to the concerned department for necessary action.
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">The Portal Provides:</p>
                  <ul className="space-y-2">
                    {[
                      "Submission of grievances online",
                      "Facility to track application status",
                      "Transparent and accountable redressal of issues",
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="material-symbols-outlined text-gov-green text-[16px] flex-shrink-0 mt-0.5">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: How It Works */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-1 w-10 bg-gov-navy inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Process</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gov-navy uppercase tracking-tight mb-8">How It Works</h2>
                <div className="space-y-0">
                  {[
                    { n: "01", title: "Citizen Submits Application Online",     desc: "Register on the portal and fill the online grievance or assistance form." },
                    { n: "02", title: "Application Received at District Office", desc: "The submission is logged at the DC Office, Anantnag with a unique Arzi ID." },
                    { n: "03", title: "Forwarded to Concerned Department",       desc: "The arzi is reviewed and assigned to the relevant department for action." },
                    { n: "04", title: "Department Processes the Application",    desc: "The assigned officer investigates and takes necessary steps to resolve." },
                    { n: "05", title: "Status Updated on the Portal",            desc: "Citizens can track each stage. Resolved cases are marked and closed." },
                  ].map((step, i, arr) => (
                    <div key={step.n} className="flex gap-5 relative">
                      {/* Connector */}
                      {i < arr.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200" />
                      )}
                      {/* Number badge */}
                      <div className="w-10 h-10 flex-shrink-0 bg-gov-navy text-white flex items-center justify-center font-black text-xs z-10">
                        {step.n}
                      </div>
                      <div className="pb-6 flex-1">
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── IMPORTANT INSTRUCTIONS ─── */}
        <section className="py-10 bg-amber-50 border-y border-amber-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="material-symbols-outlined text-amber-600 text-[32px]">warning</span>
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest leading-tight">Important<br />Instructions</h3>
              </div>
              <div className="w-px self-stretch bg-amber-200 hidden md:block" />
              <ul className="grid sm:grid-cols-3 gap-3 flex-1">
                {[
                  "All grievances should be submitted through this portal.",
                  "Anonymous or incomplete applications may not be considered.",
                  "Matters related to court cases, RTI and service matters are not entertained.",
                ].map(inst => (
                  <li key={inst} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[16px] flex-shrink-0 mt-0.5">info</span>
                    <p className="text-sm text-amber-900 leading-relaxed">{inst}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── DEPARTMENTS COVERED ─── */}
        <section className="py-14 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-1 w-10 bg-gov-navy inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Coverage</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gov-navy uppercase tracking-tight">Departments Covered</h2>
              </div>
              <p className="text-slate-500 text-sm max-w-xs text-right">Grievances can be filed against all major departments of the district administration.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEPARTMENTS.map((dept, i) => (
                <div key={dept} className="bg-white border border-slate-200 hover:border-gov-navy hover:bg-gov-navy/5 transition-all p-4 flex items-center gap-3 group cursor-default">
                  <div className="w-8 h-8 bg-gov-navy/10 group-hover:bg-gov-navy/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <span className="text-[10px] font-black text-gov-navy">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-gov-navy leading-tight transition-colors">{dept}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              <span className="material-symbols-outlined text-[13px] align-middle mr-1">info</span>
              Applications submitted are forwarded to the relevant department based on the nature of the grievance.
            </p>
          </div>
        </section>

        {/* ─── RED CROSS ASSISTANCE ─── */}
        <section id="red-cross" className="py-14 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-1 w-10 bg-red-600 inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Financial Aid</span>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  {/* Red Cross icon */}
                  <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center flex-shrink-0 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[20%] bg-white rounded-sm" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[55%] w-[20%] bg-white rounded-sm" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">Red Cross Assistance</h2>
                </div>
                <p className="text-slate-700 text-base leading-relaxed mb-6">
                  Citizens requiring financial assistance for medical emergencies or other eligible cases may apply under Red Cross Assistance. Applications will be verified and processed as per rules by the District Administration, Anantnag.
                </p>
                <div className="bg-red-50 border border-red-200 p-5 mb-8">
                  <h4 className="text-[11px] font-black text-red-700 uppercase tracking-widest mb-3">Eligibility & Process</h4>
                  <ul className="space-y-2">
                    {[
                      "Citizen must be registered on the e-Arzi portal with verified profile",
                      "Submit application with relevant medical reports or supporting documents",
                      "Application reviewed by District Administration as per Red Cross guidelines",
                      "Approved funds disbursed directly to verified bank account",
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-red-900">
                        <span className="material-symbols-outlined text-red-500 text-[14px] flex-shrink-0 mt-0.5">chevron_right</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth/login?tab=citizen" className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 text-sm uppercase tracking-wide transition-colors">
                    Apply for Assistance <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                  <Link href="/complaint/track" className="inline-flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 font-bold px-6 py-3 text-sm uppercase tracking-wide transition-colors">
                    Track Application
                  </Link>
                </div>
              </div>

              {/* Info Panel */}
              <div className="w-full lg:w-[340px] flex-shrink-0">
                <div className="border border-slate-200 bg-slate-50 divide-y divide-slate-200">
                  <div className="px-5 py-4 bg-gov-navy">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Note</p>
                    <p className="text-white font-bold text-sm mt-1 leading-snug">Assistance is provided strictly as per Red Cross rules and available funds.</p>
                  </div>
                  {[
                    { icon: "medical_services",   label: "Medical Emergencies",   desc: "Hospitalisation, surgery, critical illness" },
                    { icon: "local_fire_department", label: "Fire Incidents",     desc: "Loss due to fire, documented by authorities" },
                    { icon: "thunderstorm",        label: "Natural Calamities",   desc: "Flood, landslide, other natural disasters" },
                    { icon: "personal_injury",     label: "Serious Accidents",    desc: "Accident resulting in severe injury or death" },
                  ].map(cat => (
                    <div key={cat.label} className="px-5 py-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 text-[20px] flex-shrink-0 mt-0.5">{cat.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{cat.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── LEADERSHIP ─── */}
      <section className="bg-slate-50 py-12 md:py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-24">

            <div className="flex flex-col items-center text-center w-full max-w-[280px]">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl mb-5 bg-white relative">
                <img src="/Governor.jpg" alt="Lt. Governor" className="absolute inset-0 w-full h-full object-cover object-top" />
              </div>
              <h3 className="text-lg font-black text-gov-navy uppercase leading-tight">Manoj Sinha</h3>
              <p className="text-[13px] font-bold text-slate-500 mt-1 uppercase tracking-wide">Hon'ble Lt. Governor</p>
              <p className="text-[13px] font-bold text-slate-500 mt-2 uppercase tracking-wide border-t border-slate-200 pt-2 w-full">Jammu and Kashmir</p>
            </div>

            <div className="flex flex-col items-center text-center w-full max-w-[280px]">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl mb-5 bg-white relative">
                <img src="/Collector.jpeg" alt="District Magistrate" className="absolute inset-0 w-full h-full object-cover object-top" />
              </div>
              <h3 className="text-lg font-black text-gov-navy uppercase leading-tight">Dr. Bilal Mohiuddin Bhat <span className="block text-sm font-bold mt-1 tracking-widest">(IAS)</span></h3>
              <div className="text-[13px] font-bold text-slate-500 mt-2 uppercase tracking-wide border-t border-slate-200 pt-2 w-full space-y-0.5">
                <p>Collector &amp; District Magistrate</p>
                <p className="text-[11px]">DC / DDC / DM, Anantnag</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="helpdesk" className="bg-[#0e223d] text-slate-300 border-t-8 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            <div>
              <div className="bg-white w-16 h-16 flex items-center justify-center border-2 border-slate-300 mb-6 p-1.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain" />
              </div>
              <p className="text-sm leading-relaxed mb-4 text-slate-400">
                Official digital portal for public arzi redressal and emergency financial assistance. Designed for transparent and responsive administration in Anantnag District.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Important Links</h4>
              <ul className="space-y-3 text-sm">
                {["National Portal of India", "J&K Government Portal", "Digital India", "MyGov Platform", "District NIC Website"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">arrow_right</span>{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Policies</h4>
              <ul className="space-y-3 text-sm">
                {["Right to Information (RTI)", "Privacy Policy", "Terms & Conditions", "Accessibility Statement", "Copyright Policy"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">arrow_right</span>{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Contact Administration</h4>
              <address className="not-italic text-sm space-y-4">
                <p className="flex items-start gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-gov-navy text-[18px]">domain</span>
                  <span>Office of the Deputy Commissioner,<br />DC Office Complex, Khanabal,<br />Anantnag, J&amp;K – 192101</span>
                </p>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-gov-navy text-[18px]">call</span> 1800-112-233 (Toll Free)</p>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-gov-navy text-[18px]">mail</span> dc-anantnag@jk.gov.in</p>
              </address>
            </div>

          </div>
        </div>

        <div className="bg-[#091526] py-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-500 text-center md:text-left leading-relaxed">
              Content Owned, Maintained and Updated by District Administration, Anantnag.<br />
              Designed, Developed and Hosted by National Informatics Centre (NIC), Ministry of Electronics &amp; Information Technology, Government of India.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 border border-slate-700">Govt. Certified Portal</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
