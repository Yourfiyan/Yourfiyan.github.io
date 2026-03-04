/**
 * Dashboard Server — Combined Blog Studio + Deploy Panel for yourfiyan.me
 *
 * One unified local dashboard at http://localhost:4000 with:
 *   - Blog writing, AI generation, compilation
 *   - Build & FTP deployment
 *   - Real-time status and logs
 *   - Headless API for AI agent automation
 *
 * Usage:   node dashboard.cjs
 *
 * ── Blog API ──
 *   GET  /api/draft          — read current blog-draft.md
 *   POST /api/draft          — save blog-draft.md (body = raw markdown)
 *   POST /api/blog/generate  — generate post from draft via Gemini AI
 *   POST /api/blog/compile   — compile blogs/*.md → blogData.ts
 *   GET  /api/blogs          — list all blog posts
 *   GET  /api/blog/status    — blog pipeline status + log
 *
 * ── Deploy API (GitHub primary, FTP fallback) ──
 *   POST /api/deploy         — build + upload
 *   POST /api/upload         — upload dist/ only (skip build)
 *   GET  /api/status         — deploy state + FTP connectivity
 */

const http = require("http");
const { exec, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const https = require("https");

let ftp;
try { ftp = require("basic-ftp"); } catch { ftp = null; }

// ═══════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════
const PORT = 4000;
const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, "dist");
const BLOGS_DIR = path.join(ROOT, "blogs");
const DRAFT_FILE = path.join(ROOT, "blog-draft.md");
const STATE_FILE = path.join(ROOT, ".dashboard-state.json");

const FTP_HOST = "ftpupload.net";
const FTP_USER = "if0_40152047";
const FTP_REMOTE = "/yourfiyan.me/htdocs";

const GITHUB_REPO = "yourfiyan/yourfiyan.github.io";
const GITHUB_ACTIONS_URL = `https://github.com/${GITHUB_REPO}/actions`;

// ── Load secrets from .env.local ─────────────────────────────────
function loadEnv(key) {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = fs.readFileSync(path.join(ROOT, file), "utf8");
      const m = content.match(new RegExp(`${key}\\s*=\\s*(.+)`));
      if (m) return m[1].trim();
    } catch {}
  }
  return null;
}

const FTP_PASS = loadEnv("FTP_PASSWORD") || "";
const GEMINI_KEY = loadEnv("GEMINI_API_KEY") || "";
const DASHBOARD_TOKEN = loadEnv("DASHBOARD_TOKEN") || "";

// ═══════════════════════════════════════════════════════════════════
//  PIPELINE LOCK  (prevents concurrent operations)
// ═══════════════════════════════════════════════════════════════════
const pipelineLock = { deploy: false, blog: false };
let cancelRequested = false;
let activeFtpClient = null;
let activeBuildProcess = null;

// ═══════════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════════
let deployState = {
  lastDeploy: null,
  lastStatus: "idle",
  lastError: null,
  filesUploaded: 0,
  totalFiles: 0,
  currentFile: null,
  isRunning: false,
  log: [],
};

let githubDeployState = {
  lastPush: null,
  lastStatus: "idle",   // idle | pushing | success | failed
  lastError: null,
  isRunning: false,
  log: [],
};

let blogState = {
  status: "idle",   // idle | generating | compiling | done | error
  message: "",
  log: [],
};

// ── Restore persisted state ──────────────────────────────────────
function loadPersistedState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      if (saved.lastDeploy) deployState.lastDeploy = saved.lastDeploy;
      if (saved.lastStatus) deployState.lastStatus = saved.lastStatus;
      if (saved.lastError) deployState.lastError = saved.lastError;
    }
  } catch {}
}
loadPersistedState();

function persistState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      lastDeploy: deployState.lastDeploy,
      lastStatus: deployState.lastStatus,
      lastError: deployState.lastError,
    }, null, 2), "utf8");
  } catch {}
}

// ── Log helpers (capped) ─────────────────────────────────────────
function dLog(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  const line = `[${ts}] ${msg}`;
  deployState.log.push(line);
  if (deployState.log.length > 300) deployState.log.shift();
  console.log(line);
}

function bLog(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  const line = `[${ts}] ${msg}`;
  blogState.log.push(line);
  if (blogState.log.length > 200) blogState.log.shift();
  console.log(line);
}

// ═══════════════════════════════════════════════════════════════════
//  AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════
function checkAuth(req) {
  if (!DASHBOARD_TOKEN) return true; // no token configured → open
  const header = req.headers["authorization"] || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token === DASHBOARD_TOKEN;
}

// ═══════════════════════════════════════════════════════════════════
//  FTP  (with retry / reconnect)
// ═══════════════════════════════════════════════════════════════════
async function testFtpConnection() {
  if (!ftp) return { connected: false, error: "basic-ftp not installed. Run: npm install" };
  if (!FTP_PASS) return { connected: false, error: "FTP_PASSWORD not set in .env.local" };
  const client = new ftp.Client(10000);
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
      client.close();
      return { connected: true, error: null };
    } catch (err) {
      lastErr = err.message;
      if (attempt < 2) await sleep(2000);
    }
  }
  try { client.close(); } catch {}
  return { connected: false, error: lastErr };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function collectFiles(dir, base = "") {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) results = results.concat(collectFiles(path.join(dir, entry.name), rel));
    else results.push({ absolute: path.join(dir, entry.name), relative: rel });
  }
  return results;
}

function runBuild() {
  return new Promise((resolve, reject) => {
    dLog("Starting npm run build...");
    const proc = exec("npm run build", { cwd: ROOT }, (err, stdout, stderr) => {
      activeBuildProcess = null;
      if (cancelRequested) { dLog("Build cancelled."); reject(new Error("Cancelled")); }
      else if (err) { dLog(`Build FAILED: ${err.message}`); reject(new Error(stderr || err.message)); }
      else { dLog("Build completed successfully."); resolve(stdout); }
    });
    activeBuildProcess = proc;
  });
}

async function uploadFileWithRetry(client, file, remotePath, maxRetries = 3) {
  const remoteDir = path.posix.dirname(remotePath);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.ensureDir(remoteDir);
      await client.cd("/");
      await client.uploadFrom(file.absolute, remotePath);
      return true;
    } catch (err) {
      if (attempt < maxRetries) {
        dLog(`⟳ Retry ${attempt}/${maxRetries} for ${file.relative}: ${err.message}`);
        await sleep(2000);
        // Attempt reconnect if connection dropped
        if (client.closed) {
          try {
            dLog("Reconnecting FTP...");
            await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
            dLog("Reconnected.");
          } catch (reconnectErr) {
            dLog(`Reconnect failed: ${reconnectErr.message}`);
          }
        }
      } else {
        throw err;
      }
    }
  }
}

async function uploadDist() {
  if (!ftp) throw new Error("basic-ftp not installed. Run: npm install");
  if (!FTP_PASS) throw new Error("FTP_PASSWORD not set in .env.local");
  if (!fs.existsSync(DIST_DIR)) throw new Error("dist/ not found. Run a build first.");

  const files = collectFiles(DIST_DIR);
  deployState.totalFiles = files.length;
  deployState.filesUploaded = 0;
  let failedCount = 0;
  let retriedCount = 0;

  dLog(`Connecting to FTP ${FTP_HOST}...`);
  const client = new ftp.Client(30000);
  client.ftp.verbose = false;
  activeFtpClient = client;

  try {
    await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
    dLog("FTP connected.");
    await client.ensureDir(FTP_REMOTE);

    for (const file of files) {
      if (cancelRequested) {
        dLog(`⛔ Upload cancelled after ${deployState.filesUploaded}/${deployState.totalFiles} files.`);
        break;
      }
      const remotePath = `${FTP_REMOTE}/${file.relative}`.replace(/\\/g, "/");
      deployState.currentFile = file.relative;
      try {
        await uploadFileWithRetry(client, file, remotePath);
        deployState.filesUploaded++;
        const sizeKB = (fs.statSync(file.absolute).size / 1024).toFixed(1);
        dLog(`✓ ${file.relative} (${sizeKB} KB) [${deployState.filesUploaded}/${deployState.totalFiles}]`);
      } catch (e) {
        failedCount++;
        dLog(`✗ FAILED ${file.relative}: ${e.message} (after 3 retries)`);
      }
    }

    try { client.close(); } catch {}
    activeFtpClient = null;
    if (cancelRequested) {
      throw new Error("Cancelled by user");
    }
    dLog(`Upload complete: ${deployState.filesUploaded}/${deployState.totalFiles} files. ${failedCount > 0 ? failedCount + " failed." : ""}`);
    if (failedCount > 0) dLog(`⚠ ${failedCount} file(s) failed to upload after retries.`);
  } catch (err) {
    try { client.close(); } catch {}
    activeFtpClient = null;
    throw err;
  }
}

