/**
 * Blog Generator — reads blog-draft.md, calls Gemini AI, saves to blogs/
 *
 * Usage:
 *   npm run blog:generate         — generate post from blog-draft.md
 *   npm run blog:generate --dry   — preview the prompt without calling AI
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DRAFT_FILE = path.join(__dirname, 'blog-draft.md');
const BLOGS_DIR = path.join(__dirname, 'blogs');

// ── Load API key from .env.local ─────────────────────────────────
function loadApiKey() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const p = path.join(__dirname, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*(.+)/);
      if (match) return match[1].trim();
    }
  }
  console.error('\x1b[31mError:\x1b[0m GEMINI_API_KEY not found in .env.local or .env');
  process.exit(1);
}

// ── Parse the draft file ─────────────────────────────────────────
function parseDraft() {
  if (!fs.existsSync(DRAFT_FILE)) {
    console.error('\x1b[31mError:\x1b[0m blog-draft.md not found');
    console.error('  Create it with the template, then fill it in.');
    process.exit(1);
  }

  const raw = fs.readFileSync(DRAFT_FILE, 'utf8');
  const draft = {};

  // Extract title from "# title: ..."
  const titleMatch = raw.match(/^#\s*title:\s*(.+)$/m);
  draft.title = titleMatch ? titleMatch[1].trim() : 'Untitled Post';

  // Extract sections between ## headers
  const sections = ['tone', 'audience', 'tags', 'key_points', 'rough_draft'];
  for (const section of sections) {
    // Find this section header, then capture everything until next "## " header or EOF
    const headerIdx = raw.indexOf(`## ${section}`);
    if (headerIdx === -1) { draft[section] = ''; continue; }
    
    // Start after the header line
    const afterHeader = raw.indexOf('\n', headerIdx);
    if (afterHeader === -1) { draft[section] = ''; continue; }
    
    let content = raw.slice(afterHeader + 1);
    
    // Find next ## header (if any) and cut there
    const nextHeader = content.match(/^## \w/m);
    if (nextHeader) {
      content = content.slice(0, nextHeader.index);
    }
    
    // Strip HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    draft[section] = content.trim();
  }

  // Parse tags into array
  if (draft.tags) {
    draft.tagsArray = draft.tags.split(',').map(t => t.trim()).filter(Boolean);
  } else {
    draft.tagsArray = [];
  }

  return draft;
}

// ── Build the AI prompt ──────────────────────────────────────────
function buildPrompt(draft) {
  return `You are a skilled blog writer helping a 17-year-old student developer named Syed Sufiyan Hamza write blog posts for his portfolio website. He's from Titabar, Assam, India.

TASK: Write a complete, polished blog post based on the draft information below. The draft contains the author's rough notes, key points, and ideas — your job is to turn this into a well-written blog post that sounds like HIM, not like a generic AI.

TITLE: ${draft.title}
TONE: ${draft.tone || 'casual'}
TARGET AUDIENCE: ${draft.audience || 'general'}
TAGS: ${draft.tagsArray.join(', ')}

KEY POINTS THAT MUST BE COVERED:
${draft.key_points || '(none specified — use the rough draft for direction)'}

AUTHOR'S ROUGH DRAFT / NOTES:
${draft.rough_draft || '(minimal notes provided — be creative but stay on topic)'}

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

// ── Call Gemini API ──────────────────────────────────────────────
function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
      }
    });

    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    );

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`Gemini API error: ${json.error.message}`));
            return;
          }
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('No text in Gemini response. Full response:\n' + data));
            return;
          }
          resolve(text);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}\nRaw: ${data.slice(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Parse AI response ────────────────────────────────────────────
function parseAIResponse(text) {
  const startMatch = text.indexOf('---START---');
  const excerptMatch = text.indexOf('---EXCERPT---');
  const endMatch = text.indexOf('---END---');

  let contentBlock, excerpt;

  if (startMatch !== -1 && excerptMatch !== -1) {
    contentBlock = text.slice(startMatch + '---START---'.length, excerptMatch).trim();
    excerpt = text.slice(excerptMatch + '---EXCERPT---'.length, endMatch !== -1 ? endMatch : undefined).trim();
  } else {
    // Fallback: treat entire response as content
    contentBlock = text.replace(/---\w+---/g, '').trim();
    excerpt = contentBlock.split('\n\n')[0];
    if (excerpt.length > 160) excerpt = excerpt.slice(0, 157) + '...';
  }

  const paragraphs = contentBlock
    .split(/\n\s*\n/)
    .map(p => p.replace(/\r?\n/g, ' ').trim())
    .filter(p => p.length > 0);

  return { paragraphs, excerpt };
}

// ── Helpers ──────────────────────────────────────────────────────
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function readTime(text) {
  const words = text.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const isDry = process.argv.includes('--dry');

  console.log('');
  console.log('\x1b[36m◆ Blog Generator\x1b[0m');
  console.log('');
  console.log('  Reading blog-draft.md...');
  const draft = parseDraft();

  console.log(`  Title:    ${draft.title}`);
  console.log(`  Tone:     ${draft.tone || '(not set — defaulting to casual)'}`);
  console.log(`  Audience: ${draft.audience || '(not set — defaulting to general)'}`);
  console.log(`  Tags:     ${draft.tagsArray.join(', ') || '(none)'}`);
  console.log(`  Key pts:  ${draft.key_points ? draft.key_points.split('\n').filter(l => l.trim().startsWith('-')).length + ' points' : '(none)'}`);
  console.log(`  Draft:    ${draft.rough_draft ? draft.rough_draft.split(/\s+/).length + ' words' : '(empty!)'}`);
  console.log('');

  if (!draft.rough_draft || draft.rough_draft.length < 20) {
    console.error('\x1b[33m⚠ Warning:\x1b[0m rough_draft section is very short or empty.');
    console.error('  The AI needs context to write a good post. Add more notes to blog-draft.md.\n');
  }

  const prompt = buildPrompt(draft);

  if (isDry) {
    console.log('\x1b[33m── DRY RUN ── Prompt that would be sent to Gemini:\x1b[0m\n');
    console.log(prompt);
    console.log('\n\x1b[33m── END DRY RUN ──\x1b[0m');
    console.log('  Run without --dry to actually generate: npm run blog:generate\n');
    return;
  }

  const apiKey = loadApiKey();
  console.log('  Calling Gemini AI (gemini-2.5-flash)...');

  let aiText;
  try {
    aiText = await callGemini(apiKey, prompt);
  } catch (err) {
    console.error(`\n\x1b[31mError:\x1b[0m ${err.message}`);
    process.exit(1);
  }

  const { paragraphs, excerpt } = parseAIResponse(aiText);
  console.log(`\x1b[32m  ✓\x1b[0m AI generated ${paragraphs.length} paragraphs\n`);

  // Build the markdown output
  const slug = slugify(draft.title);
  const now = new Date();
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const date = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const markdown = `---
title: "${draft.title}"
date: "${date}"
tags: ${JSON.stringify(draft.tagsArray)}
---

${paragraphs.join('\n\n')}
`;

  // Save to blogs/
  if (!fs.existsSync(BLOGS_DIR)) fs.mkdirSync(BLOGS_DIR);
  const outPath = path.join(BLOGS_DIR, `${slug}.md`);

  if (fs.existsSync(outPath)) {
    const backup = outPath.replace('.md', `.backup-${Date.now()}.md`);
    fs.renameSync(outPath, backup);
    console.log(`  \x1b[33m⚠\x1b[0m Existing file backed up → ${path.basename(backup)}`);
  }

  fs.writeFileSync(outPath, markdown, 'utf8');

  console.log(`  \x1b[32m✓\x1b[0m Saved:   blogs/${slug}.md`);
  console.log(`  Excerpt: ${excerpt}`);
  console.log('');
  console.log('  \x1b[90mNext steps:\x1b[0m');
  console.log(`    1. Review/edit  blogs/${slug}.md`);
  console.log('    2. Run:  npm run blogs        (compile → blogData.ts)');
  console.log('    3. Run:  npm run build         (builds site)');
  console.log('    — or just:  npm run build      (auto-compiles blogs first)');
  console.log('');
}

main();
