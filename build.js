// Converts the XC League "flights" JSON export into the compact file the chart page loads.
// Usage: node build.js raw/league.json league-2026.json
// Source: https://xcleague.com/xc/api.php?output=json&service=flights&year=2026
const fs = require("fs");

const [,, src = "raw/league.json", out = "league-2026.json"] = process.argv;
const raw = JSON.parse(fs.readFileSync(src, "utf8"));
if (raw.status !== "OK" || !Array.isArray(raw.data)) throw new Error("Unexpected input format");

const year = raw.meta?.params?.year ?? 2026;
const BEST_N = 6; // the league counts each pilot's best 6 flights

// Repeated strings (flight types, gliders, sites) are stored once and referenced by index
function lookup() {
  const list = [], index = new Map();
  return { list, id(v) { v = v || ""; if (!index.has(v)) { index.set(v, list.length); list.push(v); } return index.get(v); } };
}
const types = lookup(), gliders = lookup(), sites = lookup();

const pilots = new Map();
const flights = [];
for (const r of raw.data) {
  if (r.valid !== 1) continue;
  const id = String(r.pilotId);
  if (!pilots.has(id)) pilots.set(id, { id, first: (r.firstName || "").trim(), last: (r.lastName || "").trim(), name: `${r.firstName} ${r.lastName}`.trim(), club: r.club || "", wing: "", best: -1 });
  const p = pilots.get(id);
  const score = Math.round(parseFloat(r.score) * 10) / 10;
  const glider = [r.gliderMake, r.gliderModel].filter(Boolean).join(" ");
  // Like the official table, show the glider flown on the pilot's highest-scoring flight
  if (score > p.best) { p.best = score; p.wing = glider; }
  const flightNo = (String(r.link || "").match(/flights\/(\d+)\.html/) || [])[1];
  flights.push({ p: id, d: r.flightDate, s: score, f: flightNo ? +flightNo : null, t: types.id(r.flightTypeName), g: gliders.id(glider), x: sites.id(r.location) });
}

// Pilots who share a name get their club added so they can be told apart
const nameCount = {};
for (const p of pilots.values()) nameCount[p.name] = (nameCount[p.name] || 0) + 1;
const pilotList = [...pilots.values()].map(p => ({
  id: p.id,
  name: nameCount[p.name] > 1 ? `${p.name} (${p.club})` : p.name,
  first: p.first,
  last: p.last,
  club: p.club,
  wing: p.wing,
}));

flights.sort((a, b) => a.d.localeCompare(b.d) || a.p.localeCompare(b.p));

const result = {
  season: String(year),
  bestN: BEST_N,
  start: `${year - 1}-11-01`, // the league year runs November to October
  end: `${year}-10-31`,
  source: `UK XC League (xcleague.com), exported ${raw.meta?.date ?? "unknown date"}`,
  flightUrl: "https://xcleague.com/xc/flights/{f}.html",
  types: types.list,
  gliders: gliders.list,
  sites: sites.list,
  pilots: pilotList,
  flights,
};
fs.writeFileSync(out, JSON.stringify(result));
console.log(`${pilotList.length} pilots, ${flights.length} flights, ${flights[0].d} to ${flights.at(-1).d} -> ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