async function runDeploy(skipBuild = false) {
  if (pipelineLock.deploy) throw new Error("Deploy already in progress.");
  pipelineLock.deploy = true;
  cancelRequested = false;
  deployState.isRunning = true;
  deployState.lastError = null;
  deployState.log = [];

  try {
    if (!skipBuild) {
      deployState.lastStatus = "building";
      await runBuild();
    }
    deployState.lastStatus = "uploading";
    await uploadDist();
    deployState.lastStatus = "success";
    deployState.lastDeploy = new Date().toISOString();
    deployState.lastError = null;
    dLog("Deploy successful!");
  } catch (err) {
    if (cancelRequested) {
      deployState.lastStatus = "cancelled";
      deployState.lastError = "Cancelled by user";
      dLog("⛔ Deploy cancelled.");
    } else {
      deployState.lastStatus = "failed";
      deployState.lastError = err.message;
      dLog(`Deploy failed: ${err.message}`);
    }
  } finally {
    pipelineLock.deploy = false;
    cancelRequested = false;
    activeFtpClient = null;
    activeBuildProcess = null;
    deployState.isRunning = false;
    deployState.currentFile = null;
    persistState();
  }
}

// ═══════════════════════════════════════════════════════════════════
//  GITHUB DEPLOY  (primary — commits + pushes to main → Actions builds)
// ═══════════════════════════════════════════════════════════════════
function gLog(msg) {
  githubDeployState.log.push(msg);
  if (githubDeployState.log.length > 200) githubDeployState.log.shift();
  console.log(`[GitHub] ${msg}`);
}

async function runGitHubDeploy() {
  if (githubDeployState.isRunning) return;
  githubDeployState.isRunning = true;
  githubDeployState.lastStatus = "pushing";
  githubDeployState.log = [];
  githubDeployState.lastError = null;

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
  const commitMsg = `Deploy: ${timestamp}`;

  try {
    const runCmd = (cmd) => new Promise((resolve, reject) => {
      const proc = exec(cmd, { cwd: ROOT, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        const out = (stdout + stderr).trim();
        if (out) out.split("\n").forEach(l => gLog(l));
        if (err) reject(new Error(out || err.message));
        else resolve(out);
      });
      proc;
    });

    gLog("Compiling blogs...");
    await runCmd("node build-blogs.cjs");

    gLog("Staging all changes...");
    await runCmd("git add -A");

    // Check if there's anything to commit
    const status = await new Promise((resolve) => {
      exec("git status --porcelain", { cwd: ROOT }, (err, stdout) => resolve(stdout.trim()));
    });

    if (status) {
      gLog(`Committing: ${commitMsg}`);
      await runCmd(`git commit -m "${commitMsg}"`);
    } else {
      gLog("Nothing new to commit — pushing existing HEAD anyway...");
    }

    gLog("Pushing to origin main...");
    await runCmd("git push origin main");

    githubDeployState.lastStatus = "success";
    githubDeployState.lastPush = new Date().toISOString();
    gLog(`✓ Pushed! GitHub Actions is now building your site.`);
    gLog(`  Watch: ${GITHUB_ACTIONS_URL}`);
  } catch (err) {
    githubDeployState.lastStatus = "failed";
    githubDeployState.lastError = err.message;
    gLog(`✗ GitHub deploy failed: ${err.message}`);
  } finally {
    githubDeployState.isRunning = false;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  BLOG GENERATION
// ═══════════════════════════════════════════════════════════════════

function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096 }
    });
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error("No text in Gemini response"));
          resolve(text);
        } catch (e) { reject(new Error(`Parse error: ${e.message}`)); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function parseDraftContent(raw) {
  const draft = {};
  const titleMatch = raw.match(/^#\s*title:\s*(.+)$/m);
  draft.title = titleMatch ? titleMatch[1].trim() : "Untitled Post";

  const sections = ["tone", "audience", "tags", "key_points", "rough_draft"];
  for (const section of sections) {
    const headerIdx = raw.indexOf(`## ${section}`);
    if (headerIdx === -1) { draft[section] = ""; continue; }
    const afterHeader = raw.indexOf("\n", headerIdx);
    if (afterHeader === -1) { draft[section] = ""; continue; }
    let content = raw.slice(afterHeader + 1);
    const nextHeader = content.match(/^## \w/m);
    if (nextHeader) content = content.slice(0, nextHeader.index);
    content = content.replace(/<!--[\s\S]*?-->/g, "");
    draft[section] = content.trim();
  }
  draft.tagsArray = draft.tags ? draft.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return draft;
}

function buildPrompt(draft) {
  return `You are a skilled blog writer helping a 17-year-old student developer named Syed Sufiyan Hamza write blog posts for his portfolio website. He's from Titabar, Assam, India.

TASK: Write a complete, polished blog post based on the draft information below. The draft contains the author's rough notes, key points, and ideas — your job is to turn this into a well-written blog post that sounds like HIM, not like a generic AI.

TITLE: ${draft.title}
TONE: ${draft.tone || "casual"}
TARGET AUDIENCE: ${draft.audience || "general"}
TAGS: ${draft.tagsArray.join(", ")}

KEY POINTS THAT MUST BE COVERED:
${draft.key_points || "(none specified — use the rough draft for direction)"}

AUTHOR'S ROUGH DRAFT / NOTES:
${draft.rough_draft || "(minimal notes provided — be creative but stay on topic)"}

STRICT RULES:
1. Write 4-8 paragraphs. Each paragraph should be 3-5 substantial sentences.
2. Match the requested tone EXACTLY (casual = conversational, tutorial = instructive, etc.).
3. Cover ALL the key points mentioned above — don't skip any.
4. Expand on the rough draft — use those notes as your foundation but make it polished and natural.
5. Write in first person ("I") — this is a personal blog from a student developer.
6. Do NOT use any markdown formatting inside the content — no headers, no bold, no bullet points, no code blocks. Just plain text paragraphs separated by blank lines.
7. Do NOT start with cliché openings like "In this post..." or "Today I want to talk about..." — start with something engaging.
8. Do NOT include the title in the body text.
9. Keep it authentic and age-appropriate — this is a 17-year-old student, not a senior engineer or corporate blogger.
10. Use natural transitions between paragraphs.

OUTPUT FORMAT — follow this EXACTLY, including the markers:
---START---
First paragraph text here.

Second paragraph text here.

Third paragraph text here.

(continue with more paragraphs as needed)

---EXCERPT---
A compelling 1-2 sentence summary of the post for the blog card preview (max 160 characters).
---END---`;
}

function parseAIResponse(text) {
  const startMatch = text.indexOf("---START---");
  const excerptMatch = text.indexOf("---EXCERPT---");
  const endMatch = text.indexOf("---END---");

  let contentBlock, excerpt;

  if (startMatch !== -1 && excerptMatch !== -1) {
    contentBlock = text.slice(startMatch + 11, excerptMatch).trim();
    excerpt = text.slice(excerptMatch + 13, endMatch !== -1 ? endMatch : undefined).trim();
  } else if (startMatch !== -1) {
    // START present but EXCERPT missing
    contentBlock = text.slice(startMatch + 11, endMatch !== -1 ? endMatch : undefined).trim();
    bLog("⚠ AI response missing EXCERPT marker — auto-generating excerpt");
    excerpt = "";
  } else {
    // No markers at all — treat entire response as content
    bLog("⚠ AI response missing START marker — using full output as content");
    contentBlock = text.replace(/---\w+---/g, "").trim();
    excerpt = "";
  }

  const paragraphs = contentBlock
    .split(/\n\s*\n/)
    .map(p => p.replace(/\r?\n/g, " ").trim())
    .filter(p => p.length > 0);

  // Auto-generate excerpt if missing
  if (!excerpt && paragraphs.length > 0) {
    excerpt = paragraphs[0].length > 160 ? paragraphs[0].slice(0, 157) + "..." : paragraphs[0];
  }

  // Validation warnings
  if (paragraphs.length < 2) bLog(`⚠ AI generated only ${paragraphs.length} paragraph(s) — may need manual editing`);
  if (paragraphs.length > 10) bLog(`⚠ AI generated ${paragraphs.length} paragraphs — unusually long output`);

  return { paragraphs, excerpt };
}

// ── Slug collision handling ──────────────────────────────────────
function resolveSlug(title) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!fs.existsSync(BLOGS_DIR)) return base;

  const existing = fs.readdirSync(BLOGS_DIR)
    .filter(f => f.endsWith(".md") && !f.includes(".backup-"))
    .map(f => path.basename(f, ".md"));

  if (!existing.includes(base)) return base;

  // Try numbered suffixes
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    if (!existing.includes(candidate)) {
      bLog(`⚠ Slug collision: "${base}" exists — using "${candidate}" instead`);
      return candidate;
    }
  }
  // Fallback: timestamp suffix
  return `${base}-${Date.now()}`;
}

