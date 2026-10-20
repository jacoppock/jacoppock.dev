# jacoppock.dev v2 — Rebuild Plan

*Draft 3 · 2026-10-20 · branch `v2`*

## 0. Decisions so far

| Topic | Decision |
|---|---|
| Repo | Keep `jacoppock/jacoppock.dev`. Build v2 on the `v2` branch and merge to `main` at launch. |
| Scope | Full teardown. Nothing visual or textual has to survive. |
| Creative benchmark | felixrieseberg.com: one strong metaphor, a plain content layer underneath, a static fallback, performance targets. |
| Real estate | **Off the site.** |
| Historic preservation | **On the site** as a personal section: the exterior restoration of our home and its local preservation recognition. |
| ContractIQ | High-level only, plus an **interactive impact mock-up** that looks deliberately unlike the real product. It shows utility and dollar impact for us and our clients. |
| Human side | Photography, hockey, and historic preservation. |
| Camera | **Never on by default.** The pulse exhibit runs on James's Oura data. The camera is a separate, clearly labeled opt-in. |
| Wearable data | Oura data is approved as the default dataset. |
| Photography | No archive yet. Ship with placeholder images, swap in real photos later. |
| ContractIQ approval | James will get Infinia ML sign-off later. Until then the section stays behind a draft flag (see §3). |

## 1. What's in the repo today (audited)

- **Stack.** Next.js 13.5 (App Router), Tailwind, Contentlayer 0.3 (the project is unmaintained), Framer Motion, an Upstash Redis page-view counter (`pages/api/incr.ts`), a GitHub contribution calendar, and particle and grid backgrounds. Structure and fonts (CalSans, particles, Upstash counter) closely match the popular open-source *chronark.com* template.
- **Content.** 11 project MDX files of about 110–160 words each. Most read as generic boilerplate. Several are forks of other people's work (LangChain, ICON, UNETR, FRB) listed as projects.
- **Stale.** The About page lists the current role as "Senior Machine Learning Engineer @ Bionic Health" (Infinia ML is missing). The home page tagline is "Welcome to my page!" and the OG image is `booga.jpg`.
- **Stubs.** `/chat` and `app/agent.ts` are a fake chat agent that always answers "Got it!" The README describes an "AI Chat Application" with a placeholder clone URL.
- **Last commit.** 2024-10-25.
- **Worth keeping.** The domain, the commit history, `headshot.png`, and the experience data in `about/page.tsx`, which includes **Wilson Sporting Goods (IMU ball tracking with NFL teams)**. That role is missing from the profile and is a great signal-processing story.
- **To remove.** Fork listings, the fake chat, Contentlayer, the particle background, and the Redis counter (use privacy-friendly analytics instead).

## 2. Concept: "The Instrument," from the body to the bill

**The idea.** I build instruments that turn messy signals into decisions people can trust: a heartbeat under motion, a spinal disc in an MRI, a payer contract. The site is built as an instrument, and every exhibit lets the visitor turn a dial and watch raw signal become a decision.

**Positioning line (draft, to be tested):** *"I build ML systems that turn messy healthcare signals — from heartbeats and MRIs to payer contracts — into decisions people can trust."*

**Look and feel.** Lab-instrument styling: an amber or oscilloscope trace on warm paper, monospaced readouts, a humanist serif for prose, and numbered figures with Distill-style captions. Motion is used only when it carries information. Dark mode is available but not the default.

### The exhibits

**A. Pulse (home-page centerpiece): "A night in my signals."**
- **Default view, no permissions needed.** One real night of James's Oura data drawn as a live instrument trace: heart rate and HRV every 5 minutes, movement every 30 seconds, and sleep stages, with a slider to scrub through the night. A calendar strip lets the visitor pick any of about 100 nights (Aug–Oct 2026 so far, extended over time).
- **The explorable.** The ring stores summaries, not the raw pulse waveform, so the signal-processing lesson runs on a beat-level waveform **reconstructed from James's own heart-rate and HRV values**, labeled "reconstructed from my data." The visitor adds motion noise, drags the band-pass cutoff, removes artifacts and watches heart rate recover. That walks through the same detrend → filter → artifact removal → peak detection steps as before, with no camera.
- **Opt-in camera mode: "Try it with your own pulse →".** A secondary button the visitor has to choose. No permission prompt fires until they click, and the page says plainly that everything stays on their device and nothing is recorded. If they decline or have no camera, nothing breaks, because the default view is the complete experience.
- **Data pipeline.** A build-time script pulls Oura nights into static JSON, so the site makes no live API calls and no ring token ever reaches the browser. All metrics are approved for publishing (HR, HRV, sleep stages, movement). Timestamps are shifted to relative time ("hour 3 of sleep") so the data doesn't reveal his daily schedule.
- Tells the Valencell and Wilson story: motion-tolerant sensing.
- The camera mode must state its limits: it is not a medical device, and camera pulse readings are less accurate on darker skin.

