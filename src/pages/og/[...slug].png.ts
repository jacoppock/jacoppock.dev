// Build-time share cards (1200×630 PNG) for every page in src/lib/pages.ts.
import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { PAGES } from "../../lib/pages";
import night from "../../data/featured-night.json";

const require = createRequire(import.meta.url);
const font = (w: number) => readFileSync(require.resolve(`@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-${w}-normal.woff`));
const regular = font(400), bold = font(800);

export const getStaticPaths: GetStaticPaths = () =>
  Object.entries(PAGES).map(([path, page]) => ({ params: { slug: path === "/" ? "index" : path.slice(1) }, props: { page } }));

// The pen trace: the featured night's heart rate, as an SVG path.
const hr = night.hr.map((v, i, a) => v ?? a.slice(0, i).reverse().find((x) => x != null) ?? night.avgHr) as number[];
const lo = Math.min(...hr) - 4, hi = Math.max(...hr) + 4;
const trace = hr.map((v, i) => `${i ? "L" : "M"}${(i / (hr.length - 1)) * 1200},${(150 - ((v - lo) / (hi - lo)) * 130).toFixed(1)}`).join(" ");

export const GET: APIRoute = async ({ props }) => {
  const { page } = props as { page: { title: string; kicker: string } };
  const long = page.title.length > 60;
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between",
          backgroundColor: "#eef2e7", color: "#1d2a4d", fontFamily: "Atkinson",
          backgroundImage: "linear-gradient(#d5e0cb 1px, transparent 1px), linear-gradient(90deg, #d5e0cb 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        },
        children: [
          { type: "div", props: { style: { display: "flex", padding: "56px 72px 0", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }, children: "James Coppock" } },
          { type: "div", props: { style: { display: "flex", flexDirection: "column", padding: "0 72px", gap: 18 }, children: [
            { type: "div", props: { style: { fontSize: long ? 58 : 92, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }, children: page.title } },
            { type: "div", props: { style: { fontSize: 30, color: "#4b5772" }, children: page.kicker } },
          ] } },
          { type: "svg", props: { width: 1200, height: 160, viewBox: "0 0 1200 160", children: [
            { type: "path", props: { d: trace, fill: "none", stroke: "#c42f2a", "stroke-width": 4, "stroke-linejoin": "round" } },
          ] } },
        ],
      },
    } as any,
    { width: 1200, height: 630, fonts: [{ name: "Atkinson", data: regular, weight: 400 }, { name: "Atkinson", data: bold, weight: 800 }] },
  );
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
