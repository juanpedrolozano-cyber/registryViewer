# KPU Log Viewer

A dark-themed, static viewer for KPU execution logs (the `{ status, data: [...] }` JSON shape produced by the
`kpu-registry` service). Runs entirely in the browser — logs never leave your machine.

## Features

- **Three input modes**: upload a file, paste JSON, or import from URL.
  - URL import tries a direct CORS fetch first, then falls back to public proxies (`corsproxy.io`, `allorigins`) if the
    target blocks CORS.
- **Step-grouped view**: entries are grouped by `step`, each step is a collapsible card with a state badge
  (success / warning / error / retry / in-progress) derived from its entries.
- **Filters**:
  - hide noisy `Preparing to execute step` entries (on by default),
  - expand all by default,
  - only errors / errors + warnings,
  - free-text search across `logMessage`, `command`, `result`.
- **Initial Query** and **Final Execution History** panels rendered separately, lazy-mounted.
- **Copy initial query · Copy JSON · Download JSON · Collapse / Expand all** toolbar.
- Highlights warning / error / traceback lines inside code blocks.

## Local development

```bash
npm install
npm run dev
# open http://localhost:5173/registryViewer/
```

`npm run build` produces a static `dist/` ready for any CDN. The `base` in `vite.config.ts` is set to
`/registryViewer/` to match the GitHub Pages path.

## Deployment

Pushes to `main` build and publish via `.github/workflows/deploy.yml`. In GitHub repo settings:
**Settings → Pages → Source: GitHub Actions**.

## Input format

```json
{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "executionId": "...",
      "logMessage": "Starting execution",
      "step": 0,
      "query": "...",
      "command": "...",
      "result": "...",
      "timeUsed": 12,
      "status": "in_progress",
      "createdAt": "2026-05-25T08:34:38.53Z",
      "updatedAt": "2026-05-25T08:34:38.741Z"
    }
  ]
}
```

A raw top-level array of entries (without the `{ status, data }` wrapper) is also accepted.
