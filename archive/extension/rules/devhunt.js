window.BLASTOFF_RULES = window.BLASTOFF_RULES || {};

window.BLASTOFF_RULES.devhunt = {
  slug: 'devhunt',
  name: 'DevHunt',
  match: () => location.hostname === 'devhunt.org' && (
    document.querySelector('input[name="tool_name"]') ||
    document.querySelector('input[name="slogan"]') ||
    /launch.*tool/i.test(document.querySelector('h1, h2')?.textContent || '')
  ),
  fields: [
    { key: 'name',        selector: 'input[name="tool_name"]',         from: p => p.name },
    { key: 'slogan',      selector: 'input[name="slogan"]',            from: p => p.tagline || p.tagline_80 },
    { key: 'tool_website',selector: 'input[name="tool_website"]',      from: p => p.url },
    { key: 'github_repo', selector: 'input[name="github_repo"]',       from: p => p.github_url },
    { key: 'description', selector: 'textarea[name="tool_description"]', from: p => p.long_description || p.description },
    { key: 'demo_video',  selector: 'input[name="demo_video"]',        from: p => null },
  ],
  pricing: {
    selector: 'input[name="pricing-type"]',
    from: p => p.pricing,
  },
  unfillable: [
    { label: 'Logo upload',       reason: 'file input — Chrome blocks programmatic file selection' },
    { label: 'Screenshots (3+)',  reason: 'file input — upload manually after autofill' },
    { label: 'Launch week',       reason: 'depends on free/paid availability — pick yourself' },
    { label: 'Tool categories',   reason: 'multi-select autocomplete — picks vary, do manually' },
  ],
};
