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

test("drafts never ship: ContractIQ case study and explorer are hidden in production", async ({ page }) => {
  await page.goto("/lab/contract");
  await expect(page.locator("h1")).toHaveText("Coming soon");
  await expect(page.locator("body")).not.toContainText("Payer A");
  const res = await page.request.get("/work/contractiq");
  expect(res.status()).toBe(404);
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

test("share cards exist for every page", async ({ page }) => {
  for (const p of ["index", "lab/pulse", "life/restoration"]) {
    const res = await page.request.get(`/og/${p}.png`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});
