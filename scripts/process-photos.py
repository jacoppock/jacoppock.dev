"""Turn full-size exports into web images: AVIF + WebP at 640/1280/2048 px,
a tiny blurred preview, and a JSON manifest with camera settings.
Every output is re-encoded from pixels only, so no EXIF/GPS survives.

Usage: python3 -I scripts/process-photos.py <manifest.json> <outdir> <src:slug:title:alt> ...
"""
import sys, json, base64, io
from PIL import Image, ExifTags
Image.MAX_IMAGE_PIXELS = None

manifest_path, outdir, *specs = sys.argv[1:]
WIDTHS = (640, 1280, 2048)
items = []
for order, spec in enumerate(specs, 1):
    src, slug, title, alt = spec.split("::")
    im = Image.open(src)
    sub = {ExifTags.TAGS.get(k, k): v for k, v in im.getexif().get_ifd(0x8769).items()}
    def num(v): return float(v) if v is not None else None
    settings = None
    if sub.get("FocalLength"):
        exp = num(sub.get("ExposureTime"))
        settings = {
            "lens": sub.get("LensModel"),
            "focal": round(num(sub["FocalLength"])),
            "f": num(sub.get("FNumber")),
            "shutter": f"1/{round(1/exp)}" if exp and exp < 1 else (f"{exp}s" if exp else None),
            "iso": int(sub.get("PhotographicSensitivity") or sub.get("ISOSpeedRatings") or 0) or None,
        }
    rgb = im.convert("RGB")
    w, h = rgb.size
    for W in WIDTHS:
        r = rgb.resize((W, round(h * W / w)), Image.LANCZOS)
        r.save(f"{outdir}/{slug}-{W}.avif", quality=58, speed=6)
        r.save(f"{outdir}/{slug}-{W}.webp", quality=76, method=6)
        if W == 1280:
            r.save(f"{outdir}/{slug}-{W}.jpg", quality=80, optimize=True, progressive=True)
    tiny = rgb.resize((24, round(h * 24 / w)), Image.LANCZOS)
    buf = io.BytesIO(); tiny.save(buf, "WEBP", quality=40)
    avg = rgb.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    items.append({
        "slug": slug, "title": title, "alt": alt, "order": order,
        "width": 2048, "height": round(h * 2048 / w),
        "lqip": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(),
        "color": "#%02x%02x%02x" % avg, "settings": settings,
    })
    print(slug, settings)
json.dump(items, open(manifest_path, "w"), indent=1)
