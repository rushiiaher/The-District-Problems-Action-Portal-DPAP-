"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loginRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && !(e.target as Element).closest('#mobile-toggle')) {
         setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-inter overflow-x-hidden">
      {/* Tricolor banner */}
      <div className="gov-banner flex-shrink-0" />

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 tricolor-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo area */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-gov-navy rounded-full flex-shrink-0">
                <span className="text-white text-[10px] md:text-xs font-black">J&amp;K</span>
              </div>
              <div className="border-l border-slate-300 pl-3 md:pl-4">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-gov-navy leading-tight uppercase">E-ARZI ANANTNAG</h1>
                <p className="text-[10px] md:text-xs font-bold text-gov-green uppercase tracking-wide">District Administration Portal</p>
                <p className="text-[9px] md:text-[11px] text-slate-500 hidden sm:block">Government of Jammu &amp; Kashmir</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-8">
              {["Home", "Grievance", "Red Cross", "Contact"].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-extrabold text-slate-700 hover:text-gov-saffron transition-colors border-b-2 border-transparent hover:border-gov-saffron py-1 uppercase tracking-wide">
                  {item}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/complaint/track" className="btn-outline-saffron px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded transition-colors bg-white hover:bg-gov-saffron hover:text-white">
                <span className="material-symbols-outlined text-[18px]">find_in_page</span> Track Status
              </Link>

              {/* Login dropdown */}
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setLoginOpen(o => !o)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gov-navy text-white font-bold text-sm hover:bg-[#001a40] transition-colors shadow-md rounded"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span> Login
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>expand_more</span>
                </button>

                {loginOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded z-50 overflow-hidden">
                    <div className="px-4 py-2.5 bg-gov-navy">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sign in as</p>
                    </div>

                    {/* Citizen option */}
                    <Link href="/auth/login?tab=citizen" onClick={() => setLoginOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-4 hover:bg-amber-50 transition-colors group border-b border-slate-100 cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-gov-saffron/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gov-saffron/20 transition-colors">
                          <span className="material-symbols-outlined text-gov-saffron text-[20px]">person_pin</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-gov-saffron transition-colors">Citizen Login</p>
                          <p className="text-[11px] text-slate-500">OTP on registered mobile</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-[18px] ml-auto group-hover:text-gov-saffron">arrow_forward</span>
                      </div>
                    </Link>

                    {/* Officer / Staff option */}
                    <Link href="/auth/login?tab=staff" onClick={() => setLoginOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-4 hover:bg-blue-50 transition-colors group cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-gov-navy/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gov-navy/20 transition-colors">
                          <span className="material-symbols-outlined text-gov-navy text-[20px]">shield_person</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-gov-navy transition-colors">Staff Login</p>
                          <p className="text-[11px] text-slate-500">Username &amp; password</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-[18px] ml-auto group-hover:text-gov-navy">arrow_forward</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <button 
              id="mobile-toggle"
              className="lg:hidden text-gov-navy p-2 bg-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-gov-saffron"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl flex flex-col p-4 space-y-2 z-50">
            {["Home", "Grievance", "Red Cross", "Contact"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-700 p-3 bg-slate-50 hover:bg-slate-100 rounded uppercase tracking-wide border border-slate-100" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 mt-2">
               <Link href="/auth/login?tab=citizen" className="bg-gov-saffron text-white text-center font-bold py-3 rounded shadow text-sm hover:bg-[#e68a2e]" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
               <Link href="/auth/login?tab=staff" className="bg-gov-navy text-white text-center font-bold py-3 rounded shadow text-sm hover:bg-[#001a40]" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
            </div>
            <Link href="/complaint/track" className="border-2 border-slate-200 text-slate-700 text-center font-bold py-3 rounded text-sm w-full mt-3 bg-white hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
               Track Application Status
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* ─── HERO SECTION ─── */}
        <section id="home" className="relative lg:h-[600px] w-full overflow-hidden bg-[#001a40] flex items-center py-20 lg:py-0">
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=1600&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a40] via-[#001a40]/80 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center w-full">
            <div className="max-w-2xl space-y-6 lg:space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded shadow-lg">
                <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
                Digital India Initiative · Anantnag District
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1]">
                Empowering Citizens, <br />
                <span className="text-gov-saffron">Accelerating Relief.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                The unified portal for registering grievances with local departments and applying for emergency financial aid from the District Red Cross Society.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth/login?tab=citizen" className="bg-gov-saffron text-white px-8 py-4 text-center text-base md:text-lg rounded shadow-lg flex items-center justify-center gap-2 hover:bg-[#e68a2e] transition-colors font-black">
                   <span className="material-symbols-outlined">how_to_reg</span> Register / Apply Here
                </Link>
                <Link href="/complaint/track" className="bg-white/10 backdrop-blur text-white font-bold px-8 py-4 text-center text-base md:text-lg hover:bg-white/20 transition-all border border-white/30 rounded flex items-center justify-center gap-2">
                   <span className="material-symbols-outlined">track_changes</span> Track Status
                </Link>
              </div>
            </div>
          </div>
          
          {/* Ashoka Chakra decorative background */}
          <div className="absolute right-[-10%] bottom-[-20%] opacity-5 pointer-events-none hidden md:block">
            <svg width="600" height="600" viewBox="0 0 100 100" className="text-white fill-current animate-[spin_120s_linear_infinite]">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="currentColor" />
              {Array.from({length: 24}).map((_, i) => (
                <line key={i} x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="1" transform={`rotate(${i * 15} 50 50)`} />
              ))}
            </svg>
          </div>
        </section>

        {/* ─── QUICK STATS ─── */}
        <section className="bg-white border-b border-slate-200 relative z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
              {[
                { label: "Grievances Addressed", value: "24,500+", icon: "fact_check", color: "text-gov-navy", bg: "bg-gov-navy/10" },
                { label: "Red Cross Aid Released", value: "₹4.2 Cr+", icon: "volunteer_activism", color: "text-red-600", bg: "bg-red-50" },
                { label: "Average Resolution", value: "6.5 Days", icon: "update", color: "text-gov-saffron", bg: "bg-amber-50" },
                { label: "Active Departments", value: "45", icon: "account_balance", color: "text-gov-green", bg: "bg-green-50" },
              ].map((stat, i) => (
                <div key={i} className="p-6 md:p-8 text-center flex flex-col items-center">
                  <span className={`material-symbols-outlined text-3xl md:text-3xl mb-4 ${stat.color} ${stat.bg} w-14 h-14 flex items-center justify-center rounded-full`}>{stat.icon}</span>
                  <p className="text-2xl md:text-3xl font-black text-slate-800">{stat.value}</p>
                  <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── GRIEVANCE SECTION ─── */}
        <section id="grievance" className="py-20 md:py-28 bg-[#f4f7f9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-gov-navy font-bold tracking-widest uppercase text-xs md:text-[11px] bg-gov-navy/10 px-3 py-1 rounded-full inline-block mb-4">Grievance Redressal</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight mb-6 mt-2">Raise your Concerns <br/>Seamlessly</h2>
              <p className="text-slate-600 text-base md:text-lg">Experience a streamlined, accountable, and transparent system designed to escalate and resolve your district-level grievances with strict SLA monitoring.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-1 bg-slate-200 z-0 border-t border-b border-white"></div>

              {[
                { step: "01", title: "Register Account", desc: "Create a citizen profile online securely using your mobile number and an OTP.", icon: "how_to_reg" },
                { step: "02", title: "Submit Details", desc: "Select the appropriate department, describe your issue, and attach any photo/video proof.", icon: "post_add" },
                { step: "03", title: "Track Progress", desc: "Your issue is assigned to an officer. Track its exact status and timeline in real-time.", icon: "query_stats" },
              ].map((s, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-[#f4f7f9] shadow-xl rounded-full flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300">
                     <span className="material-symbols-outlined text-gov-navy text-3xl md:text-4xl">{s.icon}</span>
                     <span className="absolute -top-1 -right-1 bg-gov-saffron text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full border-2 border-[#f4f7f9] shadow-sm">{s.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base px-2">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link href="/auth/login?tab=citizen" className="inline-flex items-center gap-2 bg-gov-navy text-white font-bold px-8 py-4 rounded shadow-lg hover:bg-[#001a40] transition-transform hover:-translate-y-1 text-base md:text-lg">
                File a Grievance Now <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── RED CROSS SECTION ─── */}
        <section id="red-cross" className="py-20 md:py-28 bg-white overflow-hidden border-t-4 border-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              
              {/* Image Side */}
              <div className="w-full lg:w-1/2 relative order-last lg:order-first">
                {/* Red Cross Deco */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-60 z-0"></div>
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src="https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=800&q=80" alt="District Red Cross Support" className="w-full h-[350px] md:h-[450px] object-cover" />
                  
                  {/* Overlay badge */}
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white flex items-center gap-4 max-w-sm">
                    <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center flex-shrink-0 shadow-inner">
                      <div className="relative w-6 h-6">
                         <div className="absolute top-0 bottom-0 left-[9px] right-[9px] bg-white rounded-sm"></div>
                         <div className="absolute left-0 right-0 top-[9px] bottom-[9px] bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">District Red Cross Society</p>
                      <p className="text-sm font-black text-slate-900 leading-tight">Humanity, Impartiality, Neutrality</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 space-y-6">
                <span className="text-red-600 font-bold tracking-widest uppercase text-xs md:text-[11px] bg-red-50 border border-red-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Emergency Relief Aid</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight">Financial Aid for<br/><span className="text-red-600">Distressed Families</span></h2>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                  The District Administration, acting through the Indian Red Cross Society branch, provides emergency financial aid to citizens facing dire circumstances such as natural disasters, fire incidents, extreme medical emergencies, and accidents.
                </p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-slate-900 tracking-wide flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-red-500">list_alt</span>
                     How to apply for aid:
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { icon: "person_check", title: "1. Complete Profile", desc: "Register as a citizen and ensure your Aadhaar and location details are complete." },
                      { icon: "note_add", title: "2. Submit Application", desc: "Go to the 'Red Cross' tab in your dashboard, declare the purpose, amount, and upload proofs (e.g., medical/fire reports)." },
                      { icon: "done_all", title: "3. Review & Disbursal", desc: "Applications are vetted by the District Collector's office and disbursed securely via official Bank Managers." }
                    ].map((li, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                           <span className="material-symbols-outlined text-[16px]">{li.icon}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-slate-900 block mb-0.5">{li.title}</strong> {li.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/auth/login?tab=citizen" className="inline-flex items-center justify-center md:justify-start gap-2 bg-red-600 text-white font-bold px-8 py-4 rounded shadow-lg hover:bg-red-700 transition-transform hover:-translate-y-1 text-base md:text-lg w-full md:w-auto">
                    Apply for Financial Aid <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer id="contact" className="bg-[#001530] text-slate-400 pt-16 md:pt-20 border-t-4 border-gov-saffron">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-12 h-12 bg-gov-saffron rounded-full flex items-center justify-center text-xs font-black shadow-lg">J&amp;K</div>
                  <div>
                    <span className="text-2xl font-black tracking-tighter block leading-none">E-ARZI</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Anantnag District</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm leading-relaxed border-l-2 border-slate-700 pl-4">Official digital portal of Anantnag District Administration. Designed for citizen-centric services, transparent grievance redressal, and rapid emergency aid response.</p>
              </div>

              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gov-saffron text-lg">link</span> Useful Links
                </h4>
                <ul className="space-y-3 text-sm">
                  {["National Portal of India", "J&K Government Portal", "Digital India", "MyGov Portal"].map(l => (
                    <li key={l}><a href="#" className="hover:text-gov-saffron transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-gov-saffron" />{l}</a></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gov-green text-lg">policy</span> Information
                </h4>
                <ul className="space-y-3 text-sm">
                  {["Right to Information (RTI)", "Privacy Policy", "Terms & Conditions", "Accessibility Statement"].map(l => (
                    <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-lg">contact_support</span> Contact Us
                </h4>
                <address className="not-italic text-sm space-y-4">
                  <p className="flex items-start gap-3 bg-slate-800/50 p-3 rounded border border-slate-800">
                    <span className="material-symbols-outlined text-gov-saffron">location_on</span>
                    <span className="leading-snug">DC Office Complex,<br />Khanabal, Anantnag,<br />J&amp;K – 192101</span>
                  </p>
                  <p className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><span className="material-symbols-outlined text-gov-saffron bg-slate-800/50 w-8 h-8 rounded flex items-center justify-center">phone</span> 1800-112-233</p>
                  <p className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><span className="material-symbols-outlined text-gov-saffron bg-slate-800/50 w-8 h-8 rounded flex items-center justify-center">mail</span> dc-anantnag@jk.gov.in</p>
                </address>
              </div>
            </div>
          </div>

          <div className="bg-[#000d1f] border-t border-slate-800 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] md:text-[11px] text-slate-500 text-center md:text-left leading-relaxed">
                © 2026 District Administration Anantnag. All rights reserved.<br />
                Content Owned, Maintained and Updated by District Administration, Anantnag. Designed and Hosted by National Informatics Centre (NIC).
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="material-symbols-outlined text-gov-green text-sm">verified</span>
                Govt. Portal
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
