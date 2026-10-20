# jacoppock.dev

Personal site of James A. Coppock. v2 is being rebuilt on the `v2` branch. See [`docs/PLAN.md`](docs/PLAN.md).

```sh
npm install
npm run dev      # http://localhost:4321 — draft entries visible
npm run build    # production build in dist/ — drafts excluded
```

- Case studies: `src/content/work/*.md` (`status: draft` hides an entry from production)
- Photos: `src/content/photos/*.md` + image in `public/photos/` (set `placeholder: false` when real)
