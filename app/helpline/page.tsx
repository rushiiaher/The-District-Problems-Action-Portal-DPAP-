"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"

const emergencyServices = [
  { service: "Police Control Room", number: "01932-224371, 22870" },
  { service: "Police", number: "100" },
  { service: "Fire", number: "101" },
  { service: "Ambulance", number: "102, 108" },
  { service: "Women Helpline", number: "1091" },
  { service: "Child Helpline", number: "1098" },
  { service: "CA&PD", number: "1967" },
  { service: "PDD Bills", number: "1912" },
  { service: "Amarnath Ji Shrine Board", number: "14464" },
]

const utilityServices = [
  { service: "INDIAN AIRLINES - General Enquiry", number: "1400" },
  { service: "INDIAN AIRLINES - Reservation", number: "1401" },
  { service: "Railways – General Enquiry", number: "131, 1330, 1335" },
  { service: "Railways – Reservation Enquiry", number: "1345" },
]

const nodalOfficers = [
  { name: "Syeed Fakhrudin Hamid, IAS", post: "Deputy Commissioner", department: "District Administration", phone: "01932-222337", email: "dc-anantnagjk@gov.in" },
  { name: "Mr. Sandeep Singh Bali (JKAS)", post: "Addl. Deputy Commr. Anantnag", department: "District Administration", phone: "9018991010", email: "-" },
  { name: "Mr. Muzamil Maqbool Beigh (KAS)", post: "Addl. Deputy Commr. Anantnag", department: "District Administration", phone: "9484003002", email: "-" },
  { name: "Mr. Tariq Ahmad Malik (JKAS)", post: "Assistant Commr. (R) Anantnag", department: "Revenue", phone: "9484003007", email: "-" },
  { name: "Mr. Tawseef Ahmad Malik", post: "CPO, Anantnag", department: "Police", phone: "7780801298", email: "-" },
  { name: "Mr. Umair Ahmad Beig", post: "Distt. Informatics Officer NIC", department: "NIC", phone: "7780983545", email: "anantnag@nic.in" },
  { name: "Mr. Nisar Ahmad Wani", post: "Dy District Election Officer", department: "Election", phone: "7006835649", email: "-" },
  { name: "Haji Reyaz Ahmad", post: "P.A. to D.C.", department: "DC Office", phone: "7006752095", email: "-" },
  { name: "Mr. Qaiser Mehmood (JKAS)", post: "SDM PAHALGAM", department: "Sub-Division", phone: "9797620403", email: "-" },
  { name: "Mr. Suheel Ahmad Lone (JKAS)", post: "SDM KOKERNAG", department: "Sub-Division", phone: "9906783807", email: "-" },
  { name: "Mr. Parvaiz Rahim (JKAS)", post: "SDM DOORU", department: "Sub-Division", phone: "9622674175", email: "-" },
  { name: "Mr. Tanveer Ahmad (JKAS)", post: "SDM BIJBEHARA", department: "Sub-Division", phone: "9419134556", email: "-" },
]

export default function HelplinePage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loginRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) &&
          !(e.target as Element).closest('#mobile-toggle-helpline')) setMobileMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[88px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-black leading-tight uppercase tracking-tight">E-ARZI ANANTNAG</h1>
                <p className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-widest mt-0.5">District Public Service Portal</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { label: "Home", href: "/" },
                { label: "Arzi", href: "/#grievance" },
                { label: "Red Cross", href: "/#red" },
                { label: "Helplines", href: "/helpline" },
              ].map(item => (
                <Link key={item.label} href={item.href} className="text-sm font-bold text-slate-700 hover:text-gov-navy transition-colors border-b-2 border-transparent hover:border-gov-navy py-1 uppercase tracking-wider">
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/complaint/track" className="bg-slate-100 hover:bg-slate-200 text-gov-navy border border-slate-300 px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">search</span> Track Arzi
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
              id="mobile-toggle-helpline"
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
              { label: "Home", href: "/" },
              { label: "Arzi", href: "/#grievance" },
              { label: "Red Cross", href: "/#red" },
              { label: "Helplines", href: "/helpline" },
            ].map(item => (
              <Link key={item.label} href={item.href} className="text-sm font-bold text-slate-700 p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link href="/auth/login?tab=citizen" className="bg-gov-navy text-white text-center font-bold py-3 text-sm border border-[#001a40]" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
              <Link href="/auth/login?tab=staff" className="bg-gov-navy text-white text-center font-bold py-3 text-sm border border-[#001a40]" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
            </div>
            <Link href="/complaint/track" className="bg-slate-100 text-slate-800 border border-slate-300 text-center font-bold py-3 text-sm w-full mt-3 block" onClick={() => setMobileMenuOpen(false)}>
              Track Arzi Status
            </Link>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 md:px-8 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gov-navy uppercase tracking-tight mb-2">Important Helplines</h2>
          <div className="h-1 w-24 bg-gov-navy mx-auto mb-4" />
          <p className="text-slate-600 font-medium max-w-2xl mx-auto">
            Official emergency and public utility contact numbers for the citizens of District Anantnag. These lines are monitored by the respective departments.
          </p>
        </div>

        {/* Emergency Services Table */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-200 pb-3">
            <div className="w-10 h-10 bg-gov-navy rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined">emergency</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Emergency Services</h3>
          </div>
          
          <div className="bg-white border border-slate-300 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider w-2/3 border-r border-slate-200">Helpline Service</th>
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider w-1/3">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {emergencyServices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-800 border-r border-slate-100">{item.service}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gov-green">{item.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Public Utility Services Table */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-200 pb-3">
            <div className="w-10 h-10 bg-gov-navy rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined">public</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Public Utility Services</h3>
          </div>
          
          <div className="bg-white border border-slate-300 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider w-2/3 border-r border-slate-200">Helpline Service</th>
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider w-1/3">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {utilityServices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-800 border-r border-slate-100">{item.service}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gov-green">{item.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nodal Officers Table */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-200 pb-3">
            <div className="w-10 h-10 bg-gov-navy rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nodal Officers Directory</h3>
          </div>
          
          <div className="bg-white border border-slate-300 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider border-r border-slate-200 lg:w-1/4">Name</th>
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider border-r border-slate-200 lg:w-1/4">Post / Designation</th>
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider border-r border-slate-200 lg:w-1/4">Department</th>
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider border-r border-slate-200">Phone</th>
                  <th className="py-4 px-6 font-bold text-gov-navy uppercase text-sm tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {nodalOfficers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-black text-slate-800 border-r border-slate-100 placeholder-slate-400">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-slate-700 border-r border-slate-100">{item.post}</td>
                    <td className="py-4 px-6 text-sm text-slate-700 border-r border-slate-100 font-medium">{item.department}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gov-navy border-r border-slate-100">{item.phone}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{item.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      
      {/* FOOTER */}
      <footer className="bg-[#0e223d] border-t-8 border-gov-navy mt-auto">
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
