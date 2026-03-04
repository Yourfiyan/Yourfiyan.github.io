# Deployment Instructions — yourfiyan.me

> **For AI agents (Sonnet, Flash, etc.) operating the dashboard headlessly.**
> Human-readable too. Covers blog generation, compilation, and FTP deployment.

---

## Prerequisites

| Requirement      | Details                                              |
|------------------|------------------------------------------------------|
| Node.js          | v18+ (tested with v20)                               |
| npm dependencies | Run `npm install` in the project root                |
| `.env.local`     | Must exist in root with the keys below               |

### Required `.env.local` keys

```
GEMINI_API_KEY=<your-gemini-api-key>
FTP_PASSWORD=<ftp-password>
DASHBOARD_TOKEN=<optional-secret-token>
```

- `GEMINI_API_KEY` — Google AI Studio key for Gemini 2.0 Flash (used for blog generation)
- `FTP_PASSWORD` — FTP password for InfinityFree hosting
- `DASHBOARD_TOKEN` — (Optional) Bearer token for protecting mutating API endpoints. If blank, auth is disabled.

---

## Starting the Dashboard

```bash
node dashboard.cjs
```

Opens at **http://localhost:4000**. The web UI has two tabs:
- **Blog Studio** — write drafts, generate with AI, compile, view posts
- **Deploy** — build the Vite project, upload to FTP, monitor progress

---

## Authentication

All **mutating endpoints** (`POST`) require an `Authorization` header if `DASHBOARD_TOKEN` is set:

```
Authorization: Bearer <DASHBOARD_TOKEN>
```

Read-only endpoints (`GET`) are always open.

If `DASHBOARD_TOKEN` is empty or not set, auth is disabled (with a startup warning).

---

## Headless Blog Workflow (API)

Use this step-by-step flow to write and publish a blog post entirely via API calls.

### Step 1: Write the draft

```bash
curl -X POST http://localhost:4000/api/draft \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: text/plain" \
  --data-binary @- << 'EOF'
# title: My New Blog Post

## tone
casual

## audience
beginner developers

## tags
React, Portfolio, Web Dev

## key_points
- Point one to cover
- Point two to cover
- Point three to cover

## rough_draft
Write your rough notes and ideas here. The more detail you provide,
the better the AI output will be. Include personal anecdotes, specific
technical details, and your authentic voice.
EOF
```

**Response:** `{ "ok": true }`

### Step 2: Generate the post with AI

```bash
curl -X POST http://localhost:4000/api/blog/generate \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** `{ "ok": true, "slug": "my-new-blog-post", "excerpt": "...", "paragraphs": 6 }`

This calls Gemini 2.0 Flash, parses the response, and saves to `blogs/<slug>.md`.

### Step 3: Compile blogs to TypeScript

```bash
curl -X POST http://localhost:4000/api/blog/compile \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** `{ "ok": true, "message": "Compiled" }`

This runs `build-blogs.cjs` which reads all `blogs/*.md` files and generates `blogData.ts`.

### Step 4: Build and deploy

```bash
curl -X POST http://localhost:4000/api/deploy \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** `{ "ok": true, "message": "Deploy started (build + upload)" }` (HTTP 202)

This is async. Poll the status endpoint to track progress:

### Step 5: Poll until complete

```bash
curl http://localhost:4000/api/status
```

**Response schema:**
```json
{
  "ok": true,
  "lastDeploy": "2026-03-04T10:30:00.000Z",
  "lastStatus": "uploading",
  "lastError": null,
  "filesUploaded": 15,
  "totalFiles": 42,
  "currentFile": "assets/index-abc123.js",
  "isRunning": true,
  "ftp": { "connected": null, "error": "Deploy in progress" },
  "log": ["[10:30:01] Starting npm run build...", "..."]
}
```

Poll every 2-3 seconds. Stop when `isRunning === false`. Check `lastStatus`:
- `"success"` — deploy completed
- `"failed"` — check `lastError` for details

---

## Headless Deploy-Only Workflow

If blogs are already compiled and you just want to deploy:

```bash
# Build + upload
curl -X POST http://localhost:4000/api/deploy -H "Authorization: Bearer <TOKEN>"

# Or upload existing dist/ only (skip build)
curl -X POST http://localhost:4000/api/upload -H "Authorization: Bearer <TOKEN>"
```

Then poll `GET /api/status` as above.

---

## Draft Template Format

The draft file (`blog-draft.md`) uses this exact format:

```markdown
# title: Your Post Title Here

## tone
casual

