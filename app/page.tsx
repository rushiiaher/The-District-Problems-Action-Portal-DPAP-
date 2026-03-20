"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [trackId, setTrackId] = useState("")
  const [loginOpen, setLoginOpen] = useState(false)
  const loginRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackId.trim()) router.push(`/complaint/track?id=${trackId.trim()}`)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white font-inter">
      {/* Tricolor banner */}
      <div className="gov-banner" />


      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 tricolor-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-4">
              {/* Govt emblem placeholder */}
              <div className="w-14 h-14 flex items-center justify-center bg-gov-navy rounded-full">
                <span className="text-white text-xs font-black">J&K</span>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <h1 className="text-2xl font-black tracking-tight text-gov-navy leading-tight uppercase">E-ARZI ANANTNAG</h1>
                <p className="text-sm font-semibold text-gov-green uppercase tracking-wide">District Grievance Redressal Portal</p>
                <p className="text-[11px] text-slate-500">Anantnag District Administration, J&K</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-6">
              {["Home", "About District", "Departments", "Contact Us"].map(item => (
                <a key={item} href="#" className="text-sm font-bold text-slate-700 hover:text-gov-saffron transition-colors border-b-2 border-transparent hover:border-gov-saffron py-1">{item}</a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/complaint/track">
                <button className="btn-outline-saffron px-4 py-2 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">find_in_page</span>
                  Track Status
                </button>
              </Link>

              {/* Login dropdown */}
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setLoginOpen(o => !o)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gov-navy text-gov-navy font-bold text-sm hover:bg-gov-navy hover:text-white transition-all rounded"
                  style={{ borderRadius: 4 }}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Login
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>expand_more</span>
                </button>

                {loginOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded z-50 overflow-hidden">
                    {/* Dropdown header */}
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
                          <p className="font-bold text-slate-800 text-sm group-hover:text-gov-navy transition-colors">Officer / Staff Login</p>
                          <p className="text-[11px] text-slate-500">Username &amp; password</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-[18px] ml-auto group-hover:text-gov-navy">arrow_forward</span>
                      </div>
                    </Link>

                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 text-center">Anantnag District Administration Portal</p>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/auth/login?tab=citizen">
                <button className="btn-gov-green px-4 py-2 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  Submit Grievance
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative h-[520px] w-full overflow-hidden bg-slate-900">
          <div
            className="absolute inset-0 opacity-60 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-start">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded">
                <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse" />
                Digital India Initiative
              </div>
              <h2 className="text-5xl font-black text-white leading-tight">
                Transparent Governance for{" "}
                <span className="text-gov-saffron">Anantnag District.</span>
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed">
                Providing a robust and responsive mechanism for the citizens of Anantnag to voice their concerns and seek timely resolutions from the administration.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/auth/login">
                  <button className="btn-saffron px-10 py-4 text-lg">Submit New Grievance</button>
                </Link>
                <Link href="/complaint/track">
                  <button className="bg-white text-gov-navy font-bold px-10 py-4 text-lg hover:bg-slate-100 transition-all border border-slate-200" style={{ borderRadius: 4 }}>
                    Track Application
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {/* Ashoka Chakra decoration */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <svg width="500" height="500" viewBox="0 0 100 100" className="text-white fill-current">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="15" fill="currentColor" />
            </svg>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-white relative -mt-12 z-10 mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 shadow-2xl rounded overflow-hidden border border-slate-200">
            <div className="bg-slate-50 p-8 flex flex-col items-center text-center border-r border-slate-200">
              <span className="material-symbols-outlined text-gov-navy text-4xl mb-2">description</span>
              <div className="text-3xl font-black">12,450</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Total Grievances</div>
            </div>
            <div className="bg-white p-8 flex flex-col items-center text-center border-r border-slate-200">
              <span className="material-symbols-outlined text-gov-green text-4xl mb-2">task_alt</span>
              <div className="text-3xl font-black">10,582</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Resolved Cases</div>
            </div>
            <div className="bg-slate-50 p-8 flex flex-col items-center text-center border-r border-slate-200">
              <span className="material-symbols-outlined text-gov-saffron text-4xl mb-2">update</span>
              <div className="text-3xl font-black">24 hrs</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Avg. Response Time</div>
            </div>
            <div className="bg-gov-navy p-8 flex flex-col items-center text-center text-white">
              <span className="material-symbols-outlined text-4xl mb-2">support_agent</span>
              <div className="text-xl font-bold">Helpdesk Support</div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-80 mt-1">Available 24/7</div>
            </div>
          </div>
        </section>

        {/* Know Your District */}
        <section className="py-20 bg-[#f4f7f9]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="h-1.5 w-20 bg-gov-saffron mb-4" />
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                  Know Your District: <span className="text-gov-saffron">Anantnag</span>
                </h2>
                <p className="text-slate-600 max-w-xl mt-2 text-lg">
                  The administrative, cultural, and spiritual gateway to the Kashmir Valley, renowned for its heritage and natural splendor.
                </p>
              </div>
              <button className="bg-white px-6 py-2 border border-slate-300 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 rounded">
                View Official Directory <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Heritage", color: "bg-gov-saffron", title: "Martand Sun Temple", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80" },
                { label: "Nature", color: "bg-gov-green", title: "Achabal Mughal Gardens", img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=80" },
                { label: "Tourism", color: "bg-gov-navy", title: "Pahalgam Valley", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" },
              ].map(card => (
                <div key={card.title} className="group relative h-80 rounded shadow-lg overflow-hidden">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <span className={`inline-block px-2 py-0.5 ${card.color} text-[10px] font-bold text-white uppercase mb-2`}>{card.label}</span>
                    <h4 className="text-xl font-bold text-white">{card.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assistance & Submit Form */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-black mb-6 text-slate-900 uppercase tracking-tight">Assistance &amp; Support</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">For any technical difficulties or guidance regarding the application process, please reach out to the District Informatics Center.</p>
                <div className="space-y-8">
                  {[
                    { icon: "phone_in_talk", color: "text-gov-navy", label: "Toll Free Helpline", value: "1800-112-233" },
                    { icon: "alternate_email", color: "text-gov-green", label: "Email Support", value: "helpdesk-ant@jk.gov.in" },
                    { icon: "location_on", color: "text-gov-saffron", label: "Office Address", value: "District Administration Complex, Anantnag, J&K – 192101" },
                  ].map(item => (
                    <div key={item.label} className="flex gap-4">
                      <div className="bg-slate-100 p-3 rounded h-fit">
                        <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</h4>
                        <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 bg-slate-50 p-8 md:p-12 border border-slate-200 rounded">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="material-symbols-outlined text-gov-saffron">mail</span>
                  Submit a Query
                </h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                    <input className="w-full border-slate-300 rounded focus:border-gov-saffron focus:ring-gov-saffron bg-white px-3 py-2 border text-sm" placeholder="As per Aadhaar" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Contact Number</label>
                    <input className="w-full border-slate-300 rounded focus:border-gov-saffron focus:ring-gov-saffron bg-white px-3 py-2 border text-sm" placeholder="+91 00000 00000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email ID</label>
                    <input type="email" className="w-full border-slate-300 rounded focus:border-gov-saffron bg-white px-3 py-2 border text-sm" placeholder="example@domain.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Message / Query Description</label>
                    <textarea className="w-full border-slate-300 rounded focus:border-gov-saffron bg-white px-3 py-2 border text-sm" rows={4} placeholder="Please provide details..." />
                  </div>
                  <div className="md:col-span-2">
                    <button className="w-full btn-navy py-4 text-base flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined">send</span>
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-16 border-t-4 border-gov-saffron">
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 text-white mb-6">
                <div className="w-10 h-10 bg-gov-navy rounded-full flex items-center justify-center text-xs font-black">J&K</div>
                <span className="text-2xl font-black tracking-tighter">E-ARZI</span>
              </div>
              <p className="text-sm leading-relaxed mb-8">Official portal of Anantnag District Administration. Designed for citizen-centric digital services and transparent administration.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Government Links</h4>
              <ul className="space-y-3 text-sm">
                {["National Portal of India", "J&K Government Portal", "Digital India", "MyGov Portal"].map(l => (
                  <li key={l}><a href="#" className="hover:text-gov-saffron flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gov-saffron" />{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Information</h4>
              <ul className="space-y-3 text-sm">
                {["Right to Information (RTI)", "Privacy Policy", "Terms & Conditions", "Accessibility Statement", "Hyperlinking Policy"].map(l => (
                  <li key={l}><a href="#" className="hover:text-gov-saffron">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">DC Office Anantnag</h4>
              <address className="not-italic text-sm space-y-4">
                <p className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gov-saffron mt-1">location_on</span>
                  <span>DC Office Complex,<br />Khanabal, Anantnag,<br />J&K – 192101</span>
                </p>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-gov-saffron">phone</span>01932-222333</p>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-gov-saffron">mail</span>dc-anantnag@jk.gov.in</p>
              </address>
            </div>
          </div>
        </div>
        <div className="bg-slate-950 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-500 text-center md:text-left">
              © 2026 District Administration Anantnag. All rights reserved.<br />
              Content Owned, Maintained and Updated by District Administration, Anantnag. Designed and Hosted by National Informatics Centre (NIC).
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="material-symbols-outlined text-gov-green text-sm">verified</span>
              Govt. of India Certified Portal
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