async function generateBlog() {
  if (pipelineLock.blog) throw new Error("Blog pipeline is already running.");
  pipelineLock.blog = true;
  blogState.status = "generating";
  blogState.message = "Reading draft...";
  blogState.log = [];

  try {
    if (!fs.existsSync(DRAFT_FILE)) throw new Error("blog-draft.md not found");
    const raw = fs.readFileSync(DRAFT_FILE, "utf8");
    const draft = parseDraftContent(raw);

    bLog(`Title: ${draft.title}`);
    bLog(`Tone: ${draft.tone || "casual"} | Audience: ${draft.audience || "general"}`);
    bLog(`Tags: ${draft.tagsArray.join(", ") || "(none)"}`);
    bLog(`Key points: ${draft.key_points ? draft.key_points.split("\n").filter(l => l.trim().startsWith("-")).length : 0}`);
    bLog(`Draft words: ${draft.rough_draft ? draft.rough_draft.split(/\s+/).length : 0}`);

    if (!draft.rough_draft || draft.rough_draft.length < 20) {
      bLog("⚠ Warning: rough_draft is very short — AI output quality may be lower");
    }

    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

    blogState.message = "Calling Gemini AI...";
    bLog("Sending to Gemini AI (gemini-2.5-flash)...");
    const aiText = await callGemini(GEMINI_KEY, buildPrompt(draft));
    const { paragraphs, excerpt } = parseAIResponse(aiText);
    bLog(`AI generated ${paragraphs.length} paragraphs`);

    const slug = resolveSlug(draft.title);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const now = new Date();
    const date = `${months[now.getMonth()]} ${now.getFullYear()}`;

    const md = `---\ntitle: "${draft.title}"\ndate: "${date}"\ntags: ${JSON.stringify(draft.tagsArray)}\n---\n\n${paragraphs.join("\n\n")}\n`;

    if (!fs.existsSync(BLOGS_DIR)) fs.mkdirSync(BLOGS_DIR);
    const outPath = path.join(BLOGS_DIR, `${slug}.md`);

    if (fs.existsSync(outPath)) {
      const backup = outPath.replace(".md", `.backup-${Date.now()}.md`);
      fs.renameSync(outPath, backup);
      bLog(`Existing file backed up → ${path.basename(backup)}`);
    }
    fs.writeFileSync(outPath, md, "utf8");
    bLog(`✓ Saved: blogs/${slug}.md`);
    bLog(`Excerpt: ${excerpt}`);

    blogState.status = "done";
    blogState.message = `Generated: blogs/${slug}.md`;
    return { slug, excerpt, paragraphs: paragraphs.length };
  } catch (err) {
    blogState.status = "error";
    blogState.message = err.message;
    bLog(`✗ Error: ${err.message}`);
    throw err;
  } finally {
    pipelineLock.blog = false;
  }
}

function compileBlogsSync() {
  if (pipelineLock.blog) throw new Error("Blog pipeline is already running.");
  pipelineLock.blog = true;
  blogState.status = "compiling";
  blogState.message = "Compiling blogs...";

  try {
    bLog("Running build-blogs.cjs...");
    const out = execSync("node build-blogs.cjs", { cwd: ROOT, encoding: "utf8" });
    bLog(out.trim());
    blogState.status = "done";
    blogState.message = "Blogs compiled to blogData.ts";
  } catch (err) {
    blogState.status = "error";
    blogState.message = err.message;
    bLog(`✗ Compile error: ${err.message}`);
    throw err;
  } finally {
    pipelineLock.blog = false;
  }
}

function listBlogs() {
  if (!fs.existsSync(BLOGS_DIR)) return [];
  return fs.readdirSync(BLOGS_DIR)
    .filter(f => f.endsWith(".md") && !f.includes(".backup-"))
    .sort()
    .map(f => {
      const raw = fs.readFileSync(path.join(BLOGS_DIR, f), "utf8");
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let title = path.basename(f, ".md"), date = "", tags = [];
      if (m) {
        const tl = m[1].match(/title:\s*"?([^"\n]+)"?/);
        const dl = m[1].match(/date:\s*"?([^"\n]+)"?/);
        const tagl = m[1].match(/tags:\s*(\[.+\])/);
        if (tl) title = tl[1].trim();
        if (dl) date = dl[1].trim();
        if (tagl) try { tags = JSON.parse(tagl[1]); } catch {}
      }
      const words = raw.split(/\s+/).length;
      return { slug: path.basename(f, ".md"), title, date, tags, readTime: `${Math.max(1, Math.ceil(words / 200))} min`, file: f };
    });
}