## audience
beginner developers

## tags
Tag1, Tag2, Tag3

## key_points
- First key point
- Second key point
- Third key point

## rough_draft
Your freeform notes, ideas, and rough content here.
The more you write, the better the AI generation quality.
```

**Valid tone values:** `casual`, `professional`, `tutorial`, `storytelling`, `motivational`

**Tags:** Comma-separated. These become the tags displayed on the blog post card.

**Key points:** Use `-` bullet points. Each point will be covered in the generated post.

**Rough draft:** The most important section. Write your ideas, anecdotes, technical details in any format. The AI uses this as its foundation.

---

## File System Workflow (No Server)

You can also operate without the dashboard:

```bash
# 1. Edit blog-draft.md manually
# 2. Generate post
node generate-blog.cjs

# 3. Preview prompt only (no AI call)
node generate-blog.cjs --dry

# 4. Compile all blogs to blogData.ts
node build-blogs.cjs

# 5. Build the site (auto-compiles blogs first)
npm run build

# 6. Start dashboard and deploy via UI
node dashboard.cjs
```

---

## API Reference

### Blog Endpoints

| Method | Path                | Auth | Body | Response |
|--------|---------------------|------|------|----------|
| `GET`  | `/api/draft`        | No   | —    | Raw text (blog-draft.md content) |
| `POST` | `/api/draft`        | Yes  | Raw markdown text | `{ "ok": true }` |
| `POST` | `/api/blog/generate`| Yes  | —    | `{ "ok": true, "slug": "...", "paragraphs": N, "excerpt": "..." }` |
| `POST` | `/api/blog/compile` | Yes  | —    | `{ "ok": true, "message": "Compiled" }` |
| `GET`  | `/api/blogs`        | No   | —    | `[{ "slug", "title", "date", "tags", "readTime", "file" }]` |
| `GET`  | `/api/blog/status`  | No   | —    | `{ "status", "message", "log": [] }` |

### Deploy Endpoints

| Method | Path            | Auth | Body | Response |
|--------|-----------------|------|------|----------|
| `POST` | `/api/deploy`   | Yes  | —    | `{ "ok": true, "message": "Deploy started..." }` (202) |
| `POST` | `/api/upload`   | Yes  | —    | `{ "ok": true, "message": "Upload started..." }` (202) |
| `GET`  | `/api/status`   | No   | —    | Full deploy state JSON (see schema above) |

### UI

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/`  | Web dashboard HTML |

---

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| `200`  | Success | Proceed |
| `202`  | Accepted (async) | Poll `/api/status` |
| `401`  | Unauthorized | Check `Authorization: Bearer <token>` header matches `DASHBOARD_TOKEN` in `.env.local` |
| `409`  | Conflict (busy) | A pipeline is already running. Wait and retry. |
| `500`  | Server error | Check `error` field in response. Common causes: missing API key, FTP timeout, compile failure |

---

## Concurrency Rules

- Only **one deploy** can run at a time (build or upload)
- Only **one blog operation** can run at a time (generate or compile)
- Deploy and blog operations **can** run simultaneously (they don't share resources)
- Concurrent requests to a busy pipeline return `409 Conflict`

---

## FTP Retry Behavior

- Each file upload is retried **up to 3 times** on failure
- 2-second delay between retries
- If the FTP connection drops, the server attempts reconnection before retrying
- Files that fail after all retries are logged but don't abort the deploy
- The final log shows total succeeded/failed counts

---

## State Persistence

Deploy state (last deploy time, status, errors) is persisted to `.dashboard-state.json`. On server restart, the last deploy info is restored. Blog generation state is transient (rerun if needed).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY not found` | Add `GEMINI_API_KEY=<key>` to `.env.local` |
| `FTP_PASSWORD not set` | Add `FTP_PASSWORD=<pass>` to `.env.local` |
| `basic-ftp not installed` | Run `npm install` (it's in devDependencies) |
| `dist/ not found` | Run `npm run build` first, or use `/api/deploy` (which builds automatically) |
| `Blog pipeline is already running` | Wait for current operation. Poll `/api/blog/status`. |
| `Deploy already in progress` | Wait for current deploy. Poll `/api/status`. |
| `401 Unauthorized` | Set `Authorization: Bearer <token>` header matching `DASHBOARD_TOKEN` |
| Slug collision | Automatic — if `slug.md` exists, the system tries `slug-2.md`, `slug-3.md`, etc. |
| AI response missing markers | Automatic fallback — uses full response as content, auto-generates excerpt |