**B. The Disc (Duke research).**
- Scrub "minutes of treadmill walking" and watch a segmented lumbar disc deform. A BMI slider reproduces the *J. Biomech* 2021 finding.
- An optional ONNX segmentation model runs live on one sample slice.
- Uses only rights-cleared imagery: published figures, a licensed open dataset, or a synthetic phantom.

**C. ContractIQ Impact Explorer (new, detailed spec in §3).**

### The human side: "Off the clock"

- **Restoring a Morehead Hill house (historic preservation).**
  - A drag slider for before/after photos of the exterior.
  - A scroll-through elevation drawing with annotated stages: assessment, paint and wood repair, refinishing, final.
  - A short essay on why to restore rather than replace, and recognition from the **Durham Historic Preservation Commission (April 2026)**, with a photo of the plaque or award.
  - Tie-in to the theme: restoration is signal recovery, recovering what was there instead of overwriting it.
  - ⚠️ **Privacy:** name the historic district, not the street address, and crop house numbers out of photos. Decide this deliberately before publishing.
- **Photography.** A fast, full-bleed gallery. Each photo can flip to show EXIF settings and a one-line story. Images are served as AVIF/WebP with blur placeholders.
  - **Launch with placeholders:** about 12 generated placeholder images (abstract gradients or film-grain studies, not stock photos posing as James's work) with placeholder captions. Each photo is a content-collection entry (`src/content/photos/*.md`: image, title, story, EXIF read automatically at build time), so adding a real photo means dropping in one file. A "placeholder" flag keeps each entry visibly marked until it's replaced.
- **Hockey.** James learned to skate at age 2, played growing up, and is now an avid Carolina Hurricanes fan and season-ticket member.
  - Story: "on skates since age 2," with childhood photos as placeholders for now.
  - **Data toy, "My season at Lenovo Center":** a rink-shaped seat-view graphic plus a games-attended log, with the result, a one-line note and a photo for each game. It's populated from a small `games.json` James updates, or from public schedule and score data at build time.
  - Bonus: on game nights, a small "Canes play tonight" readout in the footer.
  - ⚠️ No Hurricanes or NHL logos or marks. Name the team in text and use your own photos and an original rink drawing.
- A renovation-themed 404 page also fits here.

## 3. ContractIQ Impact Explorer: spec

**Goal.** Show what ContractIQ helps Aspirion and its clients achieve, and roughly what it's worth, without exposing the product, its UI, its logic or client data.

**Visual separation from the real product.** Use a different layout model (a single flowing "pipeline" story, not dashboard tables), the site's own lab-instrument styling, no real field names or screen layouts, and a visible **"Illustrative model — not the ContractIQ interface"** label.

**How it works:**
1. **Pick a fictional health system** with a preset (Community Hospital / Regional System / Academic Medical Center) or sliders for annual net patient revenue, number of payer contracts, and claim volume.
2. **Watch the flow animate:** contracts in → terms understood → expected payment per claim → variance flagged → recovered or prevented. Each stage shows a single synthetic example, such as a made-up clause like "DRG base rate × weight, 3% escalator."
3. **Adjust the assumptions:** underpayment rate, share of variance that's recoverable, analyst hours per contract review, and time to model a rate change.
4. **Read the impact panel:** dollars identified and recovered per year, analyst hours returned, time to answer a rate question (days vs. minutes), and contracts kept continuously monitored.
5. **"Who it helps" toggle:** the same numbers framed for the revenue-cycle team (recovery), for finance leaders (forecasting and negotiation leverage), and for Aspirion (scale across clients).

**Where the numbers come from.**
- Defaults use **published industry benchmarks**, with citations, for underpayment rates and contract-management labor.
- Any Aspirion-specific outcome figure appears only as an **employer-approved range**.
- A "Show the math" drawer exposes every formula, which builds credibility with technical readers.

**Until approval arrives.** Build the explorer now with *industry-benchmark defaults only* and no Aspirion figures. The ContractIQ case study and explorer carry `status: draft` in the content collection, and CI refuses to publish draft entries to production. Preview deploys can show them for review.

**Copy around it.** About 150 words covering the problem, James's role (primary architect and technical owner), the outcome categories, and two or three lessons on architecture and leadership. Get written sign-off from Infinia ML/Aspirion on this text and on any numbers.

**Build.** A single Svelte or Preact island, a pure TypeScript model in `src/lib/contract-model.ts` with unit tests, animated SVG, and no backend.

## 4. Site map

```
/            positioning line · Pulse instrument · 3 exhibit cards · "Currently: Senior AI/ML Applied Scientist, Infinia ML"
/work        case studies: ContractIQ · Duke imaging · Valencell wearables · Wilson IMU/NFL · Bionic Health
             (each: Problem → My role → Approach → Outcome → What I'd do differently)
/lab         Pulse · Disc · ContractIQ Impact Explorer (methods notes + citations)
/research    dissertation, papers, patent US 12,285,273, Scholar, BibTeX
/writing     notes — leading ML teams, ML product strategy, healthcare AI
/life        Restoration · Photography · Hockey
/about       story arc + photo + Durham
/now · /changelog · /cv (HTML + PDF) · /contact
```

## 5. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 7** (7.4.1) + MDX + content collections (Zod) | The site is mostly text with a few heavy islands. Replaces the unmaintained Contentlayer. |
| Islands | Svelte (or Preact) | Small runtime. |
| Signals/charts | Canvas 2D + D3 for live traces, Observable Plot for static figures | 60 fps streaming. |
| In-browser ML | ONNX Runtime Web (WebGPU → WASM) in a Web Worker | The Disc demo. Loads only on user action. |
| 3D | Three.js only if the Disc needs it, with geometry baked offline | Keeps the home page light. |
| Images | Astro `<Image>`, AVIF/WebP, blur placeholders | Photography and restoration galleries. |
| Hosting | **Vercel** (current host, confirmed) | Preview deploy per PR; keeps existing DNS. |
| Analytics | Plausible or Umami + custom events + `web-vitals` | Privacy-friendly, which matters for a camera demo. |
| Quality gates | Lighthouse CI, axe via Playwright, visual snapshots (Chromium/WebKit/Firefox), size-limit | A PR fails when a budget breaks. |
| OG cards | Generated per page at build time | Replaces `booga.jpg`. |

**Budgets:** ≤ 100 KB JS on the home page before interaction · LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1 (p75) · demo bundles load only after user intent.

## 6. The four questions

**1. What a top professional would do that you didn't ask for**
- Write the positioning before designing pixels.
- Commit to one metaphor.
- Make the home page work with zero interaction (recruiters skim).
- Keep a crawlable content layer and a static fallback.
- Treat SEO as product work: Person schema, a canonical apex/www redirect, OG cards.
- Make every demo work without a camera and without a mouse.
- Keep a public changelog.
- Ship an ugly first draft before any styling.
- Plan maintenance: pinned dependencies, a static poster for every demo, a quarterly dependency bump.

**2. The rawest material (not the résumé)**
- Dissertation and paper figures, plus the data behind them.
- Your own wearable data: Oura, about 100 nights of 5-minute HR/HRV, 30-second movement and sleep stages (approved as the default).
- The real filtering and segmentation notebooks.
- Wilson/NFL IMU stories.
- Patent drawings.
- Original restoration photos and documentation: paint samples, progress shots, the recognition letter or plaque.
- Your photography archive with EXIF.
- Three recorded 45-minute interviews ("explain ContractIQ to a CFO," "what went wrong," "why restore the house"), transcribed and mined for your voice.
- Colleague quotes collected directly.

**3. Methods and tools**
- A moodboard (Ciechanowski, Distill, Red Blob Games, Bret Victor, oscilloscope and medical-device UI, preservation drawings).
- A concept sprint of 5–10 throwaway prototypes, with the winners pushed further.
- Paper storyboards of each explorable's guided path.
- Content modeling before visuals.
- An Observable notebook prototype before production code.
- The stack in §5.

**4. What shows it's right, other than you or me**
- Lighthouse ≥ 95 in every category.
- Core Web Vitals passing in the field.
- Zero serious axe violations, plus VoiceOver and keyboard passes.
- 5-second tests (≥ 80% can say who you are and what you do).
- Task tests with 3 recruiters, 3 hiring managers and 3 ML peers.
- Review by one designer and two researchers.
- A cross-device matrix that includes iPhone Safari and a low-end Android.
- Demo completion rate ≥ 40%.
- Inbound contacts versus the six-month baseline.
- Ranking #1 for "James Coppock."

## 7. Roadmap (about 10–12 weeks part-time)

| Phase | Weeks | Output | Exit criterion |
|---|---|---|---|
| 0. Raw material + approvals | 1–2 | Artifact inventory, interviews, **ContractIQ copy sent for sign-off**, restoration photos gathered | ≥ 30 artifacts; approval request out |
| 1. Ugly draft | 2–3 | Plain-HTML Astro site with all copy | Passes the 5-second test |
| 2. Concept sprint | 3–4 | Moodboard + 3 Pulse prototypes + 1 Impact Explorer wireframe | One direction chosen |
| 3. Foundation | 4–6 | Design system, IA, CV, OG cards, analytics, CI gates, `/life` galleries | Lighthouse ≥ 95, axe clean |
| 4. Pulse | 6–9 | Oura build-time export, "night" instrument, reconstructed-waveform explorable, opt-in camera mode | Default experience requests no permissions; works on iOS Safari, Android Chrome, desktop |
| 5. Impact Explorer + Disc + case studies | 9–11 | Two more exhibits, 5 case studies, 1 essay | Peer review passed; employer approval in hand |
| 6. Launch | 12 | Merge `v2` → `main`, "How I built this" post | Baseline metrics captured |

## 8. Open questions for James

Answered 2026-10-20: recognition awarded April 2026 · hockey = played growing up + Canes fan and season-ticket member · no photo archive yet (use placeholders) · Infinia approval later · Oura approved as default · camera opt-in only.

Answered later on 2026-10-20: recognition from the **Durham Historic Preservation Commission** · **all Oura metrics** (HR, HRV, sleep stages, movement) are fine to publish · hosting is **Vercel** (keep it; Astro deploys there with the official adapter or as static output).

Still open:
1. Should the restoration section name the street or only the district? (Default: district only.)
2. `www` or apex as the canonical domain? (Default: apex `jacoppock.dev`, with `www` redirecting to it.)
3. Childhood hockey photos and restoration before/after photos, whenever they're ready.

## 9. Status log

**2026-10-20, draft 2 of the site**
- Pulse lab: real Suunto run (Oct 17) and Grand Canyon hike (Oct 10) via Strava. Only heart rate, steps per minute, speed and elevation change are kept; GPS, segment names and clock times are removed (`scripts/strava-to-json.mjs`).
- `/life/training` from the Fitbod export (`scripts/fitbod-to-json.mjs`): weekly volume, estimated 1RM trends, bodyweight bests. Build-time SVG, no JS.
- `/life/restoration`: before/after slider. The phone photo's EXIF (including GPS) is stripped. The before image is Google Street View, with the pickup's license plate blurred and attribution added.
- CV, About, Contact, Research and case studies filled from James's LinkedIn summary, résumé and PubMed (9 papers with DOIs).
- Share cards: `/og/*.png` generated at build time with satori and resvg.
- Analytics: Umami, loaded only when `PUBLIC_UMAMI_WEBSITE_ID` is set. Events: night-scrub, night-picked, pulse-motion, pulse-filter, pulse-cancel, pulse-complete, activity-run/hike, camera-start, contact-email, contact-linkedin.
- CI (`.github/workflows/ci.yml`): build, then Playwright (69 checks: every page × light/dark/mobile, axe, no horizontal scroll, drafts hidden, camera opt-in, motion-cancellation behavior), then Lighthouse CI budgets.
- Local Lighthouse: 100/100/100/100 on /, /lab/pulse, /life/training, /life/restoration, /cv.
