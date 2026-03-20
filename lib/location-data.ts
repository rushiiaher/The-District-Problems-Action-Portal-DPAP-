// ============================================================
// Cascading location data for E-ARZI Anantnag District Portal
// Structure: District → Blocks → Villages / Towns
// ============================================================

export const DISTRICTS = [
  "Anantnag",
  "Baramulla",
  "Budgam",
  "Doda",
  "Ganderbal",
  "Jammu",
  "Kathua",
  "Kulgam",
  "Kupwara",
  "Poonch",
  "Pulwama",
  "Rajouri",
  "Ramban",
  "Reasi",
  "Samba",
  "Shopian",
  "Srinagar",
  "Udhampur",
]

// Blocks per district (comprehensive for Anantnag, basic for others)
export const BLOCKS_BY_DISTRICT: Record<string, string[]> = {
  Anantnag: [
    "Anantnag",
    "Bijbehara",
    "Shangus",
    "Srigufwara",
    "Dooru",
    "Pahalgam",
    "Kokernag",
    "Qazigund",
    "Larnoo",
    "Mattan",
    "Sallar",
    "Brenten",
    "Sagam",
    "Dachnipora",
  ],
  Baramulla: ["Baramulla", "Sopore", "Uri", "Rafiabad", "Kreeri", "Pattan"],
  Budgam:   ["Budgam", "Beerwah", "Chadoora", "Khag", "Narbal"],
  Doda:     ["Doda", "Bhaderwah", "Thathri", "Gandoh"],
  Ganderbal: ["Ganderbal", "Kangan", "Lar", "Wakura"],
  Jammu:    ["Jammu", "Bishnah", "Marh", "Khour", "Suchetgarh"],
  Kathua:   ["Kathua", "Hiranagar", "Billawar", "Basholi"],
  Kulgam:   ["Kulgam", "D.H.Pora", "Devsar", "Frisal", "Pahloo"],
  Kupwara:  ["Kupwara", "Lolab", "Handwara", "Karnah", "Tangdhar"],
  Poonch:   ["Poonch", "Mendhar", "Surankote", "Haveli"],
  Pulwama:  ["Pulwama", "Tral", "Pampore", "Awantipora", "Kakapora"],
  Rajouri:  ["Rajouri", "Thannamandi", "Darhal", "Kalakote"],
  Ramban:   ["Ramban", "Banihal", "Gool", "Ukhral"],
  Reasi:    ["Reasi", "Arnas", "G.G.Garh", "Mahore"],
  Samba:    ["Samba", "Ramgarh", "Vijaypur", "Ghagwal"],
  Shopian:  ["Shopian", "Kellar", "Zainpora", "Hermain"],
  Srinagar: ["Srinagar", "Khanyar", "Habba Kadal", "Eidgah", "Batmaloo"],
  Udhampur: ["Udhampur", "Chenani", "Ramnagar", "Latti"],
}

