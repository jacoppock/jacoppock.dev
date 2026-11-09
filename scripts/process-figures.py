"""Turn research figures (PNG, or page 1 of a PDF already rendered to PNG) into
web images the same way process-photos.py does: AVIF + WebP at up to three
widths and a JPEG fallback, re-encoded from pixels so no metadata survives.
Transparent areas are flattened onto white, and blank margins are trimmed.

Usage: python3 -I scripts/process-figures.py <manifest.json> <outdir> <src::slug::alt::caption> ...
"""
import sys, json
from PIL import Image, ImageChops
Image.MAX_IMAGE_PIXELS = None

manifest_path, outdir, *specs = sys.argv[1:]
items = []
for spec in specs:
    src, slug, alt, caption = spec.split("::")
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white"); bg.paste(im, mask=im.split()[-1]); im = bg
    rgb = im.convert("RGB")
    box = ImageChops.difference(rgb, Image.new("RGB", rgb.size, "white")).getbbox()
    if box:
        pad = 12
        rgb = rgb.crop((max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, rgb.width), min(box[3] + pad, rgb.height)))
    w, h = rgb.size
    widths = sorted({min(W, w) for W in (640, 1280, 2048)})
    for W in widths:
        r = rgb.resize((W, round(h * W / w)), Image.LANCZOS) if W != w else rgb
        r.save(f"{outdir}/{slug}-{W}.avif", quality=62, speed=6)
        r.save(f"{outdir}/{slug}-{W}.webp", quality=82, method=6)
    fb = min(1280, w)
    rgb.resize((fb, round(h * fb / w)), Image.LANCZOS).save(f"{outdir}/{slug}-{fb}.jpg", quality=84, optimize=True, progressive=True)
    items.append({"slug": slug, "alt": alt, "caption": caption, "widths": widths, "fallback": fb,
                  "width": widths[-1], "height": round(h * widths[-1] / w)})
    print(slug, widths, (w, h))
json.dump(items, open(manifest_path, "w"), indent=1, ensure_ascii=False)
