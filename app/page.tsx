"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loginRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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
    <div className="flex flex-col min-h-screen bg-slate-50 font-inter text-slate-800">
      
      {/* ─── GOV TOP STRIP ─── */}
      <div className="bg-[#0f172a] text-slate-300 text-[11px] py-1 border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wider text-white">Government of Jammu &amp; Kashmir</span>
            <span className="hidden sm:inline border-l border-slate-600 pl-3">District Administration Anantnag</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline cursor-pointer hover:text-white">Skip to main content</span>
            <span className="flex items-center gap-2 cursor-pointer hover:text-white">
              <span className="material-symbols-outlined text-[14px]">translate</span> English
            </span>
          </div>
        </div>
      </div>

      {/* ─── HEADER ─── */}
      <header className="bg-white border-b-4 border-gov-saffron shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[88px]">
            {/* Logo area */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-gov-navy text-white text-[12px] md:text-sm font-black border-2 border-slate-200">
                J&amp;K
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gov-navy leading-tight uppercase tracking-tight">E-ARZI ANANTNAG</h1>
                <p className="text-[10px] md:text-[11px] font-bold text-gov-green uppercase tracking-widest mt-0.5">District Public Service Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {["Home", "Grievance Mechanism", "Red Cross Society", "Helpdesk"].map(item => (
                <a key={item} href={`#${item.split(' ')[0].toLowerCase()}`} className="text-sm font-bold text-slate-700 hover:text-gov-navy transition-colors border-b-2 border-transparent hover:border-gov-saffron py-1 uppercase tracking-wider">
                  {item}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/complaint/track" className="bg-slate-100 hover:bg-slate-200 text-gov-navy border border-slate-300 px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">search</span> Track Application
              </Link>

              {/* Login dropdown */}
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
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gov-saffron/10 transition-colors border-b border-slate-100 cursor-pointer">
                        <span className="material-symbols-outlined text-gov-saffron">badge</span>
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
            {["Home", "Grievance Mechanism", "Red Cross Society", "Helpdesk"].map(item => (
              <a key={item} href={`#${item.split(' ')[0].toLowerCase()}`} className="text-sm font-bold text-slate-700 p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4">
               <Link href="/auth/login?tab=citizen" className="bg-gov-saffron text-white text-center font-bold py-3 text-sm border border-[#e68a2e]" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
               <Link href="/auth/login?tab=staff" className="bg-gov-navy text-white text-center font-bold py-3 text-sm border border-[#001a40]" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
            </div>
            <Link href="/complaint/track" className="bg-slate-100 text-slate-800 border border-slate-300 text-center font-bold py-3 text-sm w-full mt-3 block" onClick={() => setMobileMenuOpen(false)}>
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

        {/* ─── GRIEVANCE MECHANISM SECTION ─── */}
        <section id="grievance" className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-12 border-b-2 border-slate-100 pb-4">
              <h2 className="text-2xl md:text-3xl font-black text-gov-navy uppercase tracking-tight">Public Grievance Redressal</h2>
              <p className="text-slate-600 mt-2 font-medium">Lodge an administrative complaint securely and track its escalation to the concerned departments.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "Step 1", title: "Citizen Registration", desc: "Create your citizen profile online using your mobile number and an OTP. Aadhaar details are required for identification.", icon: "group_add" },
                { step: "Step 2", title: "Lodge Complaint", desc: "Select the respective department, provide a detailed description of the issue, and attach photographic evidence or documents.", icon: "app_registration" },
                { step: "Step 3", title: "Track & Resolve", desc: "A unique Grievance ID will be generated. Track the resolution process online. Cases exceeding SLAs are automatically escalated.", icon: "troubleshoot" },
              ].map((s, i) => (
                <div key={i} className="border border-slate-200 bg-slate-50 p-6 md:p-8 hover:border-gov-saffron hover:bg-white transition-colors duration-200 group">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="bg-gov-navy text-white w-12 h-12 flex items-center justify-center border border-slate-300 group-hover:bg-gov-saffron transition-colors">
                        <span className="material-symbols-outlined">{s.icon}</span>
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 uppercase">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/auth/login?tab=citizen" className="inline-flex items-center gap-2 bg-gov-navy hover:bg-[#061426] text-white font-bold px-6 py-3 border border-[#061426] text-sm uppercase tracking-wide">
                Proceed to Grievance Portal <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── RED CROSS SOCIETY SECTION ─── */}
        <section id="red" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
              
              {/* Text Side */}
              <div className="w-full lg:w-3/5">
                <div className="mb-8 border-b-2 border-red-200 pb-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-bold relative p-1">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[20%] bg-white rounded-sm" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60%] w-[20%] bg-white rounded-sm" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">District Red Cross Aid</h2>
                    <p className="text-slate-600 text-sm font-bold uppercase tracking-widest mt-1 text-red-700">Financial Assistance for Distressed Citizens</p>
                  </div>
                </div>

                <p className="text-slate-700 text-base leading-relaxed mb-6">
                  The District Red Cross Society provides direct emergency financial assistance to citizens facing catastrophic events. Aid is formally sanctioned for medical emergencies, natural disasters, fire incidents, and severe accidents.
                </p>
                
                <div className="bg-white border border-slate-200 p-6 mb-8">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 text-sm">Procedure for Application</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: "assignment_ind", text: "Register an account on the E-Arzi platform and ensure demographic details are fully verified." },
                      { icon: "upload_file", text: "Submit an online aid request detailing the incident. Mandatory attachments include medical reports, FIRs, or fire department certificates." },
                      { icon: "account_balance", text: "Approved funds are disbursed directly to verified accounts via authorized Bank Managers of the District." }
                    ].map((li, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-600 text-[18px] mt-0.5">{li.icon}</span>
                        <p className="text-sm text-slate-700 leading-snug">{li.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4">
                   <Link href="/auth/login?tab=citizen" className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 border border-red-900 text-sm uppercase tracking-wide">
                     Apply for Financial Aid <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                   </Link>
                   <Link href="/citizen/red-cross/status" className="inline-flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 font-bold px-6 py-3 text-sm uppercase tracking-wide">
                     View Aid Status
                   </Link>
                </div>
              </div>

              {/* Image Side */}
              <div className="w-full lg:w-2/5">
                <div className="bg-white p-3 border border-slate-300 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80" alt="Red Cross Support Services" className="w-full h-[300px] md:h-[400px] object-cover border border-slate-100" />
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Humanity, Impartiality, Independence</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer id="helpdesk" className="bg-[#0e223d] text-slate-300 pt-12 md:pt-16 border-t-8 border-gov-saffron">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Dept Info */}
            <div>
              <div className="bg-white text-gov-navy w-16 h-16 flex items-center justify-center font-black text-sm border-2 border-slate-300 mb-6">
                J&amp;K
              </div>
              <p className="text-sm leading-relaxed mb-4 text-slate-400">
                Official digital portal for public grievance redressal and public assistance. Designed for transparent and responsive administration in Anantnag District.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Important Links</h4>
              <ul className="space-y-3 text-sm">
                {["National Portal of India", "J&K Government Portal", "Digital India", "MyGov Platform", "District NIC Website"].map(l => (
                  <li key={l}><a href="#" className="hover:text-gov-saffron transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">arrow_right</span>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Policies</h4>
              <ul className="space-y-3 text-sm">
                {["Right to Information (RTI)", "Privacy Policy", "Terms & Conditions", "Accessibility Statement", "Copyright Policy"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">arrow_right</span>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Contact Administration</h4>
              <address className="not-italic text-sm space-y-4">
                <p className="flex items-start gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-gov-saffron text-[18px]">domain</span>
                  <span>Office of the Deputy Commissioner,<br />DC Office Complex, Khanabal,<br />Anantnag, J&amp;K – 192101</span>
                </p>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-gov-saffron text-[18px]">call</span> 1800-112-233 (Toll Free)</p>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-gov-saffron text-[18px]">mail</span> dc-anantnag@jk.gov.in</p>
              </address>
            </div>
            
          </div>
        </div>

        {/* Bottom Bar */}
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