// Villages / towns per block (detailed for Anantnag blocks)
export const VILLAGES_BY_BLOCK: Record<string, string[]> = {
  // ── Anantnag Block ──────────────────────────────────────────
  Anantnag: [
    "Aishmuqam", "Arwah", "Batpora", "Bonpora", "Bramoo",
    "Buchpora", "Chadder Mohalla", "Chinar Bagh", "Dangerpora",
    "Dar Mohalla", "Dialgam", "Diwar", "Dobiwan", "Goripora",
    "Gulshan Nagar", "Hadipora", "Heff", "Hund", "Janglatmandi",
    "Janglat Mandi", "Kanibehak", "Kanipora", "Khiram",
    "Khrew", "Kulgam Road", "Lal Bazar", "Larkipora", "Lazibal",
    "Malangpora", "Mir Bazar", "Mir Mohalla", "Mohalla Awan",
    "Nagbal", "Naidkhai", "Newa", "New Colony", "Nowpora",
    "Pahlipora", "Pamposh Colony", "Panzinara", "Qazias",
    "Safapora", "Sehpora", "Shahabad", "Shaheen Bagh",
    "Sirbal", "Sopat", "Sultanpora", "Tarzoo", "Wanpora",
  ],

  // ── Bijbehara Block ─────────────────────────────────────────
  Bijbehara: [
    "Arapat", "Arwah", "Awneera", "Balachaur", "Bijbehara Town",
    "Bonagam", "Dardpora", "Darpora", "Gund Karnah", "Hadribal",
    "Hipora", "Kanjipora", "Keegam", "Khanabal", "Khrew South",
    "Kishtwar Mohalla", "Kupwara Mohalla", "Larigam",
    "Lassipora", "Malikpora", "Mattan Colony", "Mirpora",
    "Muqambagh", "Nagam", "Natipora", "Nowpora",
    "Parihaspora", "Qamarwari", "Rahama", "Ranipora",
    "Shamswari", "Sopat", "Srigufwara", "Wagad", "Wahibugh",
    "Wontnaar", "Zalhama",
  ],

  // ── Shangus Block ───────────────────────────────────────────
  Shangus: [
    "Arwah Shangus", "Bakerpora", "Banagam", "Banjaran",
    "Barpora", "Bastee Shangus", "Bonigam", "Bugam",
    "Checkbal", "Doodhpathri Nallah", "Dragad",
    "Goripora", "Hanspora", "Hapatnar", "Karewa",
    "Kharbagh", "Koker", "Lachmanpora", "Laridoora",
    "Letpora", "Lewan", "Malangam", "Mansar",
    "Mathibugh", "Mirgund", "Mujgund", "Nagam Shangus",
    "Naibasta", "Newa", "Nowpora", "Padder Mohalla",
    "Shahabad", "Shangus Town", "Srigom", "Woola",
  ],

  // ── Srigufwara Block ────────────────────────────────────────
  Srigufwara: [
    "Ajas", "Arigam", "Ashajipora", "Ashtangoo", "Babapora",
    "Banikoot", "Barsoo", "Bijran", "Bongam", "Buchpora",
    "Chachloo", "Cheki Dooru", "Chunduna", "Dagal",
    "Dessiyan", "Divar", "Domel", "Gangoo", "Gund",
    "Gundbal", "Hadibal", "Hajan", "Hangalgund", "Hawoora",
    "Hokersar", "Kaloosar", "Kharpora", "Kragsoo",
    "Kujjan", "Lalpora", "Langanbal", "Marhama",
    "Mirhama", "Naibasta", "Nowpora", "Pampora",
    "Pinjoora", "Qazigund", "Rawalpora", "Sangam",
    "Srigufwara Town", "Tarigam", "Thajiwara", "Wanpoh",
    "Yahama", "Zainageer", "Zaloora",
  ],

  // ── Dooru Block ─────────────────────────────────────────────
  Dooru: [
    "Acchibagh", "Anantnag East", "Arapat Dooru",
    "Arinth", "Ashapora", "Baqerpora", "Batmaran",
    "Bongam Dooru", "Brotoo", "Bunagund", "Chawalgam",
    "Checkibal", "Chekerpora", "Chhogal", "Dangerpora",
    "Daripora", "Dehnar", "Dooru Town", "Gool",
    "Gund Dooru", "Hagam", "Hamam", "Hayat Pora",
    "Herpora", "Kadipora", "Kanihama", "Karhama",
    "Katepora", "Khanabal", "Khudwani", "Kukernag",
    "Kullar", "Kundroo", "Larnoo Colony", "Leherpora",
    "Lidoo", "Manasbal", "Manikpora", "Mirhama",
    "Naidkhai", "Naka Dooru", "Napora", "Nowgam",
    "Pampora Dooru", "Pinjoora", "Rawatpora", "Shivpora",
    "Srikote", "Talwara", "Tredpora", "Wandhama",
  ],

  // ── Pahalgam Block ──────────────────────────────────────────
  Pahalgam: [
    "Aru", "Baisaran", "Betab Valley", "Chandanwari",
    "Dabyan", "Hagam", "Halpat", "Harvat",
    "Kolahoi", "Lidderpora", "Lidderwat", "Mamal",
    "Mandal", "Miniatur", "Nowpora Pahalgam",
    "Pahalgam Town", "Pantarbal", "Papnash",
    "Seer", "Sheshnag", "Swithkoot", "Tarsar",
    "Wadipora", "Wanpoh Pahalgam", "Zarwanbal",
  ],

  // ── Kokernag Block ──────────────────────────────────────────
  Kokernag: [
    "Ahlanpora", "Ajas Kokernag", "Arinwari", "Arwani",
    "Ashajipora", "Badersoo", "Baghwanpora", "Bonagam Kokernag",
    "Breng Valley", "Chachloo", "Chirpora", "Devipora",
    "Doonpora", "Dooru Shahabad", "Dragmulla",
    "Dragnad", "Ganie Mohalla", "Groo", "Guddar",
    "Gund Kokernag", "Handoosa", "Hazratbal", "Heff",
    "Ichpora", "Khrew Kokernag", "Kokernag Town",
    "Lalhar", "Lalgam", "Laribal", "Larnoo",
    "Lilhar", "Malikpora", "Mirhama", "Naidkhai Kokernag",
    "Napora Kokernag", "Nowbugh", "Nowpora Kokernag",
    "Pahlipora", "Panzinara South", "Qazigund Kokernag",
    "Renghoo", "Sangam Kokernag", "Seer", "Shaikhpora",
    "Shalidar", "Singhpora", "Srigufwara", "Wadoora",
    "Wanpora Kokernag", "Watchal", "Yarikah",
  ],

  // ── Qazigund Block ──────────────────────────────────────────
  Qazigund: [
    "Amirabad", "Arwah Qazigund", "Awneera", "Baghmarg",
    "Bagh Mohalla", "Banipora", "Barsoo", "Batpora",
    "Bhaderwah Colony", "Bongam Qazigund", "Botingoo",
    "Bugam", "Chak Singhpora", "Checkibal", "Dangerpora",
    "Dardsum", "Divar", "Dogripora", "Drangbal",
    "Faripora", "Fatehpora", "Ganipora", "Garend",
    "Gopalpora", "Goripora", "Gund Qazigund", "Haji Sahib",
    "Hangul", "Hapatnar East", "Hawoora",
    "Heff Qazigund", "Hund", "Kachloo", "Kafloo",
    "Karimabad", "Khanbal", "Khiram North", "Koh-e-Noor",
    "Kulmarg", "Kunda", "Lalpora", "Lassipora South",
    "Malangam", "Mir Qazigund", "Naibasta East",
    "Nainahal", "Naka Qazigund", "Nowgam South",
    "Nowpora Qazigund", "Panipora", "Qazigund Town",
    "Rahama South", "Rawalpora", "Sangam South",
    "Shivpora South", "Sugan", "Tarigam",
    "Wanpoh South", "Yahama South",
  ],

  // ── Larnoo Block ────────────────────────────────────────────
  Larnoo: [
    "Ahlan", "Arigam Larnoo", "Arpath", "Ashajipora Larnoo",
    "Badadoab", "Banderkote", "Bijran Larnoo", "Breng",
    "Bugam Larnoo", "Chawalgam Larnoo", "Chittarbal",
    "Daksum", "Drang", "Gardanbal", "Gool Larnoo",
    "Groo Larnoo", "Gund Larnoo", "Hadigam", "Hangalgund",
    "Hatmulla", "Inshan", "Kadipora Larnoo", "Kangan",
    "Khanbal Larnoo", "Khiram East", "Kokernag North",
    "Kupwara Colony", "Larnoo Town", "Lidder Valley",
    "Machhama", "Manigah", "Mirhama East", "Naibasta North",
    "Narpora", "Naugam", "Nowpora Bala", "Pahlipora East",
    "Pinjoora East", "Qazigund North", "Sheshnag Valley",
    "Shrimal", "Singhpora North", "Sukhnag",
    "Tangmarg", "Tchuntimarg", "Tickan", "Tosamaidan",
    "Tral North", "Tulail", "Tulmula", "Watnar",
    "Wodar", "Yahama North", "Zarpora",
  ],

  // ── Mattan Block ────────────────────────────────────────────
  Mattan: [
    "Ajas Mattan", "Arigam Mattan", "Arwah Mattan",
    "Babapora Mattan", "Bakerpora Mattan", "Banipora Mattan",
    "Bonagam Mattan", "Botingoo Mattan", "Buchpora Mattan",
    "Dachnipora Mattan", "Daksum North", "Dangerpora Mattan",
    "Darpora Mattan", "Divar North", "Domel Mattan",
    "Dragmulla Mattan", "Ganie Colony", "Gangoo Mattan",
    "Goripora Mattan", "Gund Mattan", "Hadibal Mattan",
    "Hangul Mattan", "Haripora", "Hawoora Mattan",
    "Kachloo Mattan", "Kangan Mattan", "Karewa Mattan",
    "Khanbal Mattan", "Kokernag South", "Kulmarg Mattan",
    "Larigam Mattan", "Lashkaripora", "Letpora Mattan",
    "Malangam Mattan", "Mattan Town", "Mir Mohalla Mattan",
    "Mirhama Mattan", "Nagbal Mattan", "Naibasta South",
    "Napora Mattan", "Nowgam Mattan", "Nowpora Mattan",
    "Pahlipora Mattan", "Pampora Mattan", "Panzinara Mattan",
    "Qamarwari Mattan", "Qazigund South", "Rahama Mattan",
    "Rawalpora Mattan", "Sangam Mattan", "Seer Mattan",
    "Shahabad Mattan", "Shivpora Mattan", "Sirbal Mattan",
    "Sopat Mattan", "Sultanpora Mattan", "Tarigam Mattan",
    "Tredpora Mattan", "Wanpoh Mattan", "Wanpora Mattan",
    "Wontnaar Mattan", "Yahama Mattan", "Zalhama Mattan",
  ],

  // ── Sallar Block ────────────────────────────────────────────
  Sallar: [
    "Arwah Sallar", "Banihal Colony", "Bonagam Sallar",
    "Bugam Sallar", "Chachloo Sallar", "Dagal Sallar",
    "Dardpora Sallar", "Daripora Sallar", "Divar Sallar",
    "Doonpora Sallar", "Faripora Sallar", "Gangoo Sallar",
    "Ganie Sallar", "Goripora Sallar", "Gund Sallar",
    "Heff Sallar", "Hund Sallar", "Kachloo Sallar",
    "Kanihama Sallar", "Karewa Sallar", "Khanbal Sallar",
    "Khanpora", "Kulgam Colony", "Lalhar Sallar",
    "Laridoora Sallar", "Larikhwan", "Mattan Colony Sallar",
    "Mirhama Sallar", "Nagam Sallar", "Naibasta Sallar",
    "Napora Sallar", "Narpora Sallar", "Nowgam Sallar",
    "Nowpora Sallar", "Pahlipora Sallar", "Pampora Sallar",
    "Pinjoora Sallar", "Rahama Sallar", "Rawalpora Sallar",
    "Sallar Town", "Sangam Sallar", "Seer Sallar",
    "Shahabad Sallar", "Shivpora Sallar", "Sopat Sallar",
    "Tarigam Sallar", "Wanpora Sallar", "Zalhama Sallar",
  ],

  // ── Brenten Block ───────────────────────────────────────────
  Brenten: [
    "Arwah Brenten", "Bonipora", "Brenten Town",
    "Chachloo Brenten", "Dagal Brenten", "Dandoo",
    "Dard Colony", "Daripora Brenten", "Divar Brenten",
    "Doonpora Brenten", "Gangoo Brenten", "Gund Brenten",
    "Heff Brenten", "Kachloo Brenten", "Kanihama Brenten",
    "Karewa Brenten", "Khanbal Brenten", "Laridoora Brenten",
    "Mirhama Brenten", "Nagam Brenten", "Naibasta Brenten",
    "Napora Brenten", "Nowgam Brenten", "Nowpora Brenten",
    "Pahlipora Brenten", "Pampora Brenten", "Sangam Brenten",
    "Shahabad Brenten", "Sopat Brenten", "Wanpora Brenten",
  ],

  // ── Sagam Block ─────────────────────────────────────────────
  Sagam: [
    "Arwah Sagam", "Bonagam Sagam", "Bugam Sagam",
    "Chachloo Sagam", "Dagal Sagam", "Dangerwari",
    "Daripora Sagam", "Divar Sagam", "Doonpora Sagam",
    "Gangoo Sagam", "Gund Sagam", "Heff Sagam",
    "Hund Sagam", "Kachloo Sagam", "Kanihama Sagam",
    "Karewa Sagam", "Khanbal Sagam", "Laridoora Sagam",
    "Mirhama Sagam", "Nagam Sagam", "Naibasta Sagam",
    "Napora Sagam", "Nowgam Sagam", "Nowpora Sagam",
    "Pahlipora Sagam", "Pampora Sagam", "Rahama Sagam",
    "Sagam Town", "Sangam Sagam", "Shahabad Sagam",
    "Sopat Sagam", "Wanpora Sagam",
  ],

  // ── Dachnipora Block ────────────────────────────────────────
  Dachnipora: [
    "Arwah Dachnipora", "Bonagam Dachnipora", "Bugam Dachnipora",
    "Chachloo Dachnipora", "Dachnipora Town", "Dagal Dachnipora",
    "Daripora Dachnipora", "Divar Dachnipora",
    "Gangoo Dachnipora", "Gund Dachnipora", "Heff Dachnipora",
    "Kanihama Dachnipora", "Karewa Dachnipora",
    "Khanbal Dachnipora", "Mahore Colony",
    "Mirhama Dachnipora", "Nagam Dachnipora",
    "Naibasta Dachnipora", "Napora Dachnipora",
    "Nowgam Dachnipora", "Nowpora Dachnipora",
    "Pahlipora Dachnipora", "Pampora Dachnipora",
    "Rahama Dachnipora", "Sangam Dachnipora",
    "Shahabad Dachnipora", "Sopat Dachnipora",
    "Sultanipora", "Wanpora Dachnipora",
  ],
}

// Helper: get sorted block list for a district
export function getBlocks(district: string): string[] {
  return (BLOCKS_BY_DISTRICT[district] || []).sort()
}

// Helper: get sorted village list for a block
export function getVillages(block: string): string[] {
  return (VILLAGES_BY_BLOCK[block] || []).sort()
}
