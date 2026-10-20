// Titles and one-line descriptions for share cards. Keys are URL paths.
export const PAGES: Record<string, { title: string; kicker: string }> = {
  "/": { title: "I build ML systems that turn messy healthcare signals into decisions people can trust.", kicker: "Applied ML scientist in Durham, North Carolina" },
  "/work": { title: "Work", kicker: "Case studies from wearables to payer contracts" },
  "/lab": { title: "Lab", kicker: "Small instruments you can poke at" },
  "/lab/pulse": { title: "From light to heartbeat", kicker: "An explorable built on my own wearable data" },
  "/lab/disc": { title: "The Disc", kicker: "How a spinal disc deforms under load" },
  "/research": { title: "Research", kicker: "Medical imaging, spine biomechanics, wearables" },
  "/writing": { title: "Writing", kicker: "Building ML for healthcare" },
  "/life": { title: "Off the clock", kicker: "Restoration, training, hockey" },
  "/life/restoration": { title: "Restoring the Bishop-Christian House", kicker: "c. 1904. Recognized by the Durham Historic Preservation Commission." },
  "/life/training": { title: "Training", kicker: "Twelve weeks of lifting, set by set" },
  "/life/photography": { title: "Photography", kicker: "Off the clock" },
  "/life/hockey": { title: "Hockey", kicker: "Section 113. 2026 Stanley Cup champions." },
  "/about": { title: "About", kicker: "James Coppock, PhD" },
  "/cv": { title: "James A. Coppock, PhD", kicker: "Curriculum vitae" },
  "/contact": { title: "Get in touch", kicker: "Healthcare AI, speaking, advising" },
  "/now": { title: "Now", kicker: "What I'm doing these days" },
  "/changelog": { title: "Changelog", kicker: "This site, versioned like software" },
};
export const ogPath = (path: string) => `/og${path === "/" ? "/index" : path}.png`;