// ═══════════════════════════════════════════════════════════════════
//  HTML UI
// ═══════════════════════════════════════════════════════════════════
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Dashboard — yourfiyan.me</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>

  <!-- FOUC prevention — set theme class synchronously -->
  <script>
    (function(){
      var s = localStorage.getItem('dash_theme');
      if (s === 'light') { document.documentElement.classList.remove('dark'); }
      else if (s === 'dark') { /* already has class */ }
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>

  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    /* ═══ Design Tokens — Dark (default) ═══ */
    :root{
      --bg:#020617;
      --surface:rgba(30,41,59,.5);
      --card:rgba(15,23,42,.7);
      --card-hover:rgba(15,23,42,.85);
      --border:rgba(255,255,255,.08);
      --border-hover:rgba(255,255,255,.16);
      --text:#e2e8f0;
      --text-heading:#ffffff;
      --text-muted:#64748b;
      --text-dim:#475569;
      --input-bg:rgba(0,0,0,.3);
      --log-bg:rgba(0,0,0,.35);
      --blog-item-bg:rgba(0,0,0,.2);
      --blog-item-hover:rgba(0,0,0,.35);
      --primary:#6366f1;
      --primary-hover:#818cf8;
      --primary-glow:rgba(99,102,241,.35);
      --secondary:#06b6d4;
      --success:#22c55e;
      --danger:#ef4444;
      --warn:#eab308;
      --radius:16px;
      --radius-sm:12px;
      --radius-xs:8px;
      --shadow-card:0 4px 30px rgba(0,0,0,.2);
      --shadow-btn:0 4px 12px rgba(0,0,0,.3);
      --blob-opacity:.18;
      --blob-blend:screen;
      --scrollbar-thumb:#334155;
      --scrollbar-hover:#475569;
    }
    /* ═══ Design Tokens — Light ═══ */
    :root:not(.dark){
      --bg:#f8fafc;
      --surface:rgba(241,245,249,.8);
      --card:rgba(255,255,255,.75);
      --card-hover:rgba(255,255,255,.9);
      --border:rgba(0,0,0,.08);
      --border-hover:rgba(0,0,0,.15);
      --text:#334155;
      --text-heading:#0f172a;
      --text-muted:#64748b;
      --text-dim:#94a3b8;
      --input-bg:rgba(255,255,255,.8);
      --log-bg:rgba(0,0,0,.03);
      --blog-item-bg:rgba(0,0,0,.02);
      --blog-item-hover:rgba(0,0,0,.05);
      --primary:#6366f1;
      --primary-hover:#4f46e5;
      --primary-glow:rgba(99,102,241,.2);
      --secondary:#06b6d4;
      --success:#16a34a;
      --danger:#dc2626;
      --warn:#ca8a04;
      --shadow-card:0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
      --shadow-btn:0 1px 3px rgba(0,0,0,.08);
      --blob-opacity:.06;
      --blob-blend:multiply;
      --scrollbar-thumb:#cbd5e1;
      --scrollbar-hover:#94a3b8;
    }

    body{
      font-family:'Inter',system-ui,-apple-system,sans-serif;
      background:var(--bg);color:var(--text);
      min-height:100vh;overflow-x:hidden;
      -webkit-font-smoothing:antialiased;
    }

    /* ── Smooth theme transition ── */
    .theme-transitioning,
    .theme-transitioning *,
    .theme-transitioning *::before,
    .theme-transitioning *::after{
      transition:background-color 300ms ease, color 300ms ease, border-color 300ms ease,
                 box-shadow 300ms ease, fill 300ms ease, stroke 300ms ease, opacity 300ms ease !important;
    }

    /* ── Custom scrollbar ── */
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:var(--scrollbar-hover)}

    /* ── Animated blobs (matches portfolio) ── */
    .bg-glow{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
    .bg-glow .blob{position:absolute;border-radius:50%;filter:blur(120px);mix-blend-mode:var(--blob-blend);opacity:var(--blob-opacity)}
    .bg-glow .b1{width:500px;height:500px;background:var(--primary);top:-10%;left:-10%;animation:blob 7s infinite}
    .bg-glow .b2{width:400px;height:400px;background:var(--secondary);top:20%;right:-10%;animation:blob 7s infinite 2s}
    .bg-glow .b3{width:350px;height:350px;background:#a855f7;bottom:-5%;left:40%;animation:blob 7s infinite 4s}
    @keyframes blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(.9)}}

    /* ── Grid overlay ── */
    .grid-overlay{
      position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);
      background-size:64px 64px;
    }
    :root:not(.dark) .grid-overlay{
      background-image:linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px);
    }

    /* ── Layout ── */
    .app{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:2.5rem 2rem 4rem}
    @media(max-width:640px){.app{padding:1.5rem 1rem 3rem}}

    /* ── Header ── */
    .header{display:flex;align-items:center;gap:1rem;margin-bottom:2.25rem;flex-wrap:wrap}
    .header h1{font-size:1.6rem;font-weight:800;color:var(--text-heading);letter-spacing:-.02em}
    .header h1 span{background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .header .badge{
      font-size:.58rem;padding:4px 12px;border-radius:20px;
      background:rgba(99,102,241,.12);color:var(--primary);
      border:1px solid rgba(99,102,241,.2);font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    }
    .header .spacer{flex:1}

    /* Theme toggle button */
    .theme-toggle{
      width:36px;height:36px;border-radius:var(--radius-xs);
      display:flex;align-items:center;justify-content:center;
      background:var(--card);border:1px solid var(--border);
      cursor:pointer;color:var(--text-muted);
      transition:all .2s;flex-shrink:0;
    }
    .theme-toggle:hover{border-color:var(--border-hover);color:var(--text-heading);box-shadow:var(--shadow-btn)}
    .theme-toggle svg{width:16px;height:16px}

    .token-group{display:flex;align-items:center;gap:8px}
    .token-group label{font-size:.65rem;color:var(--text-dim);font-weight:500}
    .token-input{
      width:180px;padding:7px 12px;border-radius:var(--radius-xs);
      background:var(--input-bg);border:1px solid var(--border);
      color:var(--text);font-size:.72rem;font-family:inherit;outline:none;
      transition:border-color .2s, box-shadow .2s;
    }
    .token-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
    .token-input::placeholder{color:var(--text-dim)}

    /* ── Tabs ── */
    .tabs{display:flex;gap:4px;margin-bottom:2rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:4px;width:fit-content}
    .tab{
      padding:9px 24px;border-radius:var(--radius-xs);font-size:.8rem;font-weight:600;
      cursor:pointer;border:none;background:transparent;color:var(--text-muted);
      transition:all .2s;font-family:inherit;
    }
    .tab:hover{color:var(--text)}
    .tab.active{background:var(--primary);color:#fff;box-shadow:0 2px 12px var(--primary-glow)}
    .panel{display:none}.panel.active{display:block}

    /* ── Bento Grid ── */
    .bento{display:grid;gap:1.25rem}
    .bento-blog{grid-template-columns:1fr 1fr;grid-template-rows:auto}
    .bento-deploy{grid-template-columns:repeat(4,1fr);grid-template-rows:auto}
    @media(max-width:900px){.bento-blog,.bento-deploy{grid-template-columns:1fr}}

    /* ── Card ── */
    .card{
      background:var(--card);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
      border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;
      transition:border-color .25s, box-shadow .25s, background .25s;
    }
    .card:hover{border-color:var(--border-hover);box-shadow:var(--shadow-card);background:var(--card-hover)}
    .card-header{display:flex;align-items:center;gap:10px;margin-bottom:1rem}
    .card-header .icon{
      width:36px;height:36px;border-radius:var(--radius-xs);
      display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;
    }
    .card-header h3{font-size:.88rem;font-weight:700;color:var(--text-heading)}
    .card-header .tag{margin-left:auto;font-size:.62rem;padding:3px 10px;border-radius:12px;font-weight:600}

    /* ── Span utilities ── */
    .span-full{grid-column:1/-1}

    /* ── Draft Editor ── */
    .draft-textarea{
      width:100%;min-height:340px;background:var(--input-bg);border:1px solid var(--border);
      border-radius:var(--radius-sm);padding:1.15rem;
      font-family:'SF Mono','Cascadia Code','Fira Code','JetBrains Mono',monospace;
      font-size:.8rem;line-height:1.75;color:var(--text);
      resize:vertical;outline:none;transition:border-color .2s, box-shadow .2s;
    }
    .draft-textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(99,102,241,.12)}
    .draft-textarea::placeholder{color:var(--text-dim)}

    /* ── Controls ── */
    .controls{display:flex;gap:.85rem;flex-wrap:wrap;align-items:center}

    /* ── Button ── */
    .btn{
      display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:var(--radius-xs);
      font-size:.78rem;font-weight:600;cursor:pointer;border:1px solid var(--border);
      background:var(--card);color:var(--text);transition:all .2s;font-family:inherit;
      white-space:nowrap;
    }
    .btn:hover{border-color:var(--border-hover);transform:translateY(-1px);box-shadow:var(--shadow-btn)}
    .btn:active{transform:translateY(0)}
    .btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;box-shadow:none!important}
    .btn-primary{background:var(--primary);border-color:var(--primary);color:#fff}
    .btn-primary:hover{background:var(--primary-hover);border-color:var(--primary-hover);box-shadow:0 4px 16px var(--primary-glow)}
    .btn-success{background:var(--success);border-color:var(--success);color:#fff}
    .btn-success:hover{background:#16a34a;border-color:#16a34a}
    .btn-warn{border-color:var(--warn);color:var(--warn)}
    .btn-warn:hover{background:var(--warn);color:#000}
    .btn-danger{border-color:var(--danger);color:var(--danger)}
    .btn-danger:hover{background:var(--danger);color:#fff}
    .btn-sm{padding:7px 14px;font-size:.72rem}

    /* ── Status Dot ── */
    .dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}
    .dot-idle{background:var(--text-dim)}
    .dot-success{background:var(--success);box-shadow:0 0 8px var(--success)}
    .dot-error{background:var(--danger);box-shadow:0 0 8px var(--danger)}
    .dot-working{background:var(--warn);box-shadow:0 0 8px var(--warn);animation:pulse 1s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

    /* ── Blog list ── */
    .blog-list{list-style:none;display:flex;flex-direction:column;gap:.5rem;max-height:340px;overflow-y:auto;padding-right:4px}
    .blog-list::-webkit-scrollbar{width:4px}
    .blog-list::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:2px}
    .blog-item{
      display:flex;align-items:center;gap:.75rem;padding:.7rem .9rem;
      border-radius:var(--radius-xs);background:var(--blog-item-bg);border:1px solid transparent;
      transition:all .2s;
    }
    .blog-item:hover{border-color:var(--border);background:var(--blog-item-hover)}
    .blog-item .title{font-size:.78rem;font-weight:500;color:var(--text-heading);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .blog-item .meta{font-size:.62rem;color:var(--text-dim);white-space:nowrap}
    .tag-pill{
      font-size:.58rem;padding:2px 8px;border-radius:8px;
      background:rgba(99,102,241,.1);color:var(--primary);
      border:1px solid rgba(99,102,241,.18);white-space:nowrap;font-weight:500;
    }

    /* ── Log box ── */
    .log-box{
      background:var(--log-bg);border:1px solid var(--border);border-radius:var(--radius-sm);
      padding:1rem;max-height:320px;overflow-y:auto;
      font-family:'SF Mono','Cascadia Code','Fira Code','JetBrains Mono',monospace;
      font-size:.72rem;line-height:1.85;white-space:pre-wrap;word-break:break-all;
    }
    .log-box::-webkit-scrollbar{width:4px}
    .log-box::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:2px}
    .log-ok{color:var(--success)}.log-fail{color:var(--danger)}.log-info{color:var(--secondary)}.log-warn{color:var(--warn)}.log-muted{color:var(--text-dim)}

    /* ── Progress ── */
    .progress-bg{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:.6rem}
    .progress-fill{
      height:100%;border-radius:3px;transition:width .3s;width:0%;
      background:linear-gradient(90deg,var(--primary),var(--secondary));
      background-size:200% 100%;
      animation:shimmer 2s ease infinite;
    }
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .progress-label{font-size:.65rem;color:var(--text-dim);margin-top:.4rem}

    /* ── Deploy stat cards ── */
    .stat-val{font-size:1.15rem;font-weight:700;color:var(--text-heading);display:flex;align-items:center;gap:6px}
    .stat-label{font-size:.62rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;font-weight:500}

    /* ── Toast ── */
    .toast{
      position:fixed;bottom:2rem;right:2rem;padding:13px 24px;border-radius:var(--radius-sm);
      font-size:.78rem;font-weight:600;z-index:100;
      transform:translateY(100px);opacity:0;transition:all .35s cubic-bezier(.4,0,.2,1);
      backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);
      box-shadow:0 8px 32px rgba(0,0,0,.15);
    }
    .toast.show{transform:translateY(0);opacity:1}
    .toast.success{background:rgba(34,197,94,.9);color:#fff}
    .toast.error{background:rgba(239,68,68,.9);color:#fff}
    .toast.info{background:rgba(99,102,241,.9);color:#fff}

    /* ── Empty state ── */
    .empty{text-align:center;padding:2.5rem 1.5rem;color:var(--text-dim);font-size:.78rem;line-height:1.6}

    /* ── Divider ── */
    .divider{height:1px;background:var(--border);margin:.75rem 0}

    /* ── Section subtitle ── */
    .section-sub{font-size:.68rem;color:var(--text-dim);margin-bottom:.75rem;font-weight:500}
  </style>
</head>
<body>
  <div class="bg-glow"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
  <div class="grid-overlay"></div>

  <div class="app">
    <!-- ═══ Header ═══ -->
    <div class="header">
      <h1><span>yourfiyan</span>.me</h1>
      <span class="badge">DASHBOARD v2.0</span>
      <div class="spacer"></div>
      <div class="token-group">
        <label>🔒 Token</label>
        <input type="password" class="token-input" id="auth-token" placeholder="DASHBOARD_TOKEN" />
      </div>
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme">
        <!-- Sun icon (shown in dark mode) -->
        <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <!-- Moon icon (shown in light mode) -->
        <svg id="icon-moon" style="display:none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0112.001 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.296 2.783-7.943 6.648-9.252a.75.75 0 01.918.884 8.25 8.25 0 0011.05 11.05.75.75 0 01.884.918z"/>
        </svg>
      </button>
    </div>

    <!-- ═══ Tabs ═══ -->
    <div class="tabs">
      <button class="tab active" onclick="switchTab('blog')">✍️ Blog Studio</button>
      <button class="tab" onclick="switchTab('deploy')">🚀 Deploy</button>
    </div>

    <!-- ═══════════════════ BLOG PANEL ═══════════════════ -->
    <div class="panel active" id="panel-blog">
      <div class="bento bento-blog">

        <!-- Draft Editor (full width) -->
        <div class="card span-full">
          <div class="card-header">
            <div class="icon" style="background:rgba(99,102,241,.12);color:var(--primary)">📝</div>
            <h3>Blog Draft</h3>
            <span class="tag" id="draft-status" style="background:rgba(100,116,139,.12);color:var(--text-dim)">Loading...</span>
          </div>
          <textarea class="draft-textarea" id="draft-text" placeholder="Loading draft template..."></textarea>
        </div>

        <!-- Action Buttons (full width) -->
        <div class="controls span-full">
          <button class="btn btn-primary" id="btn-save" onclick="saveDraft()">💾 Save Draft</button>
          <button class="btn btn-success" id="btn-generate" onclick="generateBlog()">✨ Generate with AI</button>
          <button class="btn" id="btn-compile" onclick="compileBlog()">📦 Compile Blogs</button>
          <button class="btn btn-warn" id="btn-buildDeploy" onclick="buildAndDeploy()">🚀 Build & Deploy</button>
        </div>

        <!-- Blog List -->
        <div class="card">
          <div class="card-header">
            <div class="icon" style="background:rgba(6,182,212,.12);color:var(--secondary)">📚</div>
            <h3>Published Posts</h3>
            <span class="tag" id="post-count" style="background:rgba(6,182,212,.12);color:var(--secondary)">0</span>
          </div>
          <ul class="blog-list" id="blog-list"><li class="empty">Loading...</li></ul>
        </div>

        <!-- Blog Log -->
        <div class="card">
          <div class="card-header">
            <div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)">📋</div>
            <h3>Generation Log</h3>
            <span id="blog-status-dot" class="dot dot-idle"></span>
          </div>
          <div class="log-box" id="blog-log"><span class="log-muted">Ready. Fill in the draft and click "Generate with AI".</span></div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════ DEPLOY PANEL ═══════════════════ -->
    <div class="panel" id="panel-deploy">
      <div class="bento bento-deploy">

        <!-- 4 status cards -->
        <div class="card">
          <div class="stat-label">Status</div>
          <div class="stat-val" id="d-status"><span class="dot dot-idle"></span> Idle</div>
        </div>
        <div class="card">
          <div class="stat-label">Last Push</div>
          <div class="stat-val" id="d-last" style="font-size:.9rem">Never</div>
        </div>
        <div class="card">
          <div class="stat-label">GitHub Actions</div>
          <div class="stat-val" id="d-gh-status"><span class="dot dot-idle"></span> Idle</div>
        </div>
        <div class="card">
          <div class="stat-label">Progress</div>
          <div class="stat-val" id="d-files">—</div>
        </div>

        <!-- Primary deploy buttons -->
        <div class="controls span-full">
          <button class="btn btn-primary" id="btn-d-deploy" onclick="doGitHubDeploy()">🚀 Push & Deploy to GitHub Pages</button>
          <button class="btn btn-danger" id="btn-d-cancel" onclick="doCancelGitHub()" style="display:none">⛔ Cancel</button>
          <button class="btn" onclick="toggleAdvancedFtp()" id="btn-adv-toggle" style="margin-left:auto;font-size:.7rem;opacity:.6">⚙️ Advanced (FTP)</button>
        </div>

        <!-- Advanced FTP section (hidden by default) -->
        <div class="card span-full" id="adv-ftp-section" style="display:none">
          <div class="card-header">
            <div class="icon" style="background:rgba(234,179,8,.12);color:var(--warn)">🔌</div>
            <h3>FTP Fallback</h3>
            <span class="tag" style="background:rgba(100,116,139,.12);color:var(--text-dim);margin-left:auto;font-size:.62rem">ADVANCED</span>
          </div>
          <p style="font-size:.72rem;color:var(--text-dim);margin-bottom:1rem">Fallback: build locally and upload to <strong>yourfiyan.me</strong> via FTP.</p>
          <div class="controls">
            <button class="btn btn-warn" id="btn-d-ftp-deploy" onclick="doDeploy()">🏗️ Build & Upload to FTP</button>
            <button class="btn" id="btn-d-upload" onclick="doUpload()">📤 Upload Only (FTP)</button>
            <button class="btn" id="btn-d-ftp-test" onclick="doFtpCheck()">🔌 Test FTP</button>
          </div>
          <div style="margin-top:.75rem;font-size:.72rem;color:var(--text-dim)" id="d-ftp"><span class="dot dot-idle"></span> Not checked</div>
        </div>

        <!-- Progress -->
        <div class="card span-full">
          <div class="card-header">
            <div class="icon" style="background:rgba(99,102,241,.12);color:var(--primary)">📊</div>
            <h3>Deploy Progress</h3>
          </div>
          <div class="progress-bg"><div class="progress-fill" id="d-progress"></div></div>
          <div class="progress-label" id="d-progress-text">Waiting...</div>
        </div>

        <!-- Deploy log -->
        <div class="card span-full">
          <div class="card-header">
            <div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)">📋</div>
            <h3>Deploy Log</h3>
          </div>
          <div class="log-box" id="deploy-log"><span class="log-muted">Waiting for action...</span></div>
        </div>

        <!-- GitHub Actions link -->
        <div class="card span-full">
          <div class="card-header">
            <div class="icon" style="background:rgba(99,102,241,.12);color:var(--primary)">🔗</div>
            <h3>GitHub Actions</h3>
          </div>
          <p style="font-size:.75rem;color:var(--text-muted);margin-bottom:.75rem">After pushing, the build runs automatically in the cloud. Watch live progress here:</p>
          <a href="https://github.com/yourfiyan/yourfiyan.github.io/actions" target="_blank"
             style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;background:var(--primary);color:#fff;font-size:.76rem;font-weight:600;text-decoration:none;transition:background .2s"
             onmouseover="this.style.background='var(--primary-hover)'" onmouseout="this.style.background='var(--primary)'">
            📡 View Actions Runs
          </a>
          &nbsp;
          <a href="https://yourfiyan.github.io" target="_blank"
             style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;background:var(--card);border:1px solid var(--border);color:var(--text);font-size:.76rem;font-weight:600;text-decoration:none;transition:all .2s"
             onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
            🌐 yourfiyan.github.io
          </a>
        </div>

      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

<script>
// ══════════════════════════ THEME ══════════════════════════
function isDark() { return document.documentElement.classList.contains('dark'); }

function applyThemeIcons() {
  document.getElementById('icon-sun').style.display  = isDark() ? 'block' : 'none';
  document.getElementById('icon-moon').style.display = isDark() ? 'none'  : 'block';
}

document.getElementById('theme-toggle').addEventListener('click', function() {
  var root = document.documentElement;
  root.classList.add('theme-transitioning');
  root.classList.toggle('dark');
  localStorage.setItem('dash_theme', isDark() ? 'dark' : 'light');
  applyThemeIcons();
  setTimeout(function(){ root.classList.remove('theme-transitioning'); }, 350);
});

applyThemeIcons();

// ══════════════════════════ AUTH ══════════════════════════
const tokenInput = document.getElementById('auth-token');
tokenInput.value = localStorage.getItem('dash_token') || '';
tokenInput.addEventListener('input', () => localStorage.setItem('dash_token', tokenInput.value));

function authHeaders() {
  const token = tokenInput.value.trim();
  const h = { 'Content-Type': 'text/plain' };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}
function authHeadersJSON() {
  const h = authHeaders();
  h['Content-Type'] = 'application/json';
  return h;
}

// ── Tab switching ──
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.tab[onclick*="'+tab+'"]').classList.add('active');
  document.getElementById('panel-'+tab).classList.add('active');
  if (tab === 'deploy') fetchDeployStatus();
}

// ── Toast ──
let toastTimer;
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || 'info');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = 'toast', 3000);
}

