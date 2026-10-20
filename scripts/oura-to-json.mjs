// Convert a raw Oura v2 `sleep` API response into the compact, privacy-shaped
// dataset the site ships. Clock times are dropped: every series is indexed
// from the moment the ring detected bedtime, so the site shows "hour 2 of
// sleep", never "2:14 a.m.".
//
// Usage: node scripts/oura-to-json.mjs raw-sleep.json
//   raw-sleep.json = GET /v2/usercollection/sleep?start_date=…&end_date=…
// Writes public/data/nights.json (all nights, fetched lazily by /lab/pulse)
// and src/data/featured-night.json (one night, inlined on the home page).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const raw = JSON.parse(readFileSync(process.argv[2], "utf8"));
const round = (v) => (v == null ? null : Math.round(v));

const nights = raw.data
  .filter((s) => s.type === "long_sleep" && s.heart_rate?.items?.length)
  .map((s) => ({
    day: s.day,                                   // calendar date the night ended
    hr: s.heart_rate.items.map(round),            // bpm, every 5 min (null = no reading)
    hrv: s.hrv?.items?.map(round) ?? [],          // RMSSD ms, every 5 min
    stages: s.sleep_phase_5_min ?? "",            // 1 deep · 2 light · 3 REM · 4 awake, per 5 min
    move: s.movement_30_sec ?? "",                // 1 still … 4 restless, per 30 s
    avgHr: round(s.average_heart_rate),
    lowHr: s.lowest_heart_rate,
    avgHrv: s.average_hrv,
    breath: s.average_breath,                     // breaths per minute
    sleepMin: Math.round((s.total_sleep_duration ?? 0) / 60),
  }))
  .sort((a, b) => a.day.localeCompare(b.day));

// Featured night: a recent, typical-length night with the fewest missing readings.
const score = (n) => {
  const missing = n.hr.filter((v) => v == null).length / n.hr.length;
  const hours = n.sleepMin / 60;
  return -missing * 100 - Math.abs(hours - 7.5) * 4 + (n.stages.match(/1/g)?.length ?? 0) * 0.2;
};
const recent = nights.slice(-21);
const featured = recent.reduce((best, n) => (score(n) > score(best) ? n : best), recent[0]);

mkdirSync("public/data", { recursive: true });
mkdirSync("src/data", { recursive: true });
writeFileSync("public/data/nights.json", JSON.stringify(nights));
writeFileSync("src/data/featured-night.json", JSON.stringify(featured));
console.log(`${nights.length} nights (${nights[0].day} → ${nights.at(-1).day}); featured ${featured.day}`);
