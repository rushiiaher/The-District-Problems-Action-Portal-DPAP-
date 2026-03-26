/**
 * Seed Script: Departments + Field Officers
 * -----------------------------------------
 * Run with:  npx tsx scripts/seed-officers.ts
 *
 * Strategy: Accounts are POSITION-based, not person-based.
 *   - Each account = a designation/post (e.g. bdo.pahalgam)
 *   - When an officer transfers, the new incumbent uses the same credentials
 *   - Admin can update the display name via /admin/officers if needed
 *
 * What this script does:
 *   1. Upsert 38 departments (by code — safe, won't break existing complaints)
 *   2. Delete all existing officer accounts (clean slate)
 *   3. Insert 72 new officers with password = admin123
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envFile = path.resolve(process.cwd(), ".env.local")
  if (!fs.existsSync(envFile)) return
  const lines = fs.readFileSync(envFile, "utf-8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "")
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY)

// ── Departments ───────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { name: "District Administration",                                   code: "DA",    sla_high: 24, sla_medium: 48,  sla_low: 96  },
  { name: "Public Works Department (PWD)",                             code: "PWD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Jal Shakti Department",                                     code: "JSD",   sla_high: 24, sla_medium: 72,  sla_low: 120 },
  { name: "Power Development Department (PDD)",                        code: "PDD",   sla_high: 24, sla_medium: 72,  sla_low: 120 },
  { name: "Integrated Child Development Services (ICDS)",              code: "ICDS",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Industries & Commerce Department",                          code: "ICD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Revenue Department",                                        code: "REV",   sla_high: 24, sla_medium: 48,  sla_low: 96  },
  { name: "Planning Department",                                       code: "PLAN",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Rural Development Department (RDD)",                        code: "RDD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Mechanical Engineering Department",                         code: "MED",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Health & Medical Education Department",                     code: "HME",   sla_high: 24, sla_medium: 48,  sla_low: 96  },
  { name: "Agriculture Production Department",                         code: "APD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Animal Husbandry Department",                               code: "AHD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Horticulture Department",                                   code: "HORT",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "School Education Department",                               code: "SED",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Finance Department",                                        code: "FIN",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Geology & Mining Department",                               code: "GMD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Panchayati Raj Department",                                 code: "PRD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Sheep Husbandry Department",                                code: "SHD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Fisheries Department",                                      code: "FISH",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Employment Department",                                     code: "EMP",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Sericulture Department",                                    code: "SERI",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Economics & Statistics Department",                         code: "ESD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Fire & Emergency Services",                                 code: "FES",   sla_high: 12, sla_medium: 24,  sla_low: 48  },
  { name: "Forest Department",                                         code: "FOR",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Lead Bank Office",                                          code: "LBO",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Youth Services & Sports Department",                        code: "YSSD",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Consumer Affairs & Public Distribution Department",         code: "CAPD",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Social Welfare Department",                                 code: "SWD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Transport Department",                                      code: "TRANS", sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Labour & Employment Department",                            code: "LED",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Floriculture Department",                                   code: "FLOR",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Cooperative Department",                                    code: "COOP",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Handloom & Handicrafts Department",                         code: "HHD",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "AYUSH Department",                                          code: "AYUSH", sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "Police Department",                                         code: "POL",   sla_high: 24, sla_medium: 48,  sla_low: 96  },
  { name: "Urban Local Bodies (ULB)",                                  code: "ULB",   sla_high: 48, sla_medium: 96,  sla_low: 168 },
  { name: "J&K State Road Transport Corporation (SRTC)",               code: "SRTC",  sla_high: 48, sla_medium: 96,  sla_low: 168 },
]

// ── Officers (position-based, not person-based) ───────────────────────────────
// username   = unique identifier for the POSITION
// name       = display name shown in the app (the designation title)
// designation = the full official title
// dept       = department code (must match DEPARTMENTS above)
const OFFICER_DEFS = [
  // ── District Administration ────────────────────────────────────────────────
  { username: "dc.anantnag",        name: "Deputy Commissioner, Anantnag",                       designation: "Deputy Commissioner, Anantnag",                                    dept: "DA"    },
  { username: "adc.b.anantnag",     name: "Addl. Deputy Commissioner (B), Anantnag",             designation: "Additional Deputy Commissioner (B), Anantnag",                     dept: "DA"    },
  { username: "adc.m.anantnag",     name: "Addl. Deputy Commissioner (M), Anantnag",             designation: "Additional Deputy Commissioner (M), Anantnag",                     dept: "DA"    },

  // ── Public Works Department (PWD) ─────────────────────────────────────────
  { username: "se.pwd.anantnag",    name: "S.E PWD (R&B) Circle, Anantnag",                      designation: "Superintending Engineer, PWD (R&B) Circle, Anantnag",               dept: "PWD"   },
  { username: "ee.rb.khanabal",     name: "Executive Engineer, R&B Div. Khanabal",                designation: "Executive Engineer, R&B Division Khanabal",                         dept: "PWD"   },
  { username: "ee.rb.dooru",        name: "Executive Engineer, R&B Div. Dooru",                   designation: "Executive Engineer, R&B Division Dooru",                            dept: "PWD"   },
  { username: "ee.rb.pahalgam",     name: "Executive Engineer, R&B Div. Pahalgam",                designation: "Executive Engineer, R&B Division Pahalgam",                         dept: "PWD"   },
  { username: "ee.rb.qazigund",     name: "Executive Engineer, R&B Div. Qazigund",                designation: "Executive Engineer, R&B Division Qazigund",                         dept: "PWD"   },
  { username: "ee.rb.vailoo",       name: "Executive Engineer, R&B Div. Vailoo",                  designation: "Executive Engineer, R&B Division Vailoo",                           dept: "PWD"   },

  // ── Jal Shakti Department ─────────────────────────────────────────────────
  { username: "se.jsd.anantnag",    name: "S.E, Jal Shakti, Anantnag",                           designation: "Superintending Engineer, Jal Shakti, Anantnag",                     dept: "JSD"   },
  { username: "ee.phe.bijbehara",   name: "Executive Engineer, PHE Div. Bijbehara",               designation: "Executive Engineer, PHE Division Bijbehara",                        dept: "JSD"   },
  { username: "ee.irr.anantnag",    name: "Executive Engineer, Irrigation Div. Anantnag",         designation: "Executive Engineer, Irrigation Division Anantnag",                  dept: "JSD"   },
  { username: "ee.flood.anantnag",  name: "Executive Engineer, Flood Control Div. Anantnag",      designation: "Executive Engineer, Flood Control Division Anantnag",               dept: "JSD"   },

  // ── Power Development Department (PDD) ───────────────────────────────────
  { username: "se.kpdcl.bijbehara", name: "S.E, KPDCL, Bijbehara",                               designation: "Superintending Engineer, KPDCL, Bijbehara",                         dept: "PDD"   },
  { username: "ee.pdd.anantnag",    name: "Executive Engineer, PDD Div. Anantnag",                designation: "Executive Engineer, PDD Division Anantnag",                         dept: "PDD"   },
  { username: "ee.pdd.bijbehara",   name: "Executive Engineer, PDD Div. Bijbehara",               designation: "Executive Engineer, PDD Division Bijbehara",                        dept: "PDD"   },
  { username: "ee.pdd.qazigund",    name: "Executive Engineer, PDD Div. Qazigund",                designation: "Executive Engineer, PDD Division Qazigund",                         dept: "PDD"   },

  // ── Integrated Child Development Services (ICDS) ─────────────────────────
  { username: "po.icds.anantnag",   name: "Programme Officer, ICDS Anantnag",                     designation: "Programme Officer, ICDS Anantnag",                                  dept: "ICDS"  },

  // ── Industries & Commerce ─────────────────────────────────────────────────
  { username: "gm.dic.anantnag",    name: "General Manager, DIC Anantnag",                        designation: "General Manager, DIC Anantnag",                                     dept: "ICD"   },

  // ── Revenue Department ───────────────────────────────────────────────────
  { username: "ac.rev.anantnag",    name: "Assistant Commissioner (Revenue), Anantnag",           designation: "Assistant Commissioner (Rev) Anantnag",                             dept: "REV"   },
  { username: "sdm.bijbehara",      name: "Sub-Divisional Magistrate, Bijbehara",                 designation: "Sub-Divisional Magistrate, Bijbehara",                              dept: "REV"   },
  { username: "sdm.dooru",          name: "Sub-Divisional Magistrate, Dooru",                     designation: "Sub-Divisional Magistrate, Dooru",                                  dept: "REV"   },
  { username: "sdm.kokernag",       name: "Sub-Divisional Magistrate, Kokernag",                  designation: "Sub-Divisional Magistrate, Kokernag",                               dept: "REV"   },
  { username: "sdm.pahalgam",       name: "Sub-Divisional Magistrate, Pahalgam",                  designation: "Sub-Divisional Magistrate, Pahalgam",                               dept: "REV"   },
  { username: "tehsildar.all",      name: "Tehsildar (All Tehsils), Anantnag",                    designation: "Tehsildar (All Tehsils)",                                            dept: "REV"   },

  // ── Planning Department ──────────────────────────────────────────────────
  { username: "cpo.anantnag",       name: "Chief Planning Officer, Anantnag",                     designation: "Chief Planning Officer, Anantnag",                                  dept: "PLAN"  },

  // ── Rural Development Department (RDD) ───────────────────────────────────
  { username: "ac.dev.anantnag",    name: "Asst. Commissioner (Development), Anantnag",           designation: "Assistant Commissioner (Development) Anantnag",                     dept: "RDD"   },
  { username: "bdo.achabal",        name: "Block Development Officer, Achabal",                   designation: "Block Development Officer Achabal",                                 dept: "RDD"   },
  { username: "bdo.anantnag",       name: "Block Development Officer, Anantnag",                  designation: "Block Development Officer Anantnag",                                dept: "RDD"   },
  { username: "bdo.bijbehara",      name: "Block Development Officer, Bijbehara",                 designation: "Block Development Officer Bijbehara",                               dept: "RDD"   },
  { username: "bdo.breng",          name: "Block Development Officer, Breng",                     designation: "Block Development Officer Breng",                                   dept: "RDD"   },
  { username: "bdo.chittergul",     name: "Block Development Officer, Chittergul",                designation: "Block Development Officer Chittergul",                              dept: "RDD"   },
  { username: "bdo.dooru",          name: "Block Development Officer, Dooru",                     designation: "Block Development Officer Dooru",                                   dept: "RDD"   },
  { username: "bdo.hiller",         name: "Block Development Officer, Hiller Shahabad",           designation: "Block Development Officer Hiller Shahabad",                         dept: "RDD"   },
  { username: "bdo.kppora",         name: "Block Development Officer, K.P. Pora",                 designation: "Block Development Officer K.P. Pora",                               dept: "RDD"   },
  { username: "bdo.larnoo",         name: "Block Development Officer, Larnoo",                    designation: "Block Development Officer Larnoo",                                  dept: "RDD"   },
  { username: "bdo.pahalgam",       name: "Block Development Officer, Pahalgam",                  designation: "Block Development Officer Pahalgam",                                dept: "RDD"   },
  { username: "bdo.qazigund",       name: "Block Development Officer, Qazigund",                  designation: "Block Development Officer Qazigund",                                dept: "RDD"   },
  { username: "bdo.sagam",          name: "Block Development Officer, Sagam",                     designation: "Block Development Officer Sagam",                                   dept: "RDD"   },
  { username: "bdo.shahabad",       name: "Block Development Officer, Shahabad Larkipora",        designation: "Block Development Officer Shahabad Larkipora",                      dept: "RDD"   },
  { username: "bdo.shangus",        name: "Block Development Officer, Shangus",                   designation: "Block Development Officer Shangus",                                 dept: "RDD"   },
  { username: "bdo.verinag",        name: "Block Development Officer, Verinag",                   designation: "Block Development Officer Verinag",                                 dept: "RDD"   },
  { username: "bdo.vessu",          name: "Block Development Officer, Vessu",                     designation: "Block Development Officer Vessu",                                   dept: "RDD"   },

  // ── Mechanical Engineering Department ────────────────────────────────────
  { username: "ee.mech.anantnag",   name: "Executive Engineer, Mechanical Div. Anantnag",         designation: "Executive Engineer, Mechanical Division, Anantnag",                 dept: "MED"   },

  // ── Health & Medical Education ───────────────────────────────────────────
  { username: "cmo.anantnag",       name: "Chief Medical Officer, Anantnag",                      designation: "Chief Medical Officer, Anantnag",                                   dept: "HME"   },

  // ── Agriculture Production ───────────────────────────────────────────────
  { username: "cao.anantnag",       name: "Chief Agriculture Officer, Anantnag",                  designation: "Chief Agriculture Officer, Anantnag",                               dept: "APD"   },

  // ── Animal Husbandry ─────────────────────────────────────────────────────
  { username: "caho.anantnag",      name: "Chief Animal Husbandry Officer, Anantnag",             designation: "Chief Animal Husbandry Officer Anantnag",                           dept: "AHD"   },

  // ── Horticulture ─────────────────────────────────────────────────────────
  { username: "cho.anantnag",       name: "Chief Horticulture Officer, Anantnag",                 designation: "Chief Horticulture Officer Anantnag",                               dept: "HORT"  },

  // ── School Education ─────────────────────────────────────────────────────
  { username: "ceo.anantnag",       name: "Chief Education Officer, Anantnag",                    designation: "Chief Education Officer, Anantnag",                                 dept: "SED"   },

  // ── Finance ──────────────────────────────────────────────────────────────
  { username: "dto.anantnag",       name: "District Treasury Officer, Anantnag",                  designation: "District Treasury Officer, Anantnag",                               dept: "FIN"   },

  // ── Geology & Mining ─────────────────────────────────────────────────────
  { username: "dgmo.anantnag",      name: "District Geology & Mining Officer, Anantnag",          designation: "District Geology & Mining Officer, Anantnag",                       dept: "GMD"   },

  // ── Panchayati Raj ───────────────────────────────────────────────────────
  { username: "acp.anantnag",       name: "Asst. Commissioner Panchayat, Anantnag",               designation: "Assistant Commissioner Panchayat Anantnag",                         dept: "PRD"   },

  // ── Sheep Husbandry ──────────────────────────────────────────────────────
  { username: "dsho.anantnag",      name: "District Sheep Husbandry Officer, Anantnag",           designation: "District Sheep Husbandry Officer, Anantnag",                        dept: "SHD"   },

  // ── Fisheries ────────────────────────────────────────────────────────────
  { username: "dd.fish.anantnag",   name: "Deputy Director Fisheries, Anantnag",                  designation: "Deputy Director Fisheries Anantnag",                                dept: "FISH"  },

  // ── Employment ───────────────────────────────────────────────────────────
  { username: "dd.emp.anantnag",    name: "Deputy Director Employment & Counselling, Anantnag",   designation: "Deputy Director Employment & Counselling Anantnag",                 dept: "EMP"   },

  // ── Sericulture ──────────────────────────────────────────────────────────
  { username: "dd.seri.anantnag",   name: "Deputy Director Sericulture, Anantnag",                designation: "Deputy Director Sericulture, Anantnag",                             dept: "SERI"  },

  // ── Economics & Statistics ───────────────────────────────────────────────
  { username: "dd.stats.anantnag",  name: "Deputy Director Statistics & Evaluation, Anantnag",   designation: "Deputy Director Statistics & Evaluation Anantnag",                  dept: "ESD"   },

  // ── Fire & Emergency Services ────────────────────────────────────────────
  { username: "dd.fire.anantnag",   name: "Deputy Director Fire & Emergency Services, Anantnag",  designation: "Deputy Director Fire & Emergency Services, Anantnag",               dept: "FES"   },

  // ── Forest Department ───────────────────────────────────────────────────
  { username: "dd.forest.anantnag", name: "Deputy Director Forest Protection Force, Anantnag",   designation: "Deputy Director Forest Protection Force, Anantnag",                  dept: "FOR"   },

  // ── Lead Bank Office ─────────────────────────────────────────────────────
  { username: "dlbo.anantnag",      name: "District Lead Bank Officer, Anantnag",                 designation: "District Lead Bank Officer, Anantnag",                              dept: "LBO"   },

  // ── Youth Services & Sports ──────────────────────────────────────────────
  { username: "dyss.anantnag",      name: "District Youth Service & Sports Officer, Anantnag",   designation: "District Youth Service & Sports Officer, Anantnag",                  dept: "YSSD"  },

  // ── Consumer Affairs & Public Distribution ───────────────────────────────
  { username: "ad.capd.anantnag",   name: "Asst. Director, CA&PD Anantnag",                       designation: "Assistant Director, CA&PD Anantnag",                                dept: "CAPD"  },

  // ── Social Welfare ───────────────────────────────────────────────────────
  { username: "dswo.anantnag",      name: "District Social Welfare Officer, Anantnag",            designation: "District Social Welfare Officer, Anantnag",                         dept: "SWD"   },

  // ── Transport ───────────────────────────────────────────────────────────
  { username: "arto.anantnag",      name: "ARTO, Anantnag",                                       designation: "ARTO, Anantnag",                                                    dept: "TRANS" },

  // ── Labour & Employment ──────────────────────────────────────────────────
  { username: "alc.anantnag",       name: "Asst. Labour Commissioner, Anantnag",                  designation: "Assistant Labour Commissioner, Anantnag",                           dept: "LED"   },

  // ── Floriculture ─────────────────────────────────────────────────────────
  { username: "dfloro.anantnag",    name: "District Floriculture Officer, Anantnag",               designation: "District Floriculture Officer, Anantnag",                           dept: "FLOR"  },

  // ── Cooperative ─────────────────────────────────────────────────────────
  { username: "dr.coop.anantnag",   name: "Deputy Registrar Cooperative, Anantnag",               designation: "Deputy Registrar Cooperative Anantnag",                             dept: "COOP"  },

  // ── Handloom & Handicrafts ───────────────────────────────────────────────
  { username: "ad.hh.anantnag",     name: "Asst. Director Handloom/Handicrafts/KVIB, Anantnag",  designation: "Assistant Director, Handloom/ Handicrafts/ KVIB Anantnag",          dept: "HHD"   },

  // ── AYUSH ────────────────────────────────────────────────────────────────
  { username: "dao.ayush.anantnag", name: "District Ayush Officer, Anantnag",                     designation: "District Ayush Officer, Anantnag",                                  dept: "AYUSH" },

  // ── Police ──────────────────────────────────────────────────────────────
  { username: "dysp.traffic",       name: "DySP Traffic, Anantnag",                               designation: "DySP Traffic, Anantnag",                                            dept: "POL"   },

  // ── Urban Local Bodies (ULB) ─────────────────────────────────────────────
  { username: "ceo.ulb.anantnag",   name: "CEO/MC & Executive Officers, ULB Anantnag",            designation: "CEO/MC Anantnag, E.O MC Aishmuqam / Bijbehara / Dooru-Verinag / Kokernag / Mattan / Pahalgam / Qazigund / Seer / Achabal", dept: "ULB"   },

  // ── SRTC ─────────────────────────────────────────────────────────────────
  { username: "dm.srtc.anantnag",   name: "Depot Manager, SRTC Anantnag",                         designation: "Depot Manager, SRTC Anantnag",                                      dept: "SRTC"  },
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱  E-Arzi Anantnag — Seed Script")
  console.log("═══════════════════════════════════════\n")

  // ── Step 1: Upsert departments ─────────────────────────────────────────────
  console.log(`📂  Upserting ${DEPARTMENTS.length} departments…`)

  const { error: deptErr } = await supabase
    .from("departments")
    .upsert(
      DEPARTMENTS.map(d => ({ ...d, status: "active", created_at: new Date().toISOString() })),
      { onConflict: "code" }
    )

  if (deptErr) {
    console.error("❌  Failed to upsert departments:", deptErr.message)
    process.exit(1)
  }
  console.log(`✅  ${DEPARTMENTS.length} departments upserted\n`)

  // ── Step 2: Fetch department ID → code map ────────────────────────────────
  const { data: deptRows, error: fetchDeptErr } = await supabase
    .from("departments")
    .select("id, code")

  if (fetchDeptErr || !deptRows) {
    console.error("❌  Failed to fetch department IDs:", fetchDeptErr?.message)
    process.exit(1)
  }

  const deptCodeToId: Record<string, string> = {}
  for (const d of deptRows) deptCodeToId[d.code] = d.id
  console.log(`🗂   Department ID map built (${Object.keys(deptCodeToId).length} entries)\n`)

  // ── Step 3: Collect existing officer IDs ─────────────────────────────────
  const { data: existingOfficers } = await supabase
    .from("users")
    .select("id")
    .eq("role", "officer")

  const officerIds = (existingOfficers || []).map((o: any) => o.id)
  console.log(`🔗  Found ${officerIds.length} existing officer(s) to remove\n`)

  if (officerIds.length > 0) {
    // Nullify complaints.assigned_officer_id
    console.log("    → Clearing complaint officer assignments…")
    await supabase.from("complaints").update({ assigned_officer_id: null }).in("assigned_officer_id", officerIds)

    // Delete notifications sent TO officers
    console.log("    → Deleting officer notifications…")
    await supabase.from("notifications").delete().in("user_id", officerIds)

    // Nullify complaint_timeline actor references (preserve the row, lose the actor link)
    console.log("    → Nullifying timeline actor references…")
    await supabase.from("complaint_timeline").update({ actor_id: null }).in("actor_id", officerIds)

    // Nullify audit_log actor references
    console.log("    → Nullifying audit log actor references…")
    await supabase.from("audit_log").update({ actor_id: null }).in("actor_id", officerIds)

    console.log()

    // ── Step 4: Delete all existing officers ────────────────────────────────
    console.log("🗑   Removing all existing officer accounts…")
    const { error: delErr, count: delCount } = await supabase
      .from("users")
      .delete({ count: "exact" })
      .eq("role", "officer")

    if (delErr) {
      console.error("❌  Failed to delete existing officers:", delErr.message)
      process.exit(1)
    }
    console.log(`✅  Removed ${delCount ?? 0} existing officer account(s)\n`)
  } else {
    console.log("ℹ️   No existing officers to remove\n")
  }

  // ── Step 5: Build officer rows ────────────────────────────────────────────
  const missing: string[] = []
  const officerRows = OFFICER_DEFS.map(o => {
    const dept_id = deptCodeToId[o.dept]
    if (!dept_id) missing.push(`${o.username} → code "${o.dept}" not found`)
    return {
      name:          o.name,
      username:      o.username,
      password_hash: "admin123",
      role:          "officer",
      designation:   o.designation,
      department_id: dept_id ?? null,
      created_at:    new Date().toISOString(),
    }
  })

  if (missing.length > 0) {
    console.warn("⚠️   Some department codes were not resolved:")
    missing.forEach(m => console.warn("     •", m))
    console.warn()
  }

  // ── Step 6: Insert officers ───────────────────────────────────────────────
  console.log(`👤  Inserting ${officerRows.length} officer accounts…`)

  // Insert in batches of 20 to avoid hitting request size limits
  const BATCH = 20
  let inserted = 0
  for (let i = 0; i < officerRows.length; i += BATCH) {
    const batch = officerRows.slice(i, i + BATCH)
    const { error: insErr } = await supabase.from("users").insert(batch)
    if (insErr) {
      console.error(`❌  Batch ${Math.floor(i / BATCH) + 1} failed:`, insErr.message)
      process.exit(1)
    }
    inserted += batch.length
    process.stdout.write(`\r     Progress: ${inserted}/${officerRows.length}`)
  }

  console.log(`\n✅  ${inserted} officers inserted\n`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("════════════════════════════════════════")
  console.log("🎉  Seed complete!")
  console.log(`    • ${DEPARTMENTS.length} departments in the system`)
  console.log(`    • ${inserted} officer accounts created`)
  console.log(`    • All passwords set to: admin123`)
  console.log(`    • Officers log in at: /auth/login (Staff tab)`)
  console.log("════════════════════════════════════════\n")
  console.log("ℹ️   Transfer policy:")
  console.log("    Each account = a POSITION (e.g. bdo.pahalgam)")
  console.log("    When an officer transfers, the new incumbent uses")
  console.log("    the same credentials. Update the display name from")
  console.log("    /admin/officers if needed.\n")
}

main().catch(err => {
  console.error("❌  Unexpected error:", err)
  process.exit(1)
})
