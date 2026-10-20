// ContractIQ Impact Explorer: an illustrative model. All inputs are synthetic or
// published industry benchmarks; nothing here reflects ContractIQ's internals.

export interface System { name: string; npr: number; contracts: number }
export const PRESETS: Record<string, System> = {
  community: { name: "Community hospital", npr: 250e6, contracts: 40 },
  regional: { name: "Regional health system", npr: 1.2e9, contracts: 120 },
  academic: { name: "Academic medical center", npr: 3.5e9, contracts: 300 },
};

export interface Assumptions {
  underpaymentRate: number;   // share of net patient revenue underpaid (benchmark 1–3%)
  recoverableShare: number;   // share of that variance recovered
  avgRecovery: number;        // $ per recovered claim (typical $1,001–$2,500)
  reviewHours: number;        // analyst hours to re-model one contract after a change
  reviewsPerYear: number;     // how often each contract is re-modeled
  automationShare: number;    // share of that modeling time handled by the system
}
export const DEFAULTS: Assumptions = {
  underpaymentRate: 0.015, recoverableShare: 0.4, avgRecovery: 1750,
  reviewHours: 8, reviewsPerYear: 2, automationShare: 0.7,
};

export function impact(s: System, a: Assumptions) {
  const variance = s.npr * a.underpaymentRate;
  const recovered = variance * a.recoverableShare;
  const claims = recovered / a.avgRecovery;
  const hours = s.contracts * a.reviewHours * a.reviewsPerYear * a.automationShare;
  const yieldOfNpr = recovered / s.npr; // compare to published 0.25–1.25%
  return { variance, recovered, claims, hours, fte: hours / 1880, yieldOfNpr };
}

// One synthetic claim, followed through the pipeline.
export const EXAMPLE = {
  payer: "Payer A (synthetic)",
  clause: "Inpatient stays are paid at a base rate of $9,800 multiplied by the MS-DRG relative weight. The base rate increases 3% on each contract anniversary.",
  drg: "MS-DRG 470, major hip or knee joint replacement",
  weight: 1.9,
  base: 9800,
  escalator: 0.03,
  year: 2,
  paid: 18620, // the payer kept paying the year-one rate
};
export function expectedPayment(e = EXAMPLE) {
  return Math.round(e.base * (1 + e.escalator) ** (e.year - 1) * e.weight);
}

export const usd = (v: number) =>
  v >= 1e9 ? `$${(v / 1e9).toFixed(1).replace(/\.0$/, "")} billion`
  : v >= 1e6 ? `$${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)} million`
  : `$${Math.round(v).toLocaleString("en-US")}`;
