"use client"

import { useEffect } from "react"
import { DISTRICTS, getBlocks, getVillages } from "@/lib/location-data"

interface LocationSelectorProps {
  district: string
  block: string
  village: string
  onChange: (field: "district" | "block" | "village", value: string) => void
  className?: string
  required?: boolean
}

export function LocationSelector({
  district, block, village, onChange, className = "", required
}: LocationSelectorProps) {
  const blocks   = getBlocks(district)
  const villages = getVillages(block)

  // When district changes → reset block & village
  useEffect(() => {
    if (district && blocks.length > 0 && !blocks.includes(block)) {
      onChange("block", "")
      onChange("village", "")
    }
  }, [district])

  // When block changes → reset village
  useEffect(() => {
    if (block && villages.length > 0 && !villages.includes(village)) {
      onChange("village", "")
    }
  }, [block])

  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5"
  const selectClass = "w-full border border-slate-200 px-3 py-2.5 text-sm rounded focus:outline-none focus:border-gov-navy text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-400"

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>

      {/* District */}
      <div>
        <label className={labelClass}>
          District {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={district}
          onChange={e => onChange("district", e.target.value)}
          className={selectClass}
        >
          <option value="">— Select District —</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Block (cascades from district) */}
      <div>
        <label className={labelClass}>Block / Tehsil</label>
        <select
          value={block}
          onChange={e => onChange("block", e.target.value)}
          disabled={!district || blocks.length === 0}
          className={selectClass}
        >
          <option value="">
            {!district ? "Select district first" : blocks.length === 0 ? "No blocks available" : "— Select Block —"}
          </option>
          {blocks.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {district && blocks.length === 0 && (
          <p className="text-[10px] text-slate-400 mt-1">Block data not available for this district</p>
        )}
      </div>

      {/* Village / Town (cascades from block) */}
      <div>
        <label className={labelClass}>Village / Town</label>
        {block && villages.length > 0 ? (
          <select
            value={village}
            onChange={e => onChange("village", e.target.value)}
            className={selectClass}
          >
            <option value="">— Select Village —</option>
            {villages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={village}
            onChange={e => onChange("village", e.target.value)}
            placeholder={!block ? "Select block first" : "Type village / ward name"}
            disabled={!block}
            className={selectClass}
          />
        )}
        {block && villages.length > 0 && (
          <p className="text-[10px] text-slate-400 mt-1">{villages.length} villages available</p>
        )}
      </div>

    </div>
  )
}
