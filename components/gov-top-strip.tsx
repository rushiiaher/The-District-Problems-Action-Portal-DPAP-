"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    google?: any
    googleTranslateElementInit?: () => void
  }
}

type Lang = "en" | "ur"

const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  ur: "اردو",
}

function getCookieLang(): Lang {
  if (typeof document === "undefined") return "en"
  const m = document.cookie.match(/googtrans=\/en\/(\w+)/)
  if (m && m[1] === "ur") return "ur"
  return "en"
}

function setLang(lang: Lang) {
  // Remove any existing googtrans cookie
  document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
  document.cookie = "googtrans=; path=/; domain=" + location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC;"

  if (lang !== "en") {
    const val = `/en/${lang}`
    document.cookie = `googtrans=${val}; path=/`
    document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`
  }
  // Reload to apply translation
  location.reload()
}

export default function GovTopStrip() {
  const [activeLang, setActiveLang] = useState<Lang>("en")

  useEffect(() => {
    setActiveLang(getCookieLang())
  }, [])

  const handleLang = (lang: Lang) => {
    if (lang === activeLang) return
    setLang(lang)
  }

  return (
    <div className="gov-top-strip w-full bg-[#00247d] text-white text-[11px] sticky top-0 z-[100] border-b border-[#001a5e] print:hidden notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-8">

        {/* Left: Flag + portal name */}
        <div className="flex items-center gap-2">
          {/* Indian tricolour flag inline SVG */}
          <svg width="22" height="15" viewBox="0 0 22 15" className="flex-shrink-0 rounded-[1px] overflow-hidden border border-white/20">
            <rect width="22" height="5" fill="#FF9933" />
            <rect y="5" width="22" height="5" fill="#FFFFFF" />
            <rect y="10" width="22" height="5" fill="#138808" />
            <circle cx="11" cy="7.5" r="1.8" fill="none" stroke="#000080" strokeWidth="0.5" />
            {/* Ashoka chakra spokes */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180
              const x1 = 11 + 0.4 * Math.cos(angle)
              const y1 = 7.5 + 0.4 * Math.sin(angle)
              const x2 = 11 + 1.6 * Math.cos(angle)
              const y2 = 7.5 + 1.6 * Math.sin(angle)
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="0.3" />
            })}
          </svg>
          <span className="font-bold uppercase tracking-widest hidden sm:inline text-[10px]">
            Government of Jammu &amp; Kashmir
          </span>
          <span className="font-bold uppercase tracking-widest sm:hidden text-[10px]">Govt. of J&amp;K</span>
        </div>

        {/* Right: Language switcher */}
        <div className="flex items-center gap-0.5">
          <span className="text-white/60 mr-1.5 hidden sm:inline text-[10px]">Language:</span>
          {(["en", "ur"] as Lang[]).map((lang, idx) => (
            <div key={lang} className="flex items-center">
              {idx > 0 && <span className="text-white/30 mx-1 text-[10px]">|</span>}
              <button
                onClick={() => handleLang(lang)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  activeLang === lang
                    ? "bg-white text-[#00247d]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {LANG_LABELS[lang]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
