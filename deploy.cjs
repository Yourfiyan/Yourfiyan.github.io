/**
 * deploy.cjs — One-click deploy for GitHub Pages and/or FTP (InfinityFree)
 *
 * Usage:
 *   node deploy.cjs github      → build for .is-a.dev + git push
 *   node deploy.cjs ftp         → build for .me + FTP upload
 *   node deploy.cjs both        → deploy to both (GitHub first, then FTP)
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

// ── Load secrets from .env.local ──
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

const FTP_HOST = "ftpupload.net";
const FTP_USER = "if0_40152047";
const FTP_REMOTE = "/yourfiyan.me/htdocs";
const FTP_PASS = loadEnv("FTP_PASSWORD") || "";

function run(cmd, label) {
  console.log(`\n── ${label} ──`);
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function buildFor(domain) {
  const siteUrl = `https://${domain}`;
  console.log(`\n═══ Building for ${domain} (SITE_URL=${siteUrl}) ═══`);
  execSync(`npm run build`, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, SITE_URL: siteUrl },
  });
}

async function deployGitHub() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  DEPLOY → GitHub Pages (yourfiyan.is-a.dev)  ║");
  console.log("╚══════════════════════════════════════════╝");

  buildFor("yourfiyan.is-a.dev");

  // Copy the github-specific sitemap
  const ghSitemap = path.join(ROOT, "public", "sitemap-github.xml");
  if (fs.existsSync(ghSitemap)) {
    fs.copyFileSync(ghSitemap, path.join(DIST, "sitemap.xml"));
    console.log("  ✓ Copied sitemap-github.xml → dist/sitemap.xml");
  }

  run("git add -A", "Staging all changes");

  const status = execSync("git status --porcelain", { cwd: ROOT }).toString().trim();
  const ts = new Date().toISOString().replace("T", " ").slice(0, 16);
  if (status) {
    run(`git commit -m "Deploy: ${ts}"`, "Committing");
  } else {
    console.log("  Nothing new to commit — pushing existing HEAD.");
  }

  run("git push origin main", "Pushing to GitHub");
  console.log("\n  ✓ GitHub deploy done! Actions will build the site.");
  console.log(`    Watch: https://github.com/yourfiyan/yourfiyan.github.io/actions`);
}

async function deployFTP() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  DEPLOY → FTP/InfinityFree (yourfiyan.me)    ║");
  console.log("╚══════════════════════════════════════════╝");

  if (!FTP_PASS) {
    console.error("  ✗ FTP_PASSWORD not set in .env.local — aborting FTP deploy.");
    process.exit(1);
  }

  let ftp;
  try { ftp = require("basic-ftp"); } catch {
    console.error("  ✗ basic-ftp not installed. Run: npm install");
    process.exit(1);
  }

  buildFor("yourfiyan.me");

  // Collect files
  function collectFiles(dir, base) {
    base = base || dir;
    let result = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        result = result.concat(collectFiles(abs, base));
      } else {
        result.push({ absolute: abs, relative: path.relative(base, abs) });
      }
    }
    return result;
  }

  const files = collectFiles(DIST);
  console.log(`  Found ${files.length} files to upload.`);

  const client = new ftp.Client(60000);
  client.ftp.verbose = false;

  try {
    console.log(`  Connecting to ${FTP_HOST}...`);
    await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
    console.log("  ✓ FTP connected.");
    await client.ensureDir(FTP_REMOTE);

    let uploaded = 0;
    let failed = 0;
    for (const file of files) {
      const remotePath = `${FTP_REMOTE}/${file.relative}`.replace(/\\/g, "/");
      const remoteDir = path.posix.dirname(remotePath);
      let success = false;
      for (let attempt = 1; attempt <= 3 && !success; attempt++) {
        try {
          await client.ensureDir(remoteDir);
          await client.uploadFrom(file.absolute, remotePath);
          success = true;
          uploaded++;
        } catch (e) {
          if (attempt < 3) {
            console.log(`  ⟳ Retry ${attempt}/3: ${file.relative}`);
            try {
              await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
            } catch {}
          } else {
            failed++;
            console.error(`  ✗ Failed: ${file.relative} — ${e.message}`);
          }
        }
      }
      if (uploaded % 10 === 0 || uploaded === files.length) {
        console.log(`  [${uploaded}/${files.length}] uploaded...`);
      }
    }

    console.log(`\n  ✓ FTP deploy done! ${uploaded}/${files.length} files uploaded.${failed ? ` (${failed} failed)` : ""}`);
  } catch (err) {
    console.error(`  ✗ FTP deploy failed: ${err.message}`);
    process.exit(1);
  } finally {
    client.close();
  }
}

// ── Main ──
async function main() {
  const target = (process.argv[2] || "").toLowerCase();

  if (!target || !["github", "ftp", "both"].includes(target)) {
    console.log("Usage: node deploy.cjs <github|ftp|both>");
    console.log("  github  → build for .is-a.dev + git push");
    console.log("  ftp     → build for .me + FTP upload");
    console.log("  both    → deploy to both targets");
    process.exit(1);
  }

  if (target === "github" || target === "both") {
    await deployGitHub();
  }
  if (target === "ftp" || target === "both") {
    await deployFTP();
  }

  console.log("\n═══ All done! ═══");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
