"""Build src/data/disc.json for the Disc exhibit from one disc of the Duke
treadmill study (pre- and post-walk MRI volumes, the learned deformation
field) and the study's whole-disc and regional strain tables.

Strain is recomputed with the same steps as the study code
(pyVista_RegionalMasking_EDA_IVDMorph.py): Gaussian smoothing (sigma 3),
0.875 mm voxels, Green-Lagrange strain from the deformation gradient.
No participant codes, file names or dates are written to the output.

Usage: python3 -I scripts/disc-to-json.py <pre.nii> <post.nii> <deformation.nii>
         <whole.csv> <regional.csv> <participant> <level> <out.json>
"""
import sys, json, csv, base64, statistics
import numpy as np, nibabel as nib
from scipy.ndimage import gaussian_filter, label, binary_fill_holes, distance_transform_edt

pre_p, post_p, warp_p, whole_p, regional_p, sid, lvl, out = sys.argv[1:]
VS = 0.875  # mm per voxel

def load_im(p):  # stored z,y,x; the deformation grid is x,y,z
    return np.transpose(nib.load(p).get_fdata(), (2, 1, 0))

def solid(a):
    lab, _ = label(a > 0)
    sizes = np.bincount(lab.ravel()); sizes[0] = 0
    return binary_fill_holes(lab == sizes.argmax())

pre, post = load_im(pre_p), load_im(post_p)
m_pre, m_post = solid(pre), solid(post)

# Green-Lagrange strain, as in the study code
disp = gaussian_filter(np.transpose(nib.load(warp_p).get_fdata(), (1, 2, 3, 0)), sigma=3)
Ux, Uy, Uz = disp[..., 1], -disp[..., 0], disp[..., 2]
Uxy, Uxx, Uxz = np.gradient(Ux, VS); Uyy, Uyx, Uyz = np.gradient(Uy, VS); Uzy, Uzx, Uzz = np.gradient(Uz, VS)
G = np.stack([np.stack([Uxx, Uxy, Uxz], -1), np.stack([Uyx, Uyy, Uyz], -1), np.stack([Uzx, Uzy, Uzz], -1)], -2)
Fi = np.eye(3) - G
E = 0.5 * (np.eye(3) - Fi @ np.swapaxes(Fi, -1, -2))
emin = np.linalg.eigvalsh(E)[..., 0] * 100  # percent

def sdf(m):  # signed distance in voxels, negative inside; lightly smoothed so outlines aren't stair-stepped
    return gaussian_filter(distance_transform_edt(~m) - distance_transform_edt(m), sigma=1.0)

s_pre, s_post = sdf(m_pre), sdf(m_post)
c = np.argwhere(m_pre).mean(0).round().astype(int)
lo = np.argwhere(m_pre | m_post).min(0) - 4
hi = np.argwhere(m_pre | m_post).max(0) + 5
scale = max(pre[m_pre].max(), post[m_post].max())

def b64(a, dtype):
    return base64.b64encode(np.ascontiguousarray(a).astype(dtype).tobytes()).decode()

def view(sl, rows, cols):
    """rows/cols are axis indices into the volume; sl indexes the slice."""
    get = lambda v: v[sl]
    def pack(v, kind):
        a = get(v)
        if kind == "img": return b64(np.clip(a / scale * 255, 0, 255).round(), np.uint8)
        if kind == "sdf": return b64(np.clip(a * 8, -127, 127).round(), np.int8)  # 1/8 voxel steps
        if kind == "strain": return b64(np.clip(np.where(get(m_pre), a, 0) * 10, -127, 127).round(), np.int8)  # 0.1 % steps
    h, w = get(pre).shape
    return {"w": w, "h": h, "pre": pack(pre, "img"), "post": pack(post, "img"),
            "sdfPre": pack(s_pre, "sdf"), "sdfPost": pack(s_post, "sdf"), "emin": pack(emin, "strain")}

# Volume axes: 0 = superior-inferior (the study's axial direction), 1 = front-back, 2 = side-to-side
sag = view((slice(lo[0], hi[0]), slice(lo[1], hi[1]), c[2]), 0, 1)
ax = view((c[0], slice(lo[1], hi[1]), slice(lo[2], hi[2])), 1, 2)

whole = list(csv.DictReader(open(whole_p)))
mine = next(r for r in whole if r["SID"] == sid and r["LVL"] == lvl)
regional = list(csv.DictReader(open(regional_p)))
regions = {}
for r in regional: regions.setdefault(r["REGION"], []).append(float(r["Jacobian"]))

f = lambda k: round(float(mine[k]), 2)
data = {
    "voxelMm": VS,
    "disc": {"level": {"L12": "L1–L2", "L23": "L2–L3", "L34": "L3–L4", "L45": "L4–L5", "L51": "L5–S1"}[lvl],
             "axialStrain": f("Green-Ax"), "volumeChange": round((float(mine["Jacobian"]) - 1) * 100, 2),
             "emin": f("Emin"),
             "recomputed": {"emin": round(float(emin[m_pre].mean()), 2)}},
    "sagittal": sag, "axial": ax,
    "population": {"n": len(whole), "pairs": len(whole) // 5,
                   "emin": sorted(round(float(r["Emin"]), 2) for r in whole)},
    "regions": {k: round(statistics.mean(v), 4) for k, v in regions.items()},
}
json.dump(data, open(out, "w"), separators=(",", ":"))
print({k: data["disc"][k] for k in data["disc"]}, "sag", sag["w"], sag["h"], "ax", ax["w"], ax["h"])
