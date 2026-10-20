// Convert raw Strava activity streams into the compact, privacy-shaped series
// the Pulse lab shows. GPS, segment names and clock times never leave this
// script: the output has elapsed time, heart rate, steps per minute, speed and
// elevation *change* only.
//
// Usage: node scripts/strava-to-json.mjs <streams.json> <id> <kind> <title> <date> [stepSeconds]
//   streams.json: GET /activities/{id}/streams (time, heart_rate, cadence,
//   velocity_smooth, altitude)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const [file, id, kind, title, date, stepArg] = process.argv.slice(2);
let raw = JSON.parse(readFileSync(file, "utf8"));
if (Array.isArray(raw)) raw = JSON.parse(raw[0].text);
const step = Number(stepArg ?? 5);

const T = raw.time.at(-1);
const out = { id, kind, title, date, step, hr: [], spm: [], speed: [], elev: [] };
let j = 0;
const alt0 = raw.altitude[0];
for (let t = 0; t <= T; t += step) {
  while (j + 1 < raw.time.length && raw.time[j + 1] <= t) j++;
  const gap = t - raw.time[j] > 60; // paused for over a minute: leave a hole
  const r1 = (v) => (v == null || gap ? null : Math.round(v));
  out.hr.push(r1(raw.heart_rate?.[j]));
  // Strava reports running cadence as one foot's strides per minute; double it for steps.
  out.spm.push(r1(raw.cadence?.[j] != null && raw.cadence[j] > 0 ? raw.cadence[j] * 2 : null));
  out.speed.push(gap ? null : Math.round((raw.velocity_smooth?.[j] ?? 0) * 100) / 100);
  out.elev.push(gap ? null : Math.round(raw.altitude[j] - alt0));
}
const hrs = out.hr.filter((v) => v != null);
out.avgHr = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length);
out.maxHr = Math.max(...hrs);
out.minutes = Math.round(T / 60);
out.distanceKm = Math.round((raw.distance?.at(-1) ?? 0) / 100) / 10;
const ev = out.elev.filter((v) => v != null);
out.climb = Math.round(ev.slice(1).reduce((a, v, i) => a + Math.max(0, v - ev[i]), 0));

mkdirSync("public/data", { recursive: true });
const indexPath = "public/data/activities.json";
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : [];
const rest = index.filter((a) => a.id !== id);
writeFileSync(indexPath, JSON.stringify([...rest, out].sort((a, b) => b.date.localeCompare(a.date))));
console.log(`${title}: ${out.hr.length} points every ${step}s, avg HR ${out.avgHr}, ${out.distanceKm} km, +${out.climb} m`);
