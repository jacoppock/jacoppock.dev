// Fitbod "Export Workout Data" CSV -> src/data/training.json
// Keeps lifting only (walks/runs live in Strava), drops warm-up sets and notes.
// Usage: node scripts/fitbod-to-json.mjs path/to/WorkoutExport.csv
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const KG_TO_LB = 2.20462;
const text = readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/);
const head = text[0].split(",");
const rows = text.slice(1).map((line) => {
  const cells = line.split(",");
  return Object.fromEntries(head.map((h, i) => [h.trim(), (cells[i] ?? "").trim()]));
});

const CARDIO = new Set(["Walking", "Running", "Cycling", "Rowing", "Elliptical", "Stair Stepper"]);
const sets = rows
  .filter((r) => !CARDIO.has(r.Exercise) && r.isWarmup !== "true")
  .map((r) => ({
    day: r.Date.slice(0, 10),
    exercise: r.Exercise,
    reps: Number(r.Reps) || 0,
    lb: (Number(r["Weight(kg)"]) || 0) * KG_TO_LB,
    mult: Number(r.multiplier) || 1, // 2 = a pair of dumbbells
  }))
  .filter((s) => s.reps > 0);

// ISO-ish week key (Monday start)
const weekOf = (day) => {
  const d = new Date(day + "T12:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
};

const weeks = new Map();
for (const s of sets) {
  const w = weekOf(s.day);
  const e = weeks.get(w) ?? { week: w, volume: 0, sets: 0, days: new Set() };
  e.volume += s.lb * s.reps * Math.max(1, s.mult);
  e.sets += 1; e.days.add(s.day);
  weeks.set(w, e);
}
const weekly = [...weeks.values()].sort((a, b) => a.week.localeCompare(b.week))
  .map((w) => ({ week: w.week, volume: Math.round(w.volume), sets: w.sets, sessions: w.days.size }));

// Estimated one-rep max (Epley), best per session, for the main barbell lifts.
const epley = (lb, reps) => lb * (1 + reps / 30);
const MAIN = ["Back Squat", "Deadlift", "Barbell Bench Press", "Front Squat", "Romanian Deadlift", "Barbell Hip Thrust", "Bent Over Barbell Row", "Barbell Shoulder Press"];
const lifts = MAIN.map((name) => {
  const byDay = new Map();
  for (const s of sets.filter((x) => x.exercise === name && x.lb > 0 && x.reps <= 12)) {
    const v = epley(s.lb, s.reps);
    const cur = byDay.get(s.day);
    if (!cur || v > cur.e1rm) byDay.set(s.day, { day: s.day, e1rm: Math.round(v), lb: Math.round(s.lb), reps: s.reps });
  }
  const points = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
  const best = points.reduce((b, p) => (!b || p.lb > b.lb || (p.lb === b.lb && p.reps > b.reps) ? p : b), null);
  return { name, points, best };
}).filter((l) => l.points.length >= 4);

// Bodyweight: most reps in a set
const bw = ["Pull Up", "Neutral Grip Pull Up", "Dip", "Push Up"].map((name) => {
  const s = sets.filter((x) => x.exercise === name);
  return s.length ? { name, maxReps: Math.max(...s.map((x) => x.reps)), sets: s.length } : null;
}).filter(Boolean);

const days = new Set(sets.map((s) => s.day));
const out = {
  from: [...days].sort()[0], to: [...days].sort().at(-1),
  sessions: days.size, sets: sets.length,
  exercises: new Set(sets.map((s) => s.exercise)).size,
  totalVolume: weekly.reduce((a, w) => a + w.volume, 0),
  weekly, lifts, bodyweight: bw,
};
mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/training.json", JSON.stringify(out, null, 1));
console.log(`${out.sessions} lifting days, ${out.sets} working sets, ${out.exercises} exercises, ${weekly.length} weeks`);
for (const l of lifts) console.log(`  ${l.name}: ${l.points.length} sessions, e1RM ${l.points[0].e1rm} -> ${l.points.at(-1).e1rm} lb; best set ${l.best.lb}x${l.best.reps}`);
console.log("  bodyweight:", bw.map((b) => `${b.name} ${b.maxReps}`).join(", "));