// ── Helpers ──
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function timeAgo(iso) {
  if (!iso) return 'Never';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d/60000);
  if (m < 1) return 'Just now'; if (m < 60) return m+'m ago';
  const h = Math.floor(m/60); if (h < 24) return h+'h ago';
  return Math.floor(h/24)+'d ago';
}
function colorLog(lines, el) {
  el.innerHTML = lines.map(l => {
    let cls = 'log-muted';
    if (/[✓]|success|compiled|Saved/.test(l)) cls = 'log-ok';
    else if (/[✗]|Error|FAILED|failed|error/i.test(l)) cls = 'log-fail';
    else if (/[⚠]|Warning|collision|Retry|retry/i.test(l)) cls = 'log-warn';
    else if (/Gemini|Sending|Connect|Build|Start|Running|Reconnect/i.test(l)) cls = 'log-info';
    return '<div class="'+cls+'">'+esc(l)+'</div>';
  }).join('');
  el.scrollTop = el.scrollHeight;
}

// ══════════════════════════ BLOG TAB ══════════════════════════

async function loadDraft() {
  try {
    const res = await fetch('/api/draft');
    if (!res.ok) throw new Error('Not found');
    const text = await res.text();
    document.getElementById('draft-text').value = text;
    document.getElementById('draft-status').textContent = 'Loaded';
    document.getElementById('draft-status').style.cssText = 'background:rgba(34,197,94,.12);color:var(--success)';
  } catch(e) {
    document.getElementById('draft-status').textContent = 'Error';
    document.getElementById('draft-status').style.cssText = 'background:rgba(239,68,68,.12);color:var(--danger)';
  }
}

