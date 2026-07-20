# CLAUDE.md — guidance for AI assistants working in this repo

Read this before modifying anything. If a local (untracked)
`AI_INSTRUCTIONS.md` exists in your workspace, read that too — it holds
operational details that don't belong in the public repo.

## The one thing you must not get wrong: dual deployment

This codebase deploys to **two hosts with different capabilities**:

| | GitHub Pages (`yourfiyan.is-a.dev`) | InfinityFree (`yourfiyan.me`) |
|---|---|---|
| Trigger | push to `main` (`.github/workflows/deploy.yml`) | manual FTP (`npm run deploy:ftp`) |
| SPA deep links | `public/404.html` redirect + decoder in `index.html` | `public/.htaccess` rewrite |
| PHP (`public/live/`) | **not executed** — stripped from the artifact by the workflow | executed natively |
| Canonical/OG domain | injected via `SITE_URL` → `__SITE_URL__` placeholders | same mechanism |

Rules that follow:
- **A push to `main` is a production deploy.**
- PHP demos must be linked through `utils/liveDemo.ts` (`resolveLiveLink`)
  so they open on `yourfiyan.me` from any other origin.
- Everything in `public/` ships to both hosts unless stripped in the
  workflow or filtered in `deploy.cjs`. Treat it as public.
- After touching routing files (`404.html`, the `index.html` inline
  scripts, `.htaccess`, `App.tsx`), test deep links on **both** hosts.

## Architecture in five lines

- Static-data SPA: all content lives in `constants.ts` (single source of
  truth) and `blogData.ts`; there is no portfolio backend.
- `blogData.ts` is **generated** by `build-blogs.cjs` from an untracked
  local `blogs/` folder. When `blogs/` is absent (CI), the build
  deliberately **keeps the committed file** — never "simplify" that.
- Runtime integrations: GitHub REST API (`hooks/useGitHubData.ts`,
  sessionStorage-cached) and Formspree (contact form).
- `public/live/` contains standalone legacy demos (calculator, music
  player, Pocketphone PHP app). Pocketphone is a **real client site**.
- Build: `npm run build`; types: `npm run typecheck` (vite doesn't check).

## Fragile mechanisms — trace before editing

1. `__SITE_URL__` placeholder chain (index.html ← vite plugin ← env).
2. Theme system spans three synchronized places: FOUC script in
   `index.html`, `hooks/useTheme.ts`, CSS `.theme-transitioning`.
   Persist theme **only on explicit user toggle**.
3. `<Routes>` must stay the direct keyed child of
   `AnimatePresence mode="wait"`; `PageTransition` owns scroll-to-top.
4. Tailwind cannot see runtime-composed class names — complete literal
   strings only.
5. Light mode = `:root:not(.dark)` override sheet in `index.css`; new
   dark-styled UI needs matching overrides.

## Security invariants (do not regress)

- No credentials in tracked files, ever. `db_config.php` loads a
  server-only `db_config.local.php` (gitignored; `.example` provided).
- Pocketphone admin: every mutating handler verifies CSRF
  (`admin/csrf.php`), deletes are POST-only, uploads are validated by
  content (`getimagesize()`), user-controlled output is escaped, and
  `uploads/.htaccess` blocks script execution. New code follows suit.
- Secrets (`FTP_PASSWORD`, `GEMINI_API_KEY`) live in `.env.local` and
  must never reach the Vite build or any tracked file.

## Conventions

- Content edits go in `constants.ts`, not components.
- Every route page calls `usePageMeta(title, description)`.
- Images: webp at display size, width/height, alt, lazy below the fold.
- Respect reduced motion (`MotionConfig reducedMotion="user"` + the
  media block in `index.css`); errors render inline with `role="alert"`.
- Commits: `type(scope): summary` with a body explaining why.
- Don't rewrite working systems without measurable benefit; preserve the
  glass-morphism, data-driven design philosophy.
