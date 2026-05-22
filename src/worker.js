import Anthropic from '@anthropic-ai/sdk';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // MCP server (JSON-RPC 2.0 over POST)
    if (url.pathname === '/mcp') {
      return handleMCP(request, env);
    }

    // MCP server card for client auto-discovery
    if (url.pathname === '/.well-known/mcp/server-card.json') {
      return Response.json(MCP_SERVER_CARD, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      try {
        const response = await handleAPI(url.pathname, request, env);
        // Add CORS headers to response
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
        return new Response(response.body, { status: response.status, headers });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Static assets
    return env.ASSETS.fetch(request);
  }
};

async function handleAPI(path, request, env) {
  // Extract product info from a URL
  if (path === '/api/extract' && request.method === 'POST') {
    const { url } = await request.json();
    if (!url) return Response.json({ error: 'URL required' }, { status: 400 });

    const product = await extractFromURL(url, env);
    return Response.json(product);
  }

  // Save a product (upsert by URL — same URL returns existing id, never duplicates)
  if (path === '/api/products' && request.method === 'POST') {
    const data = await request.json();
    const normalizedUrl = normalizeUrl(data.url);
    if (!normalizedUrl) return Response.json({ error: 'URL required' }, { status: 400 });

    const existing = await env.DB.prepare('SELECT id FROM products WHERE url = ?').bind(normalizedUrl).first();
    if (existing) {
      return Response.json({ id: existing.id, existed: true });
    }

    const n = (v) => (v === undefined ? null : v);
    const result = await env.DB.prepare(`
      INSERT INTO products (url, name, tagline, tagline_80, tagline_140, description, long_description, logo_url, screenshot_url, pricing, category, tags, founder_name, founder_email, twitter_url, github_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      normalizedUrl, n(data.name), n(data.tagline), n(data.tagline_80), n(data.tagline_140),
      n(data.description), n(data.long_description),
      n(data.logo_url), n(data.screenshot_url), n(data.pricing), n(data.category), n(data.tags),
      n(data.founder_name), n(data.founder_email), n(data.twitter_url), n(data.github_url)
    ).run();

    // Create submission entries for all active directories
    const productId = result.meta.last_row_id;
    const dirs = await env.DB.prepare('SELECT id FROM directories WHERE status = ?').bind('active').all();
    for (const dir of dirs.results) {
      await env.DB.prepare('INSERT INTO submissions (product_id, directory_id) VALUES (?, ?)').bind(productId, dir.id).run();
    }

    return Response.json({ id: productId, existed: false });
  }

  // List products
  if (path === '/api/products' && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return Response.json(results.map(parseProduct));
  }

  // Get single product with submission status
  if (path.match(/^\/api\/products\/\d+$/) && request.method === 'GET') {
    const id = path.split('/').pop();
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!product) return Response.json({ error: 'Not found' }, { status: 404 });

    const { results: submissions } = await env.DB.prepare(`
      SELECT s.*, d.name as directory_name, d.url as directory_url, d.submit_url, d.category as directory_category, d.priority, d.approval_type, d.avg_approval_days
      FROM submissions s
      JOIN directories d ON s.directory_id = d.id
      WHERE s.product_id = ?
      ORDER BY d.priority DESC
    `).bind(id).all();

    // Get field requirements per directory
    const { results: fields } = await env.DB.prepare(`
      SELECT df.*, d.name as directory_name
      FROM directory_fields df
      JOIN directories d ON df.directory_id = d.id
    `).all();

    return Response.json({ product: parseProduct(product), submissions, fields });
  }

  // Update product
  if (path.match(/^\/api\/products\/\d+$/) && request.method === 'PUT') {
    const id = path.split('/').pop();
    const data = await request.json();
    const n = (v) => (v === undefined ? null : v);
    await env.DB.prepare(`
      UPDATE products SET
        name = ?, tagline = ?, tagline_80 = ?, tagline_140 = ?,
        description = ?, long_description = ?,
        logo_url = ?, screenshot_url = ?, pricing = ?, category = ?,
        tags = ?, founder_name = ?, founder_email = ?, twitter_url = ?,
        github_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      n(data.name), n(data.tagline), n(data.tagline_80), n(data.tagline_140),
      n(data.description), n(data.long_description),
      n(data.logo_url), n(data.screenshot_url), n(data.pricing), n(data.category),
      n(data.tags), n(data.founder_name), n(data.founder_email), n(data.twitter_url),
      n(data.github_url), id
    ).run();
    return Response.json({ ok: true });
  }

  // Regenerate a single field at a given char limit
  if (path === '/api/regenerate' && request.method === 'POST') {
    const { product_id, field, char_limit } = await request.json();
    if (!product_id || !field) {
      return Response.json({ error: 'product_id and field required' }, { status: 400 });
    }
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(product_id).first();
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

    const value = await regenerateField(product, field, char_limit, env);
    return Response.json({ field, value });
  }

  // Update submission status
  if (path.match(/^\/api\/submissions\/\d+$/) && request.method === 'PUT') {
    const id = path.split('/').pop();
    const { status, listing_url, notes } = await request.json();
    const updates = [];
    const binds = [];

    if (status) { updates.push('status = ?'); binds.push(status); }
    if (status === 'submitted') { updates.push('submitted_at = CURRENT_TIMESTAMP'); }
    if (status === 'approved') { updates.push('approved_at = CURRENT_TIMESTAMP'); }
    if (listing_url) { updates.push('listing_url = ?'); binds.push(listing_url); }
    if (notes) { updates.push('notes = ?'); binds.push(notes); }

    binds.push(id);
    await env.DB.prepare(`UPDATE submissions SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
    return Response.json({ ok: true });
  }

  // List directories
  if (path === '/api/directories' && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM directories WHERE status = ? ORDER BY priority DESC').bind('active').all();
    return Response.json(results);
  }

  // Upload a screenshot to R2 and attach to a product
  if (path === '/api/upload' && request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('file');
    const productId = formData.get('product_id');
    if (!file || !productId) {
      return Response.json({ error: 'file and product_id required' }, { status: 400 });
    }
    const contentType = file.type || 'image/png';
    if (!contentType.startsWith('image/')) {
      return Response.json({ error: 'Only image uploads allowed' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const ext = (file.name || '').split('.').pop()?.toLowerCase() || 'png';
    const key = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    await env.SCREENSHOTS.put(key, arrayBuffer, { httpMetadata: { contentType } });

    const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;
    const product = await env.DB.prepare('SELECT screenshots FROM products WHERE id = ?').bind(productId).first();
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

    let shots = [];
    try { shots = JSON.parse(product.screenshots || '[]'); } catch { shots = []; }
    shots.push(publicUrl);
    await env.DB.prepare('UPDATE products SET screenshots = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(shots), productId).run();

    return Response.json({ url: publicUrl, key, screenshots: shots });
  }

  // Remove a screenshot from a product's screenshots array (does not delete from R2)
  if (path === '/api/upload' && request.method === 'DELETE') {
    const { product_id, url } = await request.json();
    if (!product_id || !url) return Response.json({ error: 'product_id and url required' }, { status: 400 });
    const product = await env.DB.prepare('SELECT screenshots FROM products WHERE id = ?').bind(product_id).first();
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    let shots = [];
    try { shots = JSON.parse(product.screenshots || '[]'); } catch { shots = []; }
    shots = shots.filter(u => u !== url);
    await env.DB.prepare('UPDATE products SET screenshots = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(shots), product_id).run();
    return Response.json({ screenshots: shots });
  }

  // Lean product profile by URL — for the Chrome extension to read on directory submit pages
  if (path === '/api/profile' && request.method === 'GET') {
    const productUrl = new URL(request.url).searchParams.get('url');
    if (!productUrl) return Response.json({ error: 'url required' }, { status: 400 });

    const normalized = normalizeUrl(productUrl);
    const product = await env.DB.prepare('SELECT * FROM products WHERE url = ?').bind(normalized).first();
    if (!product) return Response.json({ error: 'Product not found. Extract it first at /' }, { status: 404 });

    return Response.json(parseProduct(product));
  }

  // Cockpit: product + all directories with readiness + submissions
  if (path === '/api/cockpit' && request.method === 'GET') {
    const productUrl = new URL(request.url).searchParams.get('url');
    if (!productUrl) return Response.json({ error: 'url required' }, { status: 400 });

    const normalized = normalizeUrl(productUrl);
    const product = await env.DB.prepare('SELECT * FROM products WHERE url = ?').bind(normalized).first();
    if (!product) return Response.json({ error: 'Product not found. Extract it first at /' }, { status: 404 });

    const { results: directories } = await env.DB.prepare(`
      SELECT id, slug, name, url, submit_url, ease, ease_reason, description, auth_type, has_captcha, is_free, approval_type, avg_approval_days
      FROM directories
      WHERE status = 'active'
      ORDER BY CASE ease WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 ELSE 4 END, name
    `).all();

    const { results: allFields } = await env.DB.prepare(`
      SELECT directory_id, field_name, field_label, is_required, max_length, dropdown_values, selector, notes
      FROM directory_fields
      ORDER BY directory_id, field_order
    `).all();

    const { results: submissions } = await env.DB.prepare(`
      SELECT id, directory_id, status, submitted_at, approved_at, listing_url, notes
      FROM submissions
      WHERE product_id = ?
    `).bind(product.id).all();

    const fieldsByDir = {};
    for (const f of allFields) {
      if (!fieldsByDir[f.directory_id]) fieldsByDir[f.directory_id] = [];
      fieldsByDir[f.directory_id].push(f);
    }
    const submissionByDir = {};
    for (const s of submissions) submissionByDir[s.directory_id] = s;

    const isFilled = (v) => v !== null && v !== undefined && String(v).trim().length > 0;

    const directoriesEnriched = directories.map(d => {
      const fields = fieldsByDir[d.id] || [];
      const required = fields.filter(f => f.is_required === 1);
      const filled = required.filter(f => isFilled(product[f.field_name]));
      const sub = submissionByDir[d.id];
      const isDone = sub && (sub.status === 'submitted' || sub.status === 'approved');

      return {
        id: d.id,
        slug: d.slug,
        name: d.name,
        url: d.url,
        submit_url: d.submit_url,
        ease: d.ease,
        ease_reason: d.ease_reason,
        description: d.description,
        auth_type: d.auth_type,
        has_captcha: d.has_captcha === 1,
        is_free: d.is_free === 1,
        fields_total: required.length,
        fields_ready: filled.length,
        missing_fields: required.filter(f => !isFilled(product[f.field_name])).map(f => f.field_name),
        all_fields: fields,
        submission: sub || null,
        is_done: !!isDone,
      };
    });

    return Response.json({ product: parseProduct(product), directories: directoriesEnriched });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}

// Extract product info from a URL by fetching and parsing meta/body, then AI fills gaps
async function extractFromURL(targetUrl, env) {
  let html = '';
  let fetchError = '';

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      redirect: 'follow',
    });
    html = await response.text();
  } catch (err) {
    fetchError = err.message;
  }

  // --- Step 1: Regex extraction from HTML ---
  let scraped = { url: targetUrl };

  if (html) {
    function getMeta(attr, value) {
      const p1 = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i');
      const p2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, 'i');
      const m1 = html.match(p1);
      if (m1) return decodeHTMLEntities(m1[1].trim());
      const m2 = html.match(p2);
      if (m2) return decodeHTMLEntities(m2[1].trim());
      return '';
    }

    function getTag(pattern) {
      const match = html.match(pattern);
      return match ? decodeHTMLEntities(match[1].trim()) : '';
    }

    const ogTitle = getMeta('property', 'og:title');
    const ogDesc = getMeta('property', 'og:description');
    const ogImage = getMeta('property', 'og:image');
    const ogSiteName = getMeta('property', 'og:site_name');
    const metaDesc = getMeta('name', 'description');
    const twitterTitle = getMeta('name', 'twitter:title') || getMeta('property', 'twitter:title');
    const twitterDesc = getMeta('name', 'twitter:description') || getMeta('property', 'twitter:description');
    const twitterImage = getMeta('name', 'twitter:image') || getMeta('property', 'twitter:image');
    const keywords = getMeta('name', 'keywords');
    const author = getMeta('name', 'author');
    const title = getTag(/<title[^>]*>([^<]+)<\/title>/i);
    const h1 = getTag(/<h1[^>]*>([^<]+)<\/h1>/i);
    const paragraphs = [...html.matchAll(/<p[^>]*>([^<]{20,})<\/p>/gi)].map(m => decodeHTMLEntities(m[1].trim()));
    const favicon = getTag(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i)
      || getTag(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i);
    const twitterLink = getTag(/href=["'](https?:\/\/(?:twitter\.com|x\.com)\/[^"']+)["']/i);
    const githubLink = getTag(/href=["'](https?:\/\/github\.com\/[^"']+)["']/i);

    let name = ogTitle || twitterTitle || ogSiteName || title || h1 || '';
    name = name.replace(/\s*[|\-–—]\s*[^|\-–—]+$/, '').trim();

    const description = ogDesc || twitterDesc || metaDesc || paragraphs[0] || '';
    const image = ogImage || twitterImage || '';

    const baseUrl = new URL(targetUrl);
    const resolveUrl = (u) => {
      if (!u) return '';
      try { return new URL(u, baseUrl).href; } catch { return u; }
    };

    scraped = {
      url: targetUrl,
      name,
      tagline: '',
      description,
      long_description: paragraphs.slice(0, 3).join('\n\n'),
      logo_url: resolveUrl(favicon),
      screenshot_url: resolveUrl(image),
      pricing: '',
      category: '',
      tags: keywords,
      founder_name: author,
      founder_email: '',
      twitter_url: twitterLink,
      github_url: githubLink,
    };
  }

  // --- Step 2: AI agent fills in gaps ---
  // Detect Cloudflare error pages and clear bad scraped data
  const isErrorPage = html.includes('Error code:') || html.includes('error code: 1042') || html.includes('522: Connection timed out');
  if (isErrorPage) {
    scraped = { url: targetUrl, name: '', tagline: '', description: '', long_description: '', logo_url: '', screenshot_url: '', pricing: '', category: '', tags: '', founder_name: '', founder_email: '', twitter_url: '', github_url: '' };
    fetchError = 'Cloudflare same-account Worker fetch blocked (error 1042)';
  }

  // Strip HTML to plain text for AI (keep it under 4000 chars)
  const plainText = isErrorPage ? '' : html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000);

  // Always run AI for the tagline variants + long_description — the variants are core value
  if (plainText || fetchError) {
    try {
      const prompt = `You are a product analyst writing copy for launch directory submissions.

URL: ${targetUrl}
${fetchError || plainText.includes('Error code:') ? `Note: Could not fetch the page content (likely a same-network restriction). Ignore any error page content below. Use your knowledge of this URL/product to generate the best possible listing info.` : ''}

Page content:
${plainText || '(could not fetch page content)'}

Already extracted:
- Name: ${scraped.name || '(missing)'}
- Description: ${scraped.description || '(missing)'}

Return a JSON object with ONLY these fields. Every tagline variant must be a complete sentence under its character limit — count characters carefully:
{
  "name": "Product name (short, no tagline)",
  "tagline_60": "Tagline under 60 chars (Product Hunt limit)",
  "tagline_80": "Tagline under 80 chars (Hacker News Show HN title limit)",
  "tagline_140": "Tagline under 140 chars (BetaList one-sentence pitch)",
  "description": "2-3 sentence description, under 260 chars (Product Hunt card)",
  "long_description": "Detailed 2-paragraph description of the product, what it does, who it's for",
  "category": "One of: SaaS, Developer Tool, AI Tool, Marketplace, Productivity, Design, Analytics, Marketing, Communication, Other",
  "tags": "comma-separated relevant tags (5-8 tags)",
  "pricing": "Free, Freemium, Paid, or specific pricing info"
}`;

      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      const aiResponse = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      });

      const aiText = aiResponse.content[0]?.text || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        if (!scraped.name && aiData.name) scraped.name = aiData.name;
        if (aiData.tagline_60) scraped.tagline = trimToLimit(aiData.tagline_60, 60);
        if (aiData.tagline_80) scraped.tagline_80 = trimToLimit(aiData.tagline_80, 80);
        if (aiData.tagline_140) scraped.tagline_140 = trimToLimit(aiData.tagline_140, 140);
        if (aiData.description) scraped.description = trimToLimit(aiData.description, 260);
        if (aiData.long_description) scraped.long_description = aiData.long_description;
        if (!scraped.category && aiData.category) scraped.category = aiData.category;
        if (!scraped.tags && aiData.tags) scraped.tags = aiData.tags;
        if (!scraped.pricing && aiData.pricing) scraped.pricing = aiData.pricing;
      }
    } catch (aiErr) {
      scraped._ai_error = aiErr.message;
    }
  }

  // Belt-and-braces fallback: derive 60 from description if AI dropped it
  if (!scraped.tagline && scraped.description) {
    let tagline = scraped.description;
    const firstSentence = tagline.match(/^[^.!?]+[.!?]/);
    if (firstSentence) tagline = firstSentence[0];
    scraped.tagline = trimToLimit(tagline, 60);
  }

  if (fetchError && !scraped._ai_error) scraped._fetch_note = 'Page fetch failed, data generated by AI from URL context';

  return scraped;
}

function parseProduct(p) {
  if (!p) return p;
  let screenshots = [];
  try { screenshots = JSON.parse(p.screenshots || '[]'); if (!Array.isArray(screenshots)) screenshots = []; } catch { screenshots = []; }
  return { ...p, screenshots };
}

function normalizeUrl(raw) {
  if (!raw) return '';
  let input = raw.trim();
  if (!/^https?:\/\//i.test(input)) input = 'https://' + input;
  try {
    const u = new URL(input);
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
    u.hash = '';
    if (u.pathname === '/') u.pathname = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return raw.trim();
  }
}

function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function trimToLimit(str, limit) {
  if (!str) return '';
  const s = str.trim();
  if (s.length <= limit) return s;
  const cut = s.substring(0, limit - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > limit * 0.6 ? cut.substring(0, lastSpace) : cut).replace(/[.,;:!?-]+$/, '') + '…';
}

const FIELD_SPECS = {
  tagline: { label: 'tagline', limit: 60, voice: 'punchy, one-line pitch, no period at end' },
  tagline_80: { label: 'tagline', limit: 80, voice: 'one-line pitch, room for a verb + benefit' },
  tagline_140: { label: 'tagline', limit: 140, voice: 'one full sentence pitch with a hook' },
  description: { label: 'short description', limit: 260, voice: '2-3 sentences for a launch card' },
  long_description: { label: 'long description', limit: 1200, voice: '2 short paragraphs: what it does, who it is for' },
};

async function regenerateField(product, field, charLimit, env) {
  const spec = FIELD_SPECS[field];
  if (!spec) throw new Error(`Unsupported field: ${field}`);
  const limit = charLimit || spec.limit;

  const context = [
    `Product: ${product.name || 'Unnamed'}`,
    product.url ? `URL: ${product.url}` : null,
    product.tagline ? `Current 60-char tagline: ${product.tagline}` : null,
    product.description ? `Short description: ${product.description}` : null,
    product.long_description ? `Long description: ${product.long_description}` : null,
    product.category ? `Category: ${product.category}` : null,
    product.tags ? `Tags: ${product.tags}` : null,
    product.pricing ? `Pricing: ${product.pricing}` : null,
  ].filter(Boolean).join('\n');

  const prompt = `You are writing launch directory copy. Generate a single ${spec.label} for this product under ${limit} characters. Voice: ${spec.voice}. Return ONLY the text — no quotes, no JSON, no preamble.

${context}

Write the ${spec.label} now (under ${limit} chars):`;

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const aiResponse = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  let text = (aiResponse.content[0]?.text || '').trim();
  text = text.replace(/^["']|["']$/g, '').trim();
  return trimToLimit(text, limit);
}

// ─────────────────────────────────────────────────────────────
// MCP SERVER (JSON-RPC 2.0)
// ─────────────────────────────────────────────────────────────

const MCP_SERVER_CARD = {
  name: 'blastoff',
  version: '0.1.0',
  description: 'Submit your product to 30 launch directories from inside your AI agent. Get profile + directory recipes + AI-generated copy variants as MCP tools; the agent drives the browser.',
  vendor: { name: 'TinyBuild Studio', url: 'https://blastoff.tinybuild.workers.dev' },
  transport: { type: 'http', url: 'https://blastoff.tinybuild.workers.dev/mcp' },
  capabilities: { tools: true, resources: false, prompts: false },
};

const MCP_TOOLS = [
  {
    name: 'get_profile',
    description: 'Get a saved product profile by URL. Returns name, taglines at 60/80/140 char lengths, descriptions, pricing, category, tags, founder fields. Profile must be extracted first via extract_from_url or the BlastOff dashboard.',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'Product website URL' } },
      required: ['url'],
    },
  },
  {
    name: 'list_directories',
    description: 'List all 30 supported launch directories with ease tier (easy/medium/hard), auth model, captcha presence, free/paid status, and average approval days. Use to pick which directories a product can submit to today.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_recipe',
    description: 'Get the full submission recipe for a directory by slug. Returns submit URL, field list with selectors + max lengths + dropdown values, gotchas, and unfillable fields. The agent uses this to drive Playwright MCP or chrome-devtools MCP.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'Directory slug like "devhunt", "product-hunt", "alternativeto" (kebab-case)' } },
      required: ['slug'],
    },
  },
  {
    name: 'generate_variants',
    description: 'Generate or regenerate a copy variant for a product field at a specific character limit. Use to fit Product Hunt (60 char tagline), Hacker News (80 char title), BetaList (140 char one-liner), or the 260-char card description. Returns the new value; does NOT save it.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Product URL' },
        field: { type: 'string', enum: ['tagline', 'tagline_80', 'tagline_140', 'description', 'long_description'], description: 'Which field to regenerate' },
        char_limit: { type: 'number', description: 'Optional override for the default char limit of the field' },
      },
      required: ['url', 'field'],
    },
  },
  {
    name: 'extract_from_url',
    description: 'Run the full extractor on a product URL: scrapes the page, fills gaps with AI (name, tagline variants, description, category, tags, pricing), creates or updates the product in BlastOff. Returns the saved profile. Costs Claude tokens — expensive call.',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'Product website URL' } },
      required: ['url'],
    },
  },
  {
    name: 'mark_submitted',
    description: 'Mark a submission as completed after the user submits the form. Updates the submission row to status=submitted with the current timestamp and optional listing URL.',
    inputSchema: {
      type: 'object',
      properties: {
        product_url: { type: 'string', description: 'Product URL the submission belongs to' },
        directory_slug: { type: 'string', description: 'Directory slug like "devhunt"' },
        listing_url: { type: 'string', description: 'Optional URL of the published listing' },
      },
      required: ['product_url', 'directory_slug'],
    },
  },
];

async function handleMCP(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (request.method !== 'POST') {
    return Response.json({ jsonrpc: '2.0', error: { code: -32600, message: 'POST only' } }, { status: 405, headers: corsHeaders });
  }

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }, { status: 400, headers: corsHeaders }); }

  const { id, method, params } = body;
  const reply = (result) => Response.json({ jsonrpc: '2.0', id, result }, { headers: corsHeaders });
  const fail = (code, message) => Response.json({ jsonrpc: '2.0', id, error: { code, message } }, { headers: corsHeaders });

  try {
    if (method === 'initialize') {
      return reply({
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: MCP_SERVER_CARD.name, version: MCP_SERVER_CARD.version },
      });
    }

    if (method === 'tools/list') {
      return reply({ tools: MCP_TOOLS });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      const result = await callMCPTool(name, args || {}, env);
      return reply({
        content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }],
      });
    }

    return fail(-32601, `Method not found: ${method}`);
  } catch (err) {
    return reply({
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    });
  }
}

async function callMCPTool(name, args, env) {
  if (name === 'get_profile') {
    const normalized = normalizeUrl(args.url);
    const product = await env.DB.prepare('SELECT * FROM products WHERE url = ?').bind(normalized).first();
    if (!product) throw new Error(`Product not found for ${args.url}. Run extract_from_url first.`);
    return parseProduct(product);
  }

  if (name === 'list_directories') {
    const { results } = await env.DB.prepare(`
      SELECT id, slug, name, url, submit_url, ease, ease_reason, description, auth_type, has_captcha, is_free, approval_type, avg_approval_days
      FROM directories WHERE status = 'active'
      ORDER BY CASE ease WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 ELSE 4 END, name
    `).all();
    return { count: results.length, directories: results };
  }

  if (name === 'get_recipe') {
    const dir = await env.DB.prepare('SELECT * FROM directories WHERE slug = ?').bind(args.slug).first();
    if (!dir) throw new Error(`Directory not found: ${args.slug}. Use list_directories for available slugs.`);
    const { results: fields } = await env.DB.prepare(`
      SELECT field_name, field_label, is_required, max_length, dropdown_values, selector, notes, field_order
      FROM directory_fields WHERE directory_id = ? ORDER BY field_order, id
    `).bind(dir.id).all();
    return {
      slug: dir.slug,
      name: dir.name,
      submit_url: dir.submit_url,
      ease: dir.ease,
      ease_reason: dir.ease_reason,
      auth_type: dir.auth_type,
      has_captcha: dir.has_captcha === 1,
      is_free: dir.is_free === 1,
      approval_type: dir.approval_type,
      avg_approval_days: dir.avg_approval_days,
      fields: fields.map(f => ({
        name: f.field_name,
        label: f.field_label,
        required: f.is_required === 1,
        max_length: f.max_length,
        selector: f.selector,
        dropdown_values: f.dropdown_values,
        notes: f.notes,
      })),
    };
  }

  if (name === 'generate_variants') {
    const normalized = normalizeUrl(args.url);
    const product = await env.DB.prepare('SELECT * FROM products WHERE url = ?').bind(normalized).first();
    if (!product) throw new Error(`Product not found for ${args.url}. Run extract_from_url first.`);
    const value = await regenerateField(product, args.field, args.char_limit, env);
    return { field: args.field, value };
  }

  if (name === 'extract_from_url') {
    const product = await extractFromURL(args.url, env);
    const normalized = normalizeUrl(args.url);
    const n = (v) => (v === undefined ? null : v);
    const existing = await env.DB.prepare('SELECT id FROM products WHERE url = ?').bind(normalized).first();
    if (existing) {
      await env.DB.prepare(`
        UPDATE products SET name=?, tagline=?, tagline_80=?, tagline_140=?, description=?, long_description=?,
          logo_url=?, screenshot_url=?, pricing=?, category=?, tags=?, founder_name=?, founder_email=?,
          twitter_url=?, github_url=?, updated_at=CURRENT_TIMESTAMP WHERE url=?
      `).bind(
        n(product.name), n(product.tagline), n(product.tagline_80), n(product.tagline_140),
        n(product.description), n(product.long_description),
        n(product.logo_url), n(product.screenshot_url), n(product.pricing), n(product.category),
        n(product.tags), n(product.founder_name), n(product.founder_email),
        n(product.twitter_url), n(product.github_url), normalized
      ).run();
    } else {
      const result = await env.DB.prepare(`
        INSERT INTO products (url, name, tagline, tagline_80, tagline_140, description, long_description, logo_url, screenshot_url, pricing, category, tags, founder_name, founder_email, twitter_url, github_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        normalized, n(product.name), n(product.tagline), n(product.tagline_80), n(product.tagline_140),
        n(product.description), n(product.long_description),
        n(product.logo_url), n(product.screenshot_url), n(product.pricing), n(product.category),
        n(product.tags), n(product.founder_name), n(product.founder_email), n(product.twitter_url), n(product.github_url)
      ).run();
      const productId = result.meta.last_row_id;
      const dirs = await env.DB.prepare('SELECT id FROM directories WHERE status = ?').bind('active').all();
      for (const dir of dirs.results) {
        await env.DB.prepare('INSERT INTO submissions (product_id, directory_id) VALUES (?, ?)').bind(productId, dir.id).run();
      }
    }
    return product;
  }

  if (name === 'mark_submitted') {
    const normalized = normalizeUrl(args.product_url);
    const product = await env.DB.prepare('SELECT id FROM products WHERE url = ?').bind(normalized).first();
    if (!product) throw new Error(`Product not found for ${args.product_url}`);
    const dir = await env.DB.prepare('SELECT id FROM directories WHERE slug = ?').bind(args.directory_slug).first();
    if (!dir) throw new Error(`Directory not found: ${args.directory_slug}`);
    const updates = ['status = ?', 'submitted_at = CURRENT_TIMESTAMP'];
    const binds = ['submitted'];
    if (args.listing_url) { updates.push('listing_url = ?'); binds.push(args.listing_url); }
    binds.push(product.id, dir.id);
    await env.DB.prepare(`UPDATE submissions SET ${updates.join(', ')} WHERE product_id = ? AND directory_id = ?`).bind(...binds).run();
    return { ok: true, product_url: args.product_url, directory_slug: args.directory_slug, status: 'submitted' };
  }

  throw new Error(`Unknown tool: ${name}`);
}
