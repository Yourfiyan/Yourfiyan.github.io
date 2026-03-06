/**
 * Sitemap Generator — builds sitemap.xml for both domains
 *
 * Generates two sitemaps into public/:
 *   - sitemap.xml          (for yourfiyan.me — InfinityFree/FTP)
 *   - sitemap-github.xml   (for yourfiyan.is-a.dev — GitHub Pages)
 *
 * Auto-run as part of the build pipeline (see package.json).
 * Reads blog slugs from blogs/*.md so it stays in sync.
 */

const fs = require('fs');
const path = require('path');

const BLOGS_DIR = path.join(__dirname, 'blogs');
const PUBLIC_DIR = path.join(__dirname, 'public');

const DOMAINS = {
  infinityfree: 'https://yourfiyan.me',
  github: 'https://yourfiyan.is-a.dev',
};

// Today in YYYY-MM-DD
const TODAY = new Date().toISOString().split('T')[0];

// ── Static routes with SEO metadata ─────────────────────────────
const STATIC_ROUTES = [
  { path: '/',                          priority: '1.0', changefreq: 'weekly'  },
  { path: '/projects',                  priority: '0.8', changefreq: 'monthly' },
  { path: '/projects/customer-support', priority: '0.7', changefreq: 'monthly' },
  { path: '/projects/calculatoready',   priority: '0.6', changefreq: 'monthly' },
  { path: '/projects/pocketphone',      priority: '0.6', changefreq: 'monthly' },
  { path: '/blog',                      priority: '0.9', changefreq: 'weekly'  },
  { path: '/labs',                      priority: '0.5', changefreq: 'monthly' },
  { path: '/certificates',             priority: '0.5', changefreq: 'monthly' },
  { path: '/contact',                  priority: '0.4', changefreq: 'yearly'  },
];

// ── Collect blog slugs ──────────────────────────────────────────
function getBlogSlugs() {
  if (!fs.existsSync(BLOGS_DIR)) return [];
  return fs.readdirSync(BLOGS_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('.backup-'))
    .map(f => path.basename(f, '.md'))
    .sort();
}

// ── Build XML ───────────────────────────────────────────────────
function buildSitemapXML(baseUrl) {
  const blogSlugs = getBlogSlugs();

  let urls = '';

  // Static pages
  for (const route of STATIC_ROUTES) {
    urls += `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }

  // Blog posts
  for (const slug of blogSlugs) {
    urls += `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${urls}
</urlset>
`;
}

// ── Write sitemaps ──────────────────────────────────────────────
function generate() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);

  const blogCount = getBlogSlugs().length;
  const totalUrls = STATIC_ROUTES.length + blogCount;

  // Primary: yourfiyan.me (also used by FTP/InfinityFree)
  const xmlME = buildSitemapXML(DOMAINS.infinityfree);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xmlME, 'utf8');

  // GitHub Pages: yourfiyan.is-a.dev
  const xmlGH = buildSitemapXML(DOMAINS.github);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-github.xml'), xmlGH, 'utf8');

  console.log(`\x1b[32m✓\x1b[0m sitemap.xml — ${totalUrls} URLs (${STATIC_ROUTES.length} pages + ${blogCount} blogs)`);
  console.log(`  • sitemap.xml         → ${DOMAINS.infinityfree}`);
  console.log(`  • sitemap-github.xml  → ${DOMAINS.github}`);
}

generate();
