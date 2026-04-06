export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

    const product = await extractFromURL(url);
    return Response.json(product);
  }

  // Save a product
  if (path === '/api/products' && request.method === 'POST') {
    const data = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO products (url, name, tagline, description, long_description, logo_url, screenshot_url, pricing, category, tags, founder_name, founder_email, twitter_url, github_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.url, data.name, data.tagline, data.description, data.long_description,
      data.logo_url, data.screenshot_url, data.pricing, data.category, data.tags,
      data.founder_name, data.founder_email, data.twitter_url, data.github_url
    ).run();

    // Create submission entries for all active directories
    const productId = result.meta.last_row_id;
    const dirs = await env.DB.prepare('SELECT id FROM directories WHERE status = ?').bind('active').all();
    for (const dir of dirs.results) {
      await env.DB.prepare('INSERT INTO submissions (product_id, directory_id) VALUES (?, ?)').bind(productId, dir.id).run();
    }

    return Response.json({ id: productId });
  }

  // List products
  if (path === '/api/products' && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return Response.json(results);
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

    return Response.json({ product, submissions, fields });
  }

  // Update product
  if (path.match(/^\/api\/products\/\d+$/) && request.method === 'PUT') {
    const id = path.split('/').pop();
    const data = await request.json();
    await env.DB.prepare(`
      UPDATE products SET
        name = ?, tagline = ?, description = ?, long_description = ?,
        logo_url = ?, screenshot_url = ?, pricing = ?, category = ?,
        tags = ?, founder_name = ?, founder_email = ?, twitter_url = ?,
        github_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.name, data.tagline, data.description, data.long_description,
      data.logo_url, data.screenshot_url, data.pricing, data.category,
      data.tags, data.founder_name, data.founder_email, data.twitter_url,
      data.github_url, id
    ).run();
    return Response.json({ ok: true });
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

  return Response.json({ error: 'Not found' }, { status: 404 });
}

// Extract product info from a URL by fetching and parsing meta tags
async function extractFromURL(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlastOff/1.0)' },
      redirect: 'follow',
    });

    const html = await response.text();

    const get = (pattern) => {
      const match = html.match(pattern);
      return match ? decodeHTMLEntities(match[1].trim()) : '';
    };

    // Extract meta tags
    const ogTitle = get(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDesc = get(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImage = get(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const metaDesc = get(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const title = get(/<title[^>]*>([^<]+)<\/title>/i);
    const twitterTitle = get(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
    const twitterDesc = get(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
    const twitterImage = get(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    const keywords = get(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);

    // Try to find favicon/logo
    const favicon = get(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);

    // Build product name — prefer og:title, fall back to title tag, clean up
    let name = ogTitle || twitterTitle || title || '';
    // Strip common suffixes like " | Company" or " - Company"
    name = name.replace(/\s*[|\-–—]\s*[^|\-–—]+$/, '').trim();

    const description = ogDesc || twitterDesc || metaDesc || '';
    const image = ogImage || twitterImage || '';

    // Generate a tagline from the description (first sentence, max 60 chars)
    let tagline = description;
    const firstSentence = description.match(/^[^.!?]+[.!?]/);
    if (firstSentence) tagline = firstSentence[0];
    if (tagline.length > 60) tagline = tagline.substring(0, 57) + '...';

    // Resolve relative URLs
    const baseUrl = new URL(targetUrl);
    const resolveUrl = (u) => {
      if (!u) return '';
      try { return new URL(u, baseUrl).href; } catch { return u; }
    };

    return {
      url: targetUrl,
      name,
      tagline,
      description,
      long_description: '',
      logo_url: resolveUrl(favicon),
      screenshot_url: resolveUrl(image),
      pricing: '',
      category: '',
      tags: keywords,
      founder_name: '',
      founder_email: '',
      twitter_url: '',
      github_url: '',
    };
  } catch (err) {
    return {
      url: targetUrl,
      name: '',
      tagline: '',
      description: '',
      long_description: '',
      logo_url: '',
      screenshot_url: '',
      pricing: '',
      category: '',
      tags: '',
      founder_name: '',
      founder_email: '',
      twitter_url: '',
      github_url: '',
      _error: err.message,
    };
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
