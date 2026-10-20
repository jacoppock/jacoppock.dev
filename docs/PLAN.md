# jacoppock.dev v2 — Rebuild Plan

*Draft 2 · 2026-10-20 · branch `v2`*

## 0. Decisions so far

| Topic | Decision |
|---|---|
| Repo | Keep `jacoppock/jacoppock.dev`. Build v2 on the `v2` branch and merge to `main` at launch. |
| Scope | Full teardown. Nothing visual or textual has to survive. |
| Creative benchmark | felixrieseberg.com: one strong metaphor, a plain content layer underneath, a static fallback, performance targets. |
| Real estate | **Off the site.** |
| Historic preservation | **On the site** as a personal section: the exterior restoration of our home and its local preservation recognition. |
| ContractIQ | High-level only, plus an **interactive impact mock-up** that looks deliberately unlike the real product. It shows utility and dollar impact for us and our clients. |
| Human side | Photography and hockey (from the project brief), plus historic preservation. |

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

**A. Pulse (home-page centerpiece).**
- The visitor opts in to the camera (fingertip on a phone, or face on a webcam). The raw light signal goes through detrending, a band-pass filter with a draggable cutoff, injected motion artifacts ("shake your phone"), and artifact removal, then ends in peak detection and a heart-rate readout.
- All processing happens on the device and nothing is uploaded. The page says so in plain words.
- **Fallback for no camera or a declined prompt:** a recorded trace from James's own wearable. *(The Oura ring is already connected to this computer, so real overnight HR/HRV data can drive the fallback chart and a "my week" strip, subject to James choosing what to publish.)*
- Tells the Valencell and Wilson story: motion-tolerant sensing.
- Must state its limits: it is not a medical device, and camera pulse readings are less accurate on darker skin.

**B. The Disc (Duke research).**
- Scrub "minutes of treadmill walking" and watch a segmented lumbar disc deform. A BMI slider reproduces the *J. Biomech* 2021 finding.
- An optional ONNX segmentation model runs live on one sample slice.
- Uses only rights-cleared imagery: published figures, a licensed open dataset, or a synthetic phantom.

**C. ContractIQ Impact Explorer (new, detailed spec in §3).**

### The human side: "Off the clock"

- **Restoring a Morehead Hill house (historic preservation).**
  - A drag slider for before/after photos of the exterior.
  - A scroll-through elevation drawing with annotated stages: assessment, paint and wood repair, refinishing, final.
  - A short essay on why to restore rather than replace, and the local preservation recognition, with a link or photo of the plaque or award.
  - Tie-in to the theme: restoration is signal recovery, recovering what was there instead of overwriting it.
  - ⚠️ **Privacy:** name the historic district, not the street address, and crop house numbers out of photos. Decide this deliberately before publishing.
- **Photography.** A fast, full-bleed gallery. Each photo can flip to show EXIF settings and a one-line story. Images are served as AVIF/WebP with blur placeholders.
- **Hockey.** Light and fun, with a photo, team or league, and position. An optional small data toy, such as a shot map or season stats if James has the data. A renovation-themed 404 page also fits here.

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
| Framework | **Astro 5** + MDX + content collections (Zod) | The site is mostly text with a few heavy islands. Replaces the unmaintained Contentlayer. |
| Islands | Svelte (or Preact) | Small runtime. |
| Signals/charts | Canvas 2D + D3 for live traces, Observable Plot for static figures | 60 fps streaming. |
| In-browser ML | ONNX Runtime Web (WebGPU → WASM) in a Web Worker | The Disc demo. Loads only on user action. |
| 3D | Three.js only if the Disc needs it, with geometry baked offline | Keeps the home page light. |
| Images | Astro `<Image>`, AVIF/WebP, blur placeholders | Photography and restoration galleries. |
| Hosting | Vercel (likely current host; confirm) or Cloudflare Pages | Preview deploy per PR. |
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
- Your own wearable data (Oura is connected).
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
| 4. Pulse | 6–9 | Camera + recorded fallback, worker pipeline | Works on iOS Safari, Android Chrome, desktop |
| 5. Impact Explorer + Disc + case studies | 9–11 | Two more exhibits, 5 case studies, 1 essay | Peer review passed; employer approval in hand |
| 6. Launch | 12 | Merge `v2` → `main`, "How I built this" post | Baseline metrics captured |

## 8. Open questions for James

1. Should the restoration section name the street or only the district? What was the recognition (organization and year)?
2. Which hockey: playing (league, position), fandom, or both? Any stats or photos?
3. Where does the photography archive live (Lightroom, Apple Photos, a folder)?
4. Which wearable data are you comfortable publishing (e.g., one week of HR/HRV)?
5. Who at Infinia ML/Aspirion signs off on ContractIQ copy and numbers?
6. Confirm the host and DNS (Vercel?) and whether `www` or the apex is canonical.
