// Draws one night of Oura data as a chart-recorder trace and lets people scrub it.

export interface Night {
  day: string;
  hr: (number | null)[];
  hrv: (number | null)[];
  stages: string; // per 5 min: 1 deep, 2 light, 3 REM, 4 awake
  move: string;   // per 30 s: 1 still … 4 restless
  avgHr: number; lowHr: number; avgHrv: number; breath: number; sleepMin: number;
}
export interface Moment { index: number; minutes: number; hr: number | null; hrv: number | null; stage: string; breath: number }

const STAGE_NAME: Record<string, string> = { "1": "Deep sleep", "2": "Light sleep", "3": "REM sleep", "4": "Awake" };
const STAGE_LEVEL: Record<string, number> = { "4": 0, "3": 1, "2": 2, "1": 3 }; // hypnogram: awake on top

const css = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();
export const fmtDuration = (min: number) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`;

/** Nearest non-null value around i (the ring drops a few readings each night). */
function near(a: (number | null)[], i: number) {
  for (let d = 0; d < a.length; d++) {
    if (a[i - d] != null) return a[i - d] as number;
    if (a[i + d] != null) return a[i + d] as number;
  }
  return null;
}

/** Bridge short gaps (≤ 3 readings, 15 min) by linear interpolation; leave long gaps open. */
export function bridge(a: (number | null)[], maxGap = 3) {
  const out = a.slice();
  let i = 0;
  while (i < out.length) {
    if (out[i] != null) { i++; continue; }
    let j = i; while (j < out.length && out[j] == null) j++;
    const L = out[i - 1], R = out[j];
    if (L != null && R != null && j - i <= maxGap) for (let k = i; k < j; k++) out[k] = Math.round((L as number) + ((R as number) - (L as number)) * ((k - i + 1) / (j - i + 1)));
    i = j;
  }
  return out;
}
/** Light smoothing for the HRV channel (it's noisy minute to minute). */
function smooth(a: (number | null)[], r = 1) {
  return a.map((v, i) => {
    if (v == null) return null;
    let s = 0, c = 0; for (let k = i - r; k <= i + r; k++) { const u = a[k]; if (u != null) { s += u; c++; } }
    return s / c;
  });
}

export function mountNightChart(root: HTMLElement, initial: Night, opts: { animate?: boolean; onMoment?: (m: Moment, n: Night) => void } = {}) {
  const canvas = root.querySelector("canvas")!;
  const range = root.querySelector<HTMLInputElement>("input[type=range]")!;
  const out = {
    time: root.querySelector("[data-out=time]"),
    hr: root.querySelector("[data-out=hr]"),
    hrv: root.querySelector("[data-out=hrv]"),
    stage: root.querySelector("[data-out=stage]"),
  };
  const ctx = canvas.getContext("2d")!;
  let night = initial;
  let index = 0;
  let progress = opts.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;

  const moment = (): Moment => ({
    index, minutes: index * 5,
    hr: bridge(night.hr)[index] ?? near(night.hr, index), hrv: near(night.hrv, index),
    stage: STAGE_NAME[night.stages[index]] ?? "—", breath: night.breath,
  });

  function setIndex(i: number, notify = true) {
    index = Math.max(0, Math.min(night.hr.length - 1, i));
    range.value = String(index);
    const m = moment();
    if (out.time) out.time.textContent = fmtDuration(m.minutes);
    if (out.hr) out.hr.textContent = m.hr != null ? `${m.hr}` : "—";
    if (out.hrv) out.hrv.textContent = m.hrv != null ? `${m.hrv}` : "—";
    if (out.stage) out.stage.textContent = m.stage;
    range.setAttribute("aria-valuetext", `${fmtDuration(m.minutes)} into sleep: ${m.hr ?? "no reading"} beats per minute, ${m.stage}`);
    draw();
    if (notify) opts.onMoment?.(m, night);
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pen = css(root, "--pen"), ink = css(root, "--ink"), soft = css(root, "--ink-soft"), hrvC = css(root, "--hrv"), graphite = css(root, "--graphite");
    const font = getComputedStyle(root).fontFamily;
    const padL = 46, padR = 12, padT = 16;
    const hrS = bridge(night.hr), hrvS = smooth(bridge(night.hrv));
    const hypH = 46, moveH = 10, axisH = 20;
    const plotH = h - padT - hypH - moveH - axisH - 14;
    const n = night.hr.length;
    const x = (i: number) => padL + (i / Math.max(1, n - 1)) * (w - padL - padR);
    const vals = night.hr.filter((v): v is number => v != null);
    const lo = Math.floor((Math.min(...vals) - 4) / 5) * 5, hi = Math.ceil((Math.max(...vals) + 4) / 5) * 5;
    const y = (v: number) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;
    const upto = Math.floor(progress * (n - 1));

    // bpm gridlines
    ctx.font = `600 11px ${font}`; ctx.fillStyle = soft; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let v = lo; v <= hi; v += 10) {
      ctx.fillText(String(v), padL - 6, y(v));
    }

    // HRV, second channel: a soft area scaled to the same box
    const hv = hrvS.filter((v): v is number => v != null);
    if (hv.length) {
      const hlo = Math.min(...hv), hhi = Math.max(...hv);
      const yh = (v: number) => padT + plotH - ((v - hlo) / Math.max(1, hhi - hlo)) * plotH * 0.8 - plotH * 0.05;
      const base = padT + plotH;
      ctx.fillStyle = hrvC; ctx.globalAlpha = 0.16;
      let i = 0;
      while (i <= upto) {
        if (hrvS[i] == null) { i++; continue; }
        ctx.beginPath(); ctx.moveTo(x(i), base);
        let j = i; for (; j <= upto && hrvS[j] != null; j++) ctx.lineTo(x(j), yh(hrvS[j] as number));
        ctx.lineTo(x(j - 1), base); ctx.closePath(); ctx.fill(); i = j;
      }
      ctx.globalAlpha = 1;
    }

    // Heart rate: the pen
    ctx.strokeStyle = pen; ctx.lineWidth = 2.25; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath(); let on = false, lastX = 0, lastY = 0;
    for (let i = 0; i <= upto; i++) { const v = hrS[i]; if (v == null) { on = false; continue; } lastX = x(i); lastY = y(v); on ? ctx.lineTo(lastX, lastY) : ctx.moveTo(lastX, lastY); on = true; }
    ctx.stroke();
    if (progress < 1) { ctx.fillStyle = pen; ctx.beginPath(); ctx.arc(lastX, lastY, 4, 0, Math.PI * 2); ctx.fill(); }

    // Hypnogram
    const hy0 = padT + plotH + 14;
    const ly = (lvl: number) => hy0 + (lvl / 3) * (hypH - 6) + 3;
    ctx.fillStyle = soft; ctx.textAlign = "right"; ctx.font = `600 10px ${font}`;
    ctx.fillText("awake", padL - 6, ly(0)); ctx.fillText("deep", padL - 6, ly(3));
    ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath();
    const st = night.stages;
    for (let i = 0; i < Math.min(st.length, upto + 1); i++) {
      const lvl = STAGE_LEVEL[st[i]] ?? 2, x0 = x(i), x1 = x(Math.min(i + 1, n - 1));
      i === 0 ? ctx.moveTo(x0, ly(lvl)) : ctx.lineTo(x0, ly(lvl));
      ctx.lineTo(x1, ly(lvl));
    }
    ctx.stroke();

    // Movement ticks
    const my = hy0 + hypH + 2;
    ctx.fillStyle = graphite;
    const mv = night.move, mn = mv.length;
    for (let j = 0; j < mn && j / mn <= progress; j++) {
      const m = +mv[j]; if (m <= 1) continue;
      const xx = padL + (j / mn) * (w - padL - padR);
      ctx.globalAlpha = 0.35 + 0.2 * m; ctx.fillRect(xx, my + moveH - (m - 1) * 3.3, 1.2, (m - 1) * 3.3);
    }
    ctx.globalAlpha = 1;

    // Hours axis
    ctx.fillStyle = soft; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = `600 11px ${font}`;
    const totalH = ((n - 1) * 5) / 60;
    for (let hr = 0; hr <= totalH; hr++) ctx.fillText(hr === 0 ? "asleep" : `${hr}h`, x((hr * 60) / 5), h - axisH + 4);

    // Cursor
    if (progress >= 1) {
      const cx = x(index);
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(cx, padT - 4); ctx.lineTo(cx, my + moveH); ctx.stroke(); ctx.globalAlpha = 1;
      const v = hrS[index];
      if (v != null) { ctx.fillStyle = pen; ctx.strokeStyle = css(root, "--paper-deep"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, y(v), 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    }
  }

  function setNight(nn: Night) {
    night = nn;
    range.max = String(nn.hr.length - 1);
    // Start the cursor at a typical moment: the reading closest to the night's average heart rate.
    let best = 0, d = Infinity;
    nn.hr.forEach((v, i) => { if (v != null && Math.abs(v - nn.avgHr) < d) { d = Math.abs(v - nn.avgHr); best = i; } });
    setIndex(best);
  }

  const fromPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const f = (e.clientX - r.left - 46) / (r.width - 58);
    setIndex(Math.round(f * (night.hr.length - 1)));
  };
  canvas.addEventListener("pointerdown", (e) => { if (progress < 1) return; canvas.setPointerCapture(e.pointerId); fromPointer(e); });
  canvas.addEventListener("pointermove", (e) => { if (progress >= 1 && (e.buttons || e.pointerType === "mouse")) fromPointer(e); });
  range.addEventListener("input", () => setIndex(+range.value));

  new ResizeObserver(() => draw()).observe(canvas);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);

  setNight(initial);
  if (progress < 1) {
    const t0 = performance.now(), dur = 2200;
    const step = (now: number) => {
      progress = Math.min(1, (now - t0) / dur);
      progress = 1 - (1 - progress) ** 2.2;
      draw();
      if (progress < 1) requestAnimationFrame(step); else setIndex(index, false);
    };
    requestAnimationFrame(step);
  }
  return { setNight, setIndex, get night() { return night; } };
}