async function saveDraft() {
  const text = document.getElementById('draft-text').value;
  try {
    const res = await fetch('/api/draft', { method:'POST', headers:authHeaders(), body:text });
    if (res.status === 401) { toast('Unauthorized — check your token', 'error'); return; }
    toast('Draft saved', 'success');
    document.getElementById('draft-status').textContent = 'Saved';
    document.getElementById('draft-status').style.cssText = 'background:rgba(34,197,94,.12);color:var(--success)';
  } catch(e) { toast('Save failed', 'error'); }
}

async function generateBlog() {
  await saveDraft();
  const btn = document.getElementById('btn-generate');
  btn.disabled = true; btn.textContent = '⏳ Generating...';
  document.getElementById('blog-status-dot').className = 'dot dot-working';
  try {
    const res = await fetch('/api/blog/generate', { method:'POST', headers:authHeaders() });
    if (res.status === 401) { toast('Unauthorized — check your token', 'error'); return; }
    if (res.status === 409) { toast('Generation already running', 'info'); return; }
    const d = await res.json();
    if (!d.ok) throw new Error(d.error);
    toast('Blog generated: ' + d.slug, 'success');
    loadBlogs();
  } catch(e) {
    toast(e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '✨ Generate with AI';
    pollBlogStatus();
  }
}

async function compileBlog() {
  const btn = document.getElementById('btn-compile');
  btn.disabled = true; btn.textContent = '⏳ Compiling...';
  try {
    const res = await fetch('/api/blog/compile', { method:'POST', headers:authHeaders() });
    if (res.status === 401) { toast('Unauthorized — check your token', 'error'); return; }
    if (res.status === 409) { toast('Blog pipeline busy', 'info'); return; }
    const d = await res.json();
    if (!d.ok) throw new Error(d.error);
    toast('Blogs compiled to blogData.ts', 'success');
  } catch(e) { toast(e.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = '📦 Compile Blogs'; pollBlogStatus(); }
}

async function buildAndDeploy() {
  const btn = document.getElementById('btn-buildDeploy');
  btn.disabled = true; btn.textContent = '⏳ Compiling...';
  try {
    const r1 = await fetch('/api/blog/compile', { method:'POST', headers:authHeaders() });
    if (r1.status === 401) { toast('Unauthorized', 'error'); return; }
    btn.textContent = '⏳ Deploying...';
    switchTab('deploy'); doGitHubDeploy();
  } catch(e) { toast(e.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = '🚀 Build & Deploy'; }
}

async function loadBlogs() {
  try {
    const res = await fetch('/api/blogs');
    const blogs = await res.json();
    const list = document.getElementById('blog-list');
    document.getElementById('post-count').textContent = blogs.length;
    if (blogs.length === 0) {
      list.innerHTML = '<li class="empty">No posts yet. Write a draft and generate!</li>';
      return;
    }
    list.innerHTML = blogs.map(b =>
      '<li class="blog-item">' +
        '<span class="title">' + esc(b.title) + '</span>' +
        b.tags.slice(0,2).map(t => '<span class="tag-pill">'+esc(t)+'</span>').join('') +
        '<span class="meta">' + esc(b.date||'') + ' &middot; ' + esc(b.readTime) + '</span>' +
      '</li>'
    ).join('');
  } catch(e) {}
}

async function pollBlogStatus() {
  try {
    const res = await fetch('/api/blog/status');
    const d = await res.json();
    const dot = document.getElementById('blog-status-dot');
    dot.className = 'dot dot-' + (
      d.status === 'generating' || d.status === 'compiling' ? 'working' :
      d.status === 'error' ? 'error' :
      d.status === 'done' ? 'success' : 'idle'
    );
    if (d.log.length > 0) colorLog(d.log, document.getElementById('blog-log'));
  } catch(e) {}
}

// ══════════════════════════ DEPLOY TAB ══════════════════════════

let deployPolling = null;
function startDeployPoll() { if (!deployPolling) deployPolling = setInterval(fetchDeployStatus, 1500); }
function stopDeployPoll() { if (deployPolling) { clearInterval(deployPolling); deployPolling = null; } }

function setDeployBtns(d) {
  const dep = document.getElementById('btn-d-deploy'); if (dep) dep.disabled = d;
  const upl = document.getElementById('btn-d-upload'); if (upl) upl.disabled = d;
  const ftpDep = document.getElementById('btn-d-ftp-deploy'); if (ftpDep) ftpDep.disabled = d;
  document.getElementById('btn-d-cancel').style.display = d ? 'inline-flex' : 'none';
}
function toggleAdvancedFtp() {
  const s = document.getElementById('adv-ftp-section');
  const b = document.getElementById('btn-adv-toggle');
  const visible = s.style.display !== 'none';
  s.style.display = visible ? 'none' : 'block';
  b.style.opacity = visible ? '.6' : '1';
  if (!visible) doFtpCheck();
}

async function fetchDeployStatus() {
  try {
    const res = await fetch('/api/status');
    const d = await res.json();

    // Status dot
    const dc = d.lastStatus==='success'?'success':(d.lastStatus==='failed'||d.lastStatus==='cancelled')?'error':d.isRunning?'working':'idle';
    const label = (d.lastStatus||'idle'); const cap = label.charAt(0).toUpperCase()+label.slice(1);
    document.getElementById('d-status').innerHTML = '<span class="dot dot-'+dc+'"></span> '+cap;

    // Last deploy
    document.getElementById('d-last').textContent = timeAgo(d.lastDeploy);

    // FTP (advanced panel, if visible)
    if (d.ftp) {
      const fc = d.ftp.connected ? 'success' : d.ftp.connected === null ? 'working' : 'error';
      const fl = d.ftp.connected ? 'Connected' : d.ftp.connected === null ? 'Busy' : 'Offline';
      const ftpEl = document.getElementById('d-ftp');
      if (ftpEl) ftpEl.innerHTML = '<span class="dot dot-'+fc+'"></span> '+fl;
    }

    // Files
    document.getElementById('d-files').textContent = d.filesUploaded + ' / ' + d.totalFiles;

    // Progress
    if (d.totalFiles > 0) {
      const pct = Math.round((d.filesUploaded/d.totalFiles)*100);
      document.getElementById('d-progress').style.width = pct+'%';
      document.getElementById('d-progress-text').textContent = d.currentFile ? 'Uploading: '+d.currentFile+' ('+pct+'%)' : pct+'% complete';
    } else {
      document.getElementById('d-progress-text').textContent = d.isRunning ? 'Building...' : 'Waiting...';
    }

    // Log
    if (d.log?.length > 0) colorLog(d.log, document.getElementById('deploy-log'));

    // Auto-stop polling
    if (!d.isRunning && (d.lastStatus==='success'||d.lastStatus==='failed'||d.lastStatus==='cancelled')) { stopDeployPoll(); setDeployBtns(false); }
  } catch(e) {}
}

async function doGitHubDeploy() {
  setDeployBtns(true);
  const logEl = document.getElementById('deploy-log');
  logEl.innerHTML = '<div class="log-info">Committing and pushing to GitHub...</div>';
  document.getElementById('d-progress').style.width = '5%';
  document.getElementById('d-gh-status').innerHTML = '<span class="dot dot-working"></span> Pushing...';
  try {
    const res = await fetch('/api/deploy/github', { method:'POST', headers:authHeaders() });
    if (res.status === 401) { toast('Unauthorized — check your token', 'error'); setDeployBtns(false); return; }
    if (res.status === 409) { toast('GitHub deploy already running', 'info'); setDeployBtns(false); return; }
    const d = await res.json();
    if (!d.ok) { toast(d.error, 'error'); setDeployBtns(false); return; }
    toast('Pushing to GitHub…', 'info');
    pollGitHubStatus();
  } catch(e) { toast(e.message, 'error'); setDeployBtns(false); }
}

function doCancelGitHub() { toast('Cannot cancel a git push once started', 'info'); }

let ghPollTimer = null;
function pollGitHubStatus() {
  if (ghPollTimer) clearInterval(ghPollTimer);
  ghPollTimer = setInterval(async () => {
    try {
      const res = await fetch('/api/status/github');
      const d = await res.json();
      const el = document.getElementById('d-gh-status');
      if (d.log && d.log.length) colorLog(d.log, document.getElementById('deploy-log'));
      if (d.lastStatus === 'success') {
        el.innerHTML = '<span class="dot dot-success"></span> Pushed ✓';
        document.getElementById('d-last').textContent = timeAgo(d.lastPush);
        document.getElementById('d-progress').style.width = '100%';
        clearInterval(ghPollTimer); ghPollTimer = null;
        setDeployBtns(false);
        toast('✓ Pushed! GitHub Actions is now building your site.', 'success');
      } else if (d.lastStatus === 'failed') {
        el.innerHTML = '<span class="dot dot-error"></span> Failed';
        clearInterval(ghPollTimer); ghPollTimer = null;
        setDeployBtns(false);
        toast('Push failed: ' + (d.lastError || 'unknown error'), 'error');
      }
    } catch(e) {}
  }, 1500);
}

async function doDeploy() {
  setDeployBtns(true);
  document.getElementById('deploy-log').innerHTML = '<div class="log-info">Starting build + deploy...</div>';
  document.getElementById('d-progress').style.width = '0%';
  startDeployPoll();
  try {
    const res = await fetch('/api/deploy', { method:'POST', headers:authHeaders() });
    if (res.status === 401) { toast('Unauthorized — check your token', 'error'); setDeployBtns(false); stopDeployPoll(); return; }
    if (res.status === 409) { toast('Deploy already running', 'info'); setDeployBtns(false); stopDeployPoll(); return; }
    const d = await res.json();
    if (!d.ok) { toast(d.error, 'error'); setDeployBtns(false); stopDeployPoll(); }
  } catch(e) { toast(e.message, 'error'); setDeployBtns(false); stopDeployPoll(); }
}

async function doUpload() {
  setDeployBtns(true);
  document.getElementById('deploy-log').innerHTML = '<div class="log-info">Starting upload (skip build)...</div>';
  document.getElementById('d-progress').style.width = '0%';
  startDeployPoll();
  try {
    const res = await fetch('/api/upload', { method:'POST', headers:authHeaders() });
    if (res.status === 401) { toast('Unauthorized', 'error'); setDeployBtns(false); stopDeployPoll(); return; }
    if (res.status === 409) { toast('Deploy already running', 'info'); setDeployBtns(false); stopDeployPoll(); return; }
    const d = await res.json();
    if (!d.ok) { toast(d.error, 'error'); setDeployBtns(false); stopDeployPoll(); }
  } catch(e) { toast(e.message, 'error'); setDeployBtns(false); stopDeployPoll(); }
}

async function doCancel() {
  try {
    const res = await fetch('/api/cancel', { method:'POST', headers:authHeaders() });
    if (res.status === 401) { toast('Unauthorized', 'error'); return; }
    const d = await res.json();
    if (d.ok) toast('Cancel requested — stopping...', 'info');
    else toast(d.error, 'error');
  } catch(e) { toast(e.message, 'error'); }
}

async function doFtpCheck() {
  const el = document.getElementById('d-ftp');
  el.innerHTML = '<span class="dot dot-working"></span> Testing...';
  try {
    const res = await fetch('/api/status');
    const d = await res.json();
    if (d.ftp?.connected) {
      el.innerHTML = '<span class="dot dot-success"></span> Connected';
      toast('FTP connection OK', 'success');
    } else {
      el.innerHTML = '<span class="dot dot-error"></span> Failed';
      toast('FTP: ' + (d.ftp?.error || 'Connection failed'), 'error');
    }
  } catch(e) { el.innerHTML = '<span class="dot dot-error"></span> Error'; }
}

// ── Init ──
loadDraft();
loadBlogs();
fetchDeployStatus();
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════
//  HTTP SERVER
// ═══════════════════════════════════════════════════════════════════
function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", c => data += c);
    req.on("end", () => resolve(data));
  });
}

