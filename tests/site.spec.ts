import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/work", "/work/duke-imaging", "/lab", "/lab/pulse", "/lab/disc", "/lab/contract", "/research",
  "/writing", "/life", "/life/restoration", "/life/training", "/life/photography", "/life/hockey",
  "/about", "/cv", "/contact", "/now", "/changelog"];

for (const path of PAGES) {
  test(`${path}: renders, no script errors, no serious accessibility issues`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForTimeout(2500); // let the pen finish drawing
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    expect(errors).toEqual([]);
    // Nothing scrolls sideways on any screen size
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("approved ContractIQ pages are public", async ({ page }) => {
  await page.goto("/lab/contract");
  await expect(page.locator("h1")).toHaveText("What is a contract worth?");
  await expect(page.locator("body")).toContainText("illustrative model, not the ContractIQ interface");
  const res = await page.request.get("/work/contractiq");
  expect(res.status()).toBe(200);
});

test("unfinished placeholders never ship to production", async ({ page }) => {
  for (const path of ["/", "/cv", "/life", "/life/hockey", "/life/restoration", "/work/contractiq", "/lab"]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText("[TK");
    await expect(page.locator("body")).not.toContainText("placeholder");
  }
});

test("the Disc exhibit is public and scrubs from before to after", async ({ page }) => {
  await page.goto("/lab/disc", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveText("The Disc");
  await expect(page.locator("main")).not.toContainText("Coming soon");
  await expect(page.locator("[data-out=axial]")).toHaveText("0.00%");
  await page.locator("#disc-t").fill("100");
  await expect(page.locator("[data-out=stage]")).toHaveText("after 30 minutes");
  await expect(page.locator("[data-out=axial]")).toHaveText("−2.27%");
  await expect(page.locator("canvas[data-view=axial]")).toHaveAttribute("aria-label", /after 30 minutes/);
  await page.getByRole("button", { name: "Show strain" }).click();
  await expect(page.locator("[data-legend]")).toBeVisible();
  // Linked from the lab index, the home page and the quick-jump index
  await page.goto("/lab");
  await expect(page.getByRole("link", { name: "The Disc" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("link", { name: "The tissue" })).toHaveAttribute("href", "/lab/disc");
  expect(await page.locator("#k-index").textContent()).toContain("/lab/disc");
});

test("Duke case study shows its research figures, and draft figures stay out of production", async ({ page }) => {
  await page.goto("/work/duke-imaging", { waitUntil: "networkidle" });
  const figs = page.locator("figure.research-fig");
  await expect(figs).toHaveCount(3);
  for (const img of await figs.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveAttribute("alt", /.{40,}/);
    expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator("figure.is-draft")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("[Draft");
});

test("the camera is never requested until the visitor presses Start", async ({ page }) => {
  // Replace the camera API with a stub that records calls and refuses permission.
  await page.addInitScript(() => {
    (window as any).__cameraAsked = 0;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: async () => { (window as any).__cameraAsked++; throw new DOMException("denied", "NotAllowedError"); } },
    });
  });
  await page.goto("/lab/pulse", { waitUntil: "networkidle" });
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => (window as any).__cameraAsked)).toBe(0);
  await page.getByRole("button", { name: "Start camera" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__cameraAsked)).toBe(1);
  await expect(page.locator("[data-cam=status]")).toContainText("stays off");
});

test("motion cancellation recovers the heart rate that footsteps hide", async ({ page }) => {
  await page.goto("/lab/pulse", { waitUntil: "networkidle" });
  await page.locator("#pl-motion").fill("60");
  await expect(page.locator("[data-pl=verdict]")).toHaveText(/Fooled|Lost/);
  await page.getByRole("button", { name: "Use the accelerometer" }).click();
  await expect(page.locator("[data-pl=verdict]")).toHaveText(/Locked on|Close/);
});

test("the first essay is published and linked from home and nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Writing" })).toBeVisible();
  await page.getByRole("link", { name: "The prototype was too small" }).first().click();
  await expect(page.locator("h1")).toHaveText("The prototype was too small");
  await expect(page.locator("body")).not.toContainText("Draft for review");
});

test("photography: gallery loads and the viewer opens, steps and closes", async ({ page }) => {
  await page.goto("/life/photography");
  await expect(page.locator("[data-gallery] figure")).toHaveCount(12);
  await page.locator("[data-gallery] a").first().click();
  const viewer = page.locator("[data-viewer]");
  await expect(viewer).toBeVisible();
  await expect(viewer.locator("[data-v-count]")).toHaveText("1 / 12");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.locator("[data-v-count]")).toHaveText("2 / 12");
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});

test("theme switch: toggles, persists across pages, no flash on load", async ({ page }) => {
  await page.goto("/");
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator("[data-theme-toggle]").click();
  const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(after).not.toBe(before);
  const chosen = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.goto("/work");
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(chosen);
});

test("quick-jump menu: opens with the keyboard, filters, and navigates", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dlg = page.locator("[data-k]");
  await expect(dlg).toBeVisible();
  await page.keyboard.type("prototype");
  await expect(dlg.locator("li[role=option]").first()).toContainText("The prototype was too small");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/writing\/the-prototype-was-too-small/);
});

test("every case study leads with a figure", async ({ page }) => {
  for (const id of ["contractiq", "bionic-health", "duke-imaging", "valencell"]) {
    await page.goto(`/work/${id}`);
    await expect(page.locator(".flow li")).toHaveCount(4);
  }
  await page.goto("/work/valencell");
  await expect(page.locator(".ppg svg")).toBeVisible();
});

test("share cards exist for every page", async ({ page }) => {
  for (const p of ["index", "lab/pulse", "life/restoration"]) {
    const res = await page.request.get(`/og/${p}.png`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});
