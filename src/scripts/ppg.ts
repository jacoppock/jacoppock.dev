// Signal processing for the Pulse exhibit. Pure functions, no DOM.

export const FS = 50; // Hz, synthetic sample rate

/** Deterministic PRNG so a given moment always produces the same waveform. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  const next = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = () => {
    const u = Math.max(next(), 1e-9), v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return { next, gauss };
}

export interface Synth {
  t: Float64Array;       // seconds
  light: Float64Array;   // what the sensor sees (pulse + breathing + motion + noise)
  accel: Float64Array;   // what the accelerometer sees (motion + its own noise)
  beats: number[];       // true beat times, seconds
}

/**
 * Rebuild a plausible fingertip/ring PPG trace from a heart rate (bpm),
 * a heart-rate variability (RMSSD, ms) and a breathing rate (breaths/min).
 * `motion` 0..1 scales a walking-to-running artifact whose step rate sits
 * near the heart rate, which is exactly why a band-pass filter alone fails.
 */
export function synthesize(hr: number, rmssd: number, breath: number, motion: number, seconds = 16, seed = 1): Synth {
  const n = Math.round(seconds * FS);
  const r = rng(seed);
  const t = new Float64Array(n), light = new Float64Array(n), accel = new Float64Array(n);

  const beats: number[] = [];
  const meanIbi = 60 / hr;
  const sd = (rmssd / 1000) / Math.SQRT2; // RMSSD ≈ √2 · SD of successive differences
  let tb = r.next() * meanIbi;
  while (tb < seconds) { beats.push(tb); tb += Math.max(0.3, meanIbi + r.gauss() * sd); }

  const cadence = 1.5 + 1.3 * motion;          // steps/s: walk → run
  const stepPhase = r.next() * Math.PI * 2;
  let k = 0;
  for (let i = 0; i < n; i++) {
    const ti = i / FS; t[i] = ti;
    while (k + 1 < beats.length && beats[k + 1] <= ti) k++;
    let pulse = 0;
    if (ti >= beats[0]) {
      const ibi = (beats[k + 1] ?? beats[k] + meanIbi) - beats[k];
      const p = (ti - beats[k]) / ibi;
      pulse = Math.exp(-(((p - 0.17) / 0.075) ** 2)) + 0.42 * Math.exp(-(((p - 0.46) / 0.11) ** 2));
    }
    const breathing = 0.35 * Math.sin((2 * Math.PI * breath / 60) * ti);
    const step = Math.sin(2 * Math.PI * cadence * ti + stepPhase) + 0.45 * Math.sin(4 * Math.PI * cadence * ti + stepPhase * 1.7);
    const m = motion * 2.4 * step;
    // Light at the sensor dips as each pulse of blood absorbs more of it.
    light[i] = 10 - pulse + breathing + m + 0.04 * r.gauss();
    accel[i] = step * (motion > 0 ? 1 : 0) + 0.05 * r.gauss();
  }
  return { t, light, accel, beats };
}

/** RBJ biquad coefficients. */
function biquad(type: "lp" | "hp", f0: number, fs: number, q = Math.SQRT1_2) {
  const w = (2 * Math.PI * f0) / fs, c = Math.cos(w), a = Math.sin(w) / (2 * q);
  const b = type === "lp" ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  const a0 = 1 + a;
  return { b0: b[0] / a0, b1: b[1] / a0, b2: b[2] / a0, a1: (-2 * c) / a0, a2: (1 - a) / a0 };
}
function run(x: ArrayLike<number>, f: ReturnType<typeof biquad>) {
  const y = new Float64Array(x.length);
  let x1 = x[0], x2 = x[0], y1 = 0, y2 = 0;
  // Warm start on the first sample to avoid a large edge transient.
  if (f.b0 + f.b1 + f.b2 > 0.5) { y1 = y2 = x[0]; }
  for (let i = 0; i < x.length; i++) {
    const v = f.b0 * x[i] + f.b1 * x1 + f.b2 * x2 - f.a1 * y1 - f.a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
/** Zero-phase (forward-backward) filtering so beats don't shift in time. */
function filtfilt(x: ArrayLike<number>, f: ReturnType<typeof biquad>) {
  const fwd = run(x, f).reverse();
  return run(fwd, f).reverse();
}
export function bandpass(x: ArrayLike<number>, lo: number, hi: number, fs = FS) {
  return filtfilt(filtfilt(x, biquad("hp", lo, fs)), biquad("lp", Math.min(hi, fs * 0.45), fs));
}

/**
 * Adaptive noise cancellation (normalized LMS): learn how the accelerometer
 * signal leaks into the optical signal and subtract it. This is the core idea
 * behind motion-tolerant wearable heart-rate sensing.
 */
export function cancelMotion(x: ArrayLike<number>, ref: ArrayLike<number>, order = 32, mu = 0.5, passes = 2, eps = 1) {
  const w = new Float64Array(order);
  let y = new Float64Array(x.length);
  // The first pass only lets the weights converge; the last pass produces the output.
  for (let pass = 0; pass < passes; pass++) {
    y = new Float64Array(x.length);
    for (let i = 0; i < x.length; i++) {
      let est = 0, pow = eps;
      for (let j = 0; j < order; j++) { const r = i - j >= 0 ? ref[i - j] : 0; est += w[j] * r; pow += r * r; }
      const e = x[i] - est;
      y[i] = e;
      const g = (mu / pow) * e;
      for (let j = 0; j < order; j++) { const r = i - j >= 0 ? ref[i - j] : 0; w[j] += g * r; }
    }
  }
  return y;
}

/** Find beats as local maxima of the (inverted) pulse; returns sample indices. */
export function detectBeats(x: ArrayLike<number>, fs = FS, minGap = 0.33) {
  const n = x.length, peaks: number[] = [];
  const win = Math.round(fs * 2);
  const gap = Math.round(fs * minGap);
  for (let i = 1; i < n - 1; i++) {
    if (!(x[i] > x[i - 1] && x[i] >= x[i + 1])) continue;
    let lo = Infinity, hi = -Infinity;
    for (let j = Math.max(0, i - win); j < Math.min(n, i + win); j++) { if (x[j] < lo) lo = x[j]; if (x[j] > hi) hi = x[j]; }
    if (x[i] < lo + 0.55 * (hi - lo)) continue;
    const last = peaks[peaks.length - 1];
    if (last !== undefined && i - last < gap) { if (x[i] > x[last]) peaks[peaks.length - 1] = i; continue; }
    peaks.push(i);
  }
  return peaks;
}

export function bpmFromPeaks(peaks: number[], fs = FS) {
  if (peaks.length < 3) return null;
  const ibis = peaks.slice(1).map((p, i) => (p - peaks[i]) / fs).sort((a, b) => a - b);
  return 60 / ibis[Math.floor(ibis.length / 2)];
}

/** The full pipeline used by the explorable. */
export function process(s: Synth, opts: { lo: number; hi: number; cancel: boolean }) {
  // Pre-filter both channels to a broad band (drops DC and slow drift) so the
  // adaptive filter only has to learn the motion coupling.
  const pre = bandpass(Array.from(s.light, (v) => -v), 0.3, 10);
  const cleaned = opts.cancel ? cancelMotion(pre, bandpass(s.accel, 0.3, 10)) : pre;
  const filtered = bandpass(cleaned, opts.lo, opts.hi);
  // Skip the first second while the adaptive filter converges.
  const peaks = detectBeats(filtered).filter((p) => p > FS);
  return { filtered, peaks, bpm: bpmFromPeaks(peaks) };
}