function jsonRes(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });
    return res.end();
  }

  const url = req.url.split("?")[0];

  // ─────── UI ───────
  if (req.method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(getHTML());
  }

  // ─────── Blog: read draft ───────
  if (req.method === "GET" && url === "/api/draft") {
    try {
      const text = fs.readFileSync(DRAFT_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" });
      return res.end(text);
    } catch {
      return jsonRes(res, 404, { ok: false, error: "blog-draft.md not found" });
    }
  }

  // ─────── Blog: save draft ───────
  if (req.method === "POST" && url === "/api/draft") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    const body = await readBody(req);
    fs.writeFileSync(DRAFT_FILE, body, "utf8");
    return jsonRes(res, 200, { ok: true });
  }

  // ─────── Blog: generate ───────
  if (req.method === "POST" && url === "/api/blog/generate") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    if (pipelineLock.blog) return jsonRes(res, 409, { ok: false, error: "Blog pipeline is already running" });
    try {
      const result = await generateBlog();
      return jsonRes(res, 200, { ok: true, ...result });
    } catch (err) {
      return jsonRes(res, 500, { ok: false, error: err.message });
    }
  }

  // ─────── Blog: compile ───────
  if (req.method === "POST" && url === "/api/blog/compile") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    if (pipelineLock.blog) return jsonRes(res, 409, { ok: false, error: "Blog pipeline is already running" });
    try {
      compileBlogsSync();
      return jsonRes(res, 200, { ok: true, message: "Compiled" });
    } catch (err) {
      return jsonRes(res, 500, { ok: false, error: err.message });
    }
  }

  // ─────── Blog: list posts ───────
  if (req.method === "GET" && url === "/api/blogs") {
    return jsonRes(res, 200, listBlogs());
  }

  // ─────── Blog: status ───────
  if (req.method === "GET" && url === "/api/blog/status") {
    return jsonRes(res, 200, blogState);
  }

  // ─────── Deploy: status ───────
  if (req.method === "GET" && url === "/api/status") {
    const ftpStatus = pipelineLock.deploy
      ? { connected: null, error: "Deploy in progress" }
      : await testFtpConnection();
    return jsonRes(res, 200, {
      ok: true,
      lastDeploy: deployState.lastDeploy,
      lastStatus: deployState.lastStatus,
      lastError: deployState.lastError,
      filesUploaded: deployState.filesUploaded,
      totalFiles: deployState.totalFiles,
      currentFile: deployState.currentFile,
      isRunning: deployState.isRunning,
      ftp: ftpStatus,
      log: deployState.log.slice(-50),
    });
  }

  // ─────── Deploy: build + upload ───────
  if (req.method === "POST" && url === "/api/deploy") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    if (pipelineLock.deploy) return jsonRes(res, 409, { ok: false, error: "Deploy already in progress" });
    jsonRes(res, 202, { ok: true, message: "Deploy started (build + upload)" });
    runDeploy(false).catch(() => {});
    return;
  }

  // ─────── Deploy: cancel ───────
  if (req.method === "POST" && url === "/api/cancel") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    if (!pipelineLock.deploy) return jsonRes(res, 400, { ok: false, error: "No deploy in progress" });
    cancelRequested = true;
    dLog("⛔ Cancel requested by user...");
    // Force-close FTP connection to break out of upload immediately
    if (activeFtpClient) {
      try { activeFtpClient.close(); } catch {}
    }
    // Kill build process if running
    if (activeBuildProcess) {
      try { activeBuildProcess.kill(); } catch {}
    }
    return jsonRes(res, 200, { ok: true, message: "Cancel requested" });
  }

  // ─────── Deploy: upload only ───────
  if (req.method === "POST" && url === "/api/upload") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    if (pipelineLock.deploy) return jsonRes(res, 409, { ok: false, error: "Deploy already in progress" });
    jsonRes(res, 202, { ok: true, message: "Upload started (skip build)" });
    runDeploy(true).catch(() => {});
    return;
  }

  // ─────── GitHub deploy: push to main → Actions builds ───────
  if (req.method === "POST" && url === "/api/deploy/github") {
    if (!checkAuth(req)) return jsonRes(res, 401, { ok: false, error: "Unauthorized" });
    if (githubDeployState.isRunning) return jsonRes(res, 409, { ok: false, error: "GitHub deploy already in progress" });
    jsonRes(res, 202, { ok: true, message: "GitHub deploy started", actionsUrl: GITHUB_ACTIONS_URL });
    runGitHubDeploy().catch(() => {});
    return;
  }

  // ─────── GitHub deploy: status ───────
  if (req.method === "GET" && url === "/api/status/github") {
    return jsonRes(res, 200, {
      ok: true,
      lastPush: githubDeployState.lastPush,
      lastStatus: githubDeployState.lastStatus,
      lastError: githubDeployState.lastError,
      isRunning: githubDeployState.isRunning,
      actionsUrl: GITHUB_ACTIONS_URL,
      log: githubDeployState.log.slice(-80),
    });
  }

  // ─────── 404 ───────
  jsonRes(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  const w = !DASHBOARD_TOKEN;
  console.log("");
  console.log("  ┌──────────────────────────────────────────────┐");
  console.log("  │                                              │");
  console.log("  │   yourfiyan.me Dashboard                     │");
  console.log("  │   http://localhost:" + PORT + "/                     │");
  console.log("  │                                              │");
  console.log("  │   Blog API                                   │");
  console.log("  │     GET  /api/draft                          │");
  console.log("  │     POST /api/draft                          │");
  console.log("  │     POST /api/blog/generate                  │");
  console.log("  │     POST /api/blog/compile                   │");
  console.log("  │     GET  /api/blogs                          │");
  console.log("  │     GET  /api/blog/status                    │");
  console.log("  │                                              │");
  console.log("  │   Deploy API (GitHub primary, FTP fallback)                                 │");
  console.log("  │     POST /api/deploy                         │");
  console.log("  │     POST /api/upload                         │");
  console.log("  │     GET  /api/status                         │");
  console.log("  │                                              │");
  if (w) {
  console.log("  │   ⚠ No DASHBOARD_TOKEN set — auth disabled  │");
  console.log("  │     Add DASHBOARD_TOKEN=<secret> to .env.local│");
  console.log("  │                                              │");
  }
  console.log("  └──────────────────────────────────────────────┘");
  console.log("");
});
