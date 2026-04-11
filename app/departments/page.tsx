"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"

const DEPARTMENTS = [
  { name: "District Administration",                              icon: "account_balance"    },
  { name: "Revenue Department",                                   icon: "receipt_long"       },
  { name: "Planning Department",                                  icon: "analytics"          },
  { name: "Rural Development Department",                         icon: "cottage"            },
  { name: "Public Works Department (PWD)",                        icon: "construction"       },
  { name: "Jal Shakti Department",                                icon: "water_drop"         },
  { name: "Power Development Department (PDD)",                   icon: "bolt"               },
  { name: "Mechanical Engineering Department",                    icon: "settings"           },
  { name: "Health & Medical Education Department",                icon: "local_hospital"     },
  { name: "Agriculture Production Department",                    icon: "eco"                },
  { name: "Animal Husbandry Department",                          icon: "pets"               },
  { name: "Horticulture Department",                              icon: "park"               },
  { name: "School Education Department",                          icon: "school"             },
  { name: "Finance Department",                                   icon: "account_balance_wallet" },
  { name: "Geology & Mining Department",                          icon: "landscape"          },
  { name: "Panchayati Raj Department",                            icon: "holiday_village"    },
  { name: "Sheep Husbandry Department",                           icon: "agriculture"        },
  { name: "Fisheries Department",                                 icon: "set_meal"           },
  { name: "Employment Department",                                icon: "work"               },
  { name: "Sericulture Department",                               icon: "pest_control"       },
  { name: "Economics & Statistics Department",                    icon: "bar_chart"          },
  { name: "Fire & Emergency Services",                            icon: "local_fire_department" },
  { name: "Forest Department",                                    icon: "forest"             },
  { name: "Youth Services & Sports Department",                   icon: "sports"             },
  { name: "Consumer Affairs & Public Distribution Department",    icon: "store"              },
  { name: "Social Welfare Department",                            icon: "volunteer_activism" },
  { name: "Transport Department",                                 icon: "directions_bus"     },
  { name: "Labour & Employment Department",                       icon: "engineering"        },
  { name: "Floriculture Department",                              icon: "local_florist"      },
  { name: "Cooperative Department",                               icon: "groups"             },
  { name: "Handloom & Handicrafts Department",                    icon: "design_services"    },
  { name: "AYUSH Department",                                     icon: "spa"                },
  { name: "Police Department",                                    icon: "local_police"       },
  { name: "Urban Local Bodies (ULB)",                             icon: "location_city"      },
  { name: "J&K State Road Transport Corporation (SRTC)",          icon: "directions_bus"     },
  { name: "Lead Bank Office",                                     icon: "corporate_fare"     },
  { name: "Integrated Child Development Services (ICDS)",         icon: "child_care"         },
  { name: "Industries & Commerce Department",                     icon: "factory"            },
]

const NAV_LINKS = [
  { label: "Home",        href: "/"            },
  { label: "Arzi",        href: "/#services"   },
  { label: "Departments", href: "/departments" },
  { label: "About",       href: "/about"       },
  { label: "Red Cross",   href: "/#red-cross"  },
  { label: "Helplines",   href: "/helpline"    },
]

export default function DepartmentsPage() {
  const [loginOpen,      setLoginOpen]      = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loginRef      = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && !(e.target as Element).closest("#dept-mobile-toggle")) setMobileMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-inter text-slate-800">

      {/* ─── HEADER ─── */}
      <header className="bg-white shadow-sm sticky top-8 z-50 border-b border-black">
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
                    item.label === "Departments"
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
              id="dept-mobile-toggle"
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
                className={`text-sm font-bold p-3 hover:bg-slate-50 uppercase tracking-wide border-b border-slate-100 block ${item.label === "Departments" ? "text-gov-navy bg-gov-navy/5" : "text-slate-700"}`}
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
              <span className="text-white font-bold">Departments</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-white/30 text-[40px]">apartment</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">Departments</h1>
                <p className="text-slate-300 text-sm font-medium mt-1">District Administration, Anantnag</p>
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

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-8">

          {/* ─── ABOUT ─── */}
          <section className="bg-white border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-gov-navy text-[28px] flex-shrink-0 mt-0.5">info</span>
              <div>
                <h2 className="text-lg font-black text-gov-navy uppercase tracking-wide mb-3">About Departments</h2>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Various departments of the District Administration are responsible for handling different types of public grievances, requests and applications. Through the <strong>e-Arzi Portal</strong>, citizens can submit their applications to the appropriate department.
                </p>
              </div>
            </div>
          </section>

          {/* ─── SELECTION GUIDANCE ─── */}
          <section className="bg-amber-50 border border-amber-200 shadow-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-amber-600 text-[28px] flex-shrink-0 mt-0.5">help</span>
              <div>
                <h2 className="text-lg font-black text-amber-900 uppercase tracking-wide mb-3">Selection of Department</h2>
                <p className="text-amber-800 text-sm leading-relaxed mb-3">
                  While submitting an application, citizens are required to select the relevant department based on the nature of their grievance or request.
                </p>
                <div className="text-amber-800 text-sm leading-relaxed flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[16px] flex-shrink-0 mt-0.5">arrow_right</span>
                  <span>
                    If the concerned department is not known, citizens may select the <strong>"Others"</strong> option. The application will be examined at the District Office and forwarded to the appropriate department for necessary action.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── DEPARTMENTS GRID ─── */}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-1 w-10 bg-gov-navy inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Coverage</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gov-navy uppercase tracking-tight">Departments Covered</h2>
                <p className="text-slate-500 text-sm mt-1">Applications submitted through this portal are handled by the following departments</p>
              </div>
              <div className="bg-gov-navy text-white px-4 py-2 text-sm font-black">
                {DEPARTMENTS.length} Departments
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {DEPARTMENTS.map((dept, i) => (
                <div
                  key={dept.name}
                  className="bg-white border border-slate-200 hover:border-gov-navy hover:shadow-md transition-all group flex items-center gap-4 px-4 py-4 border-l-4 border-l-transparent hover:border-l-gov-navy"
                >
                  {/* Number */}
                  <div className="w-8 h-8 flex-shrink-0 bg-slate-100 group-hover:bg-gov-navy/10 flex items-center justify-center transition-colors">
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-gov-navy">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {/* Icon + Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-gov-navy text-[18px] flex-shrink-0 transition-colors">{dept.icon}</span>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-gov-navy leading-tight transition-colors truncate">{dept.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="mt-6 flex items-start gap-2 bg-white border border-slate-200 px-5 py-4">
              <span className="material-symbols-outlined text-gov-navy text-[18px] flex-shrink-0 mt-0.5">info</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                The above list is indicative. If your department is not listed, please select <strong>"Others"</strong> while submitting your application. The District Office will ensure it is routed to the correct department.
              </p>
            </div>
          </section>

          {/* ─── CTA ─── */}
          <section className="bg-gov-navy p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h3 className="text-white font-black text-base uppercase tracking-wide mb-1">Ready to Submit Your Grievance?</h3>
              <p className="text-slate-300 text-sm">Register on the portal and submit your application to the relevant department.</p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Link
                href="/auth/login?tab=citizen"
                className="inline-flex items-center gap-2 bg-white text-gov-navy font-black px-5 py-2.5 text-sm hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">app_registration</span>
                Submit Arzi
              </Link>
              <Link
                href="/complaint/track"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-bold px-5 py-2.5 text-sm hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">track_changes</span>
                Track Status
              </Link>
            </div>
          </section>

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
