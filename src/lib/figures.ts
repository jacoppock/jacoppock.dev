// Expands <figure data-fig="slug"></figure> in rendered Markdown into a responsive
// <picture> with caption, from the manifest written by scripts/process-figures.py.
// Figures marked "draft" in the manifest render in `astro dev` only.
import duke from "../data/duke-figures.json";
import { SHOW_UNFINISHED } from "./env";

type Fig = { slug: string; alt: string; caption: string; widths: number[]; fallback: number; width: number; height: number; draft?: boolean; wide?: boolean };
const FIGS: Record<string, Fig & { dir: string }> = Object.fromEntries(
  (duke as Fig[]).map((f) => [f.slug, { ...f, dir: "/images/duke" }]),
);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function expandFigures(html: string): string {
  return html.replace(/<figure data-fig="([\w-]+)"><\/figure>/g, (_, slug: string) => {
    const f = FIGS[slug];
    if (!f) throw new Error(`figures: no figure "${slug}" in the manifest`);
    if (f.draft && !SHOW_UNFINISHED) return "";
    const set = (ext: string) => f.widths.map((w) => `${f.dir}/${slug}-${w}.${ext} ${w}w`).join(", ");
    const sizes = f.wide ? "(min-width: 64rem) 53rem, 94vw" : "(min-width: 64rem) 38rem, 94vw";
    return `<figure class="research-fig${f.wide ? " is-wide" : ""}${f.draft ? " is-draft" : ""}"><picture>` +
      `<source type="image/avif" srcset="${set("avif")}" sizes="${sizes}" />` +
      `<source type="image/webp" srcset="${set("webp")}" sizes="${sizes}" />` +
      `<img src="${f.dir}/${slug}-${f.fallback}.jpg" width="${f.width}" height="${f.height}" alt="${esc(f.alt)}" loading="lazy" decoding="async" /></picture>` +
      `<figcaption>${f.draft ? '<span class="tk">[Draft: awaiting rights decision]</span> ' : ""}${f.caption}</figcaption></figure>`;
  });
}
