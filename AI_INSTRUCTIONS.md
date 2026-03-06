# AI Instructions — yourfiyan.me Portfolio

> **This file exists for AI assistants.** When analyzing this workspace, read this file FIRST for build, deploy, and project context.

---

## Project Overview

- **Stack**: React + TypeScript + Vite (SPA with BrowserRouter)
- **Domains**: `yourfiyan.me` (InfinityFree) and `yourfiyan.is-a.dev` (GitHub Pages)
- **Hosting**: InfinityFree (FTP) + GitHub Pages (Actions)
- **Routing**: Clean URLs via BrowserRouter — `.htaccess` handles rewrites on InfinityFree, `404.html` handles redirects on GitHub Pages

---

## Build

```powershell
cd <workspace-root>
npm run build
```

- Output: `dist/` folder
- Vite config uses `base: '/'` (root-relative paths)
- The `dist/` folder contains everything needed for deployment: `index.html`, JS bundle, and all `public/` assets copied as-is
- Build also generates `sitemap.xml` (yourfiyan.me) and `sitemap-github.xml` (yourfiyan.is-a.dev)

---

## FTP Deployment

Use the **dashboard** (`node dashboard.cjs`) to build and deploy — it handles everything via the web UI or headless API. See the Dashboard section below.

### Credentials (for reference)

| Field       | Value                                                          |
|-------------|----------------------------------------------------------------|
| FTP Host    | `ftpupload.net`                                                |
| FTP Port    | `21`                                                           |
| FTP User    | `if0_40152047`                                                 |
| Password    | Stored in `.env.local` as `FTP_PASSWORD`                       |
| Remote Path | `/yourfiyan.me/htdocs/`                                        |
| Provider    | InfinityFree                                                   |

> **Security**: `.env.local` is excluded from git via `*.local` in `.gitignore`. Never hardcode the password.

### Notes

- **InfinityFree FTP is SLOW** (~1 file per 10-30 seconds). A full deploy takes **30-60 minutes**.
- **The remote path is `/yourfiyan.me/htdocs/`** — the `index.html` should land at `/yourfiyan.me/htdocs/index.html`.
- **BrowserRouter with `.htaccess`** handles SPA routing on InfinityFree.
- **`404.html`** redirects all paths to `index.html` on GitHub Pages.
- **Changes take a few minutes to propagate** on InfinityFree after upload.

---

## Project Structure Quick Reference

| Path | Purpose |
|------|---------|
| `constants.ts` | All data: certificates, projects, contact info, nav links |
| `types.ts` | TypeScript interfaces (Certificate, Project, etc.) |
| `components/` | Reusable UI components |
| `pages/` | Route-level page components |
| `public/assets/certificates/` | Local certificate PDF files |
| `public/assets/image/` | Images (favicon, project screenshots, etc.) |
| `public/live/` | Standalone sub-projects (calculator, music player, pocketphone) |
| `App.tsx` | Router config — all routes defined here |

### Certificate Entry Format

Certificates live in the `CERTIFICATES` array in `constants.ts`:

```typescript
{
  id: number,          // Sequential ID
  title: string,       // Certificate title
  issuer: string,      // Issuing organization
  date: string,        // e.g. "Mar 2026"
  certId?: string,     // Optional — displayed as badge on card if present
  link: string,        // URL or local path to PDF (e.g. "/assets/certificates/7-claude-101.pdf")
  image?: string       // Optional — not currently rendered by CertificateCard
}
```

**Naming convention for local certificate PDFs**: `<id>-<slug>.pdf` (e.g. `7-claude-101.pdf`)

---

## Dashboard (Blog + Deploy)

The **dashboard** (`dashboard.cjs`) is a unified local server that combines:

- **Blog Studio** — draft editing, AI generation (Gemini 2.0 Flash), blog compilation
- **Deploy Panel** — Vite build + FTP upload to InfinityFree
- **Headless API** — all operations available via REST endpoints for AI agent automation

### Start

```bash
node dashboard.cjs
# or: npm run dashboard
```

Opens at **http://localhost:4000** with a bento-grid web UI.

### Key Features

- **Pipeline lock** — prevents concurrent deploy or blog operations (returns 409)
- **FTP retry** — each file retried 3x with auto-reconnect on connection drop
- **Bearer auth** — optionally set `DASHBOARD_TOKEN` in `.env.local` to protect mutating endpoints
- **State persistence** — deploy state survives server restarts via `.dashboard-state.json`
- **Slug collision** — duplicate titles get auto-suffixed (`post-2.md`, `post-3.md`)

### API Quick Reference

| Method | Path                 | Auth | Purpose |
|--------|----------------------|------|---------|
| `GET`  | `/api/draft`         | No   | Read blog-draft.md |
| `POST` | `/api/draft`         | Yes  | Save blog-draft.md |
| `POST` | `/api/blog/generate` | Yes  | Generate post via Gemini AI |
| `POST` | `/api/blog/compile`  | Yes  | Compile blogs/*.md → blogData.ts |
| `GET`  | `/api/blogs`         | No   | List all blog posts |
| `GET`  | `/api/blog/status`   | No   | Blog pipeline status + log |
| `POST` | `/api/deploy`        | Yes  | Build + FTP upload (async) |
| `POST` | `/api/upload`        | Yes  | Upload dist/ only (async) |
| `GET`  | `/api/status`        | No   | Deploy state + FTP check |

> **Full documentation:** See `DEPLOYMENT_INSTRUCTIONS.md` for step-by-step API workflows, curl examples, error handling, and AI agent automation guide.

---

## Checklist for Future Deploys

1. [ ] Make code changes
2. [ ] Run `npm run build` (or use the Dashboard)
3. [ ] Verify `dist/` looks correct
4. [ ] Ensure `.env.local` has `FTP_PASSWORD=...` and `GEMINI_API_KEY=...`
5. [ ] Use the Dashboard: `node dashboard.cjs` → Deploy tab → Build & Deploy
6. [ ] Or use the API: `curl -X POST http://localhost:4000/api/deploy -H "Authorization: Bearer <token>"`
7. [ ] Wait for "success" status (can take 30-60 min on InfinityFree)
8. [ ] Verify site at `yourfiyan.me`
